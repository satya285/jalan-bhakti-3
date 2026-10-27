-- ==============================================================================
-- CETAK BIRU DATABASE SUPABASE POSTGRESQL - SISTEM ORDERING JALAN BHAKTI 3
-- Domain Target: order.heragandhi.web.id
-- ==============================================================================

-- 1. HAPUS TABEL/VIEW JIKA ADA (UNTUK RE-INITIALIZATION BERSIH)
DROP VIEW IF EXISTS view_pelanggan_loyalti CASCADE;
DROP VIEW IF EXISTS view_rekap_dapur CASCADE;
DROP TABLE IF EXISTS pembayaran CASCADE;
DROP TABLE IF EXISTS detail_pesanan CASCADE;
DROP TABLE IF EXISTS pesanan CASCADE;
DROP TABLE IF EXISTS pelanggan CASCADE;
DROP TABLE IF EXISTS menu_item CASCADE;

-- 2. TABEL: pelanggan (Modul CRM)
CREATE TABLE pelanggan (
    no_wa VARCHAR(25) PRIMARY KEY,
    nama_pelanggan VARCHAR(100) NOT NULL,
    alamat_default TEXT,
    total_order INTEGER DEFAULT 0,
    total_belanja BIGINT DEFAULT 0,
    terakhir_pesan TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pencarian no_wa & nama
CREATE INDEX idx_pelanggan_nama ON pelanggan(nama_pelanggan);

-- 3. TABEL: pesanan (Modul Transaksi Utama)
CREATE TABLE pesanan (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_wa VARCHAR(25) NOT NULL REFERENCES pelanggan(no_wa) ON DELETE RESTRICT,
    waktu_pesan TIMESTAMPTZ DEFAULT NOW(),
    jadwal_pengiriman DATE NOT NULL,
    alamat_pengiriman TEXT NOT NULL,
    link_gmaps TEXT,
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    ongkir INTEGER DEFAULT 0 CHECK (ongkir >= 0),
    kode_unik INTEGER NOT NULL CHECK (kode_unik BETWEEN 1 AND 999),
    grand_total INTEGER NOT NULL CHECK (grand_total >= 0),
    status_pesanan VARCHAR(30) DEFAULT 'Menunggu Pembayaran' 
        CHECK (status_pesanan IN ('Menunggu Pembayaran', 'Lunas', 'Diproses', 'Siap Kirim', 'Selesai', 'Dibatalkan')),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk filter status dan tanggal pengiriman
CREATE INDEX idx_pesanan_status ON pesanan(status_pesanan);
CREATE INDEX idx_pesanan_jadwal ON pesanan(jadwal_pengiriman);
CREATE INDEX idx_pesanan_no_wa ON pesanan(no_wa);

-- 4. TABEL: detail_pesanan (Modul Item Makanan)
CREATE TABLE detail_pesanan (
    detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES pesanan(order_id) ON DELETE CASCADE,
    kategori_item VARCHAR(30) NOT NULL CHECK (kategori_item IN ('Main', 'Lunch Menu', 'Lunch Box', 'Sauce', 'Condiment')),
    nama_item VARCHAR(150) NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    harga_satuan INTEGER NOT NULL CHECK (harga_satuan >= 0),
    catatan_item TEXT
);

CREATE INDEX idx_detail_order_id ON detail_pesanan(order_id);
CREATE INDEX idx_detail_nama_item ON detail_pesanan(nama_item);

-- 5. TABEL: pembayaran (Modul Verifikasi & Konfirmasi Manual)
CREATE TABLE pembayaran (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES pesanan(order_id) ON DELETE CASCADE,
    metode VARCHAR(50) NOT NULL, -- Transfer BCA, Mandiri, QRIS
    bukti_transfer_url TEXT,
    waktu_bayar TIMESTAMPTZ DEFAULT NOW(),
    status_verifikasi VARCHAR(30) DEFAULT 'Menunggu Verifikasi' CHECK (status_verifikasi IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
    catatan_admin TEXT
);

CREATE INDEX idx_pembayaran_order_id ON pembayaran(order_id);

-- 6. TABEL: menu_item (Master Katalog Menu Jalan Bhakti 3)
CREATE TABLE menu_item (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    kategori VARCHAR(30) NOT NULL CHECK (kategori IN ('Main', 'Lunch Menu', 'Lunch Box', 'Sauce', 'Condiment')),
    harga INTEGER NOT NULL CHECK (harga >= 0),
    deskripsi TEXT,
    foto_url TEXT,
    pilihan_level_pedas BOOLEAN DEFAULT FALSE,
    is_tersedia BOOLEAN DEFAULT TRUE,
    urutan INTEGER DEFAULT 0
);

-- 7. VIEW CRM: view_pelanggan_loyalti
-- Menghitung otomatis kategori loyalti: VIP, Reguler, Baru, Churn
CREATE OR REPLACE VIEW view_pelanggan_loyalti AS
SELECT 
    p.no_wa,
    p.nama_pelanggan,
    p.alamat_default,
    p.total_order,
    p.total_belanja,
    p.terakhir_pesan,
    p.created_at,
    CASE 
        -- Jika belum pernah pesan atau baru pesan 1 kali dalam 30 hari terakhir
        WHEN p.total_order = 0 OR p.terakhir_pesan IS NULL THEN 'Baru'
        -- Jika tidak pernah memesan lebih dari 35 hari sejak pesanan terakhir -> CHURN ALERT
        WHEN (CURRENT_DATE - p.terakhir_pesan::date) > 35 THEN 'Churn'
        -- VIP: Pesanan >= 5 kali atau total akumulasi belanja >= Rp 500.000
        WHEN p.total_order >= 5 OR p.total_belanja >= 500000 THEN 'VIP'
        -- Reguler: Pesanan 2 - 4 kali
        WHEN p.total_order >= 2 THEN 'Reguler'
        -- Baru: 1 order aktif belum lama
        ELSE 'Baru'
    END AS kategori_loyalti,
    COALESCE((CURRENT_DATE - p.terakhir_pesan::date), 0) AS hari_sejak_pesanan_terakhir
FROM pelanggan p;

-- 8. VIEW KITCHEN: view_rekap_dapur
-- Menghitung total porsi per menu per jadwal pengiriman untuk persiapan dapur
CREATE OR REPLACE VIEW view_rekap_dapur AS
SELECT 
    p.jadwal_pengiriman,
    dp.kategori_item,
    dp.nama_item,
    SUM(dp.qty) AS total_qty,
    COUNT(DISTINCT p.order_id) AS jumlah_order
FROM pesanan p
JOIN detail_pesanan dp ON p.order_id = dp.order_id
WHERE p.status_pesanan IN ('Lunas', 'Diproses', 'Siap Kirim')
GROUP BY p.jadwal_pengiriman, dp.kategori_item, dp.nama_item
ORDER BY p.jadwal_pengiriman ASC, dp.kategori_item ASC, total_qty DESC;

-- 9. TRIGGER: REKAPITULASI STATISTIK PELANGGAN OTOMATIS
-- Saat pesanan dibuat atau status diubah menjadi 'Lunas'/'Selesai', update akumulasi belanja pelanggan
CREATE OR REPLACE FUNCTION fn_update_stat_pelanggan()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pelanggan
    SET 
        total_order = (
            SELECT COUNT(*) 
            FROM pesanan 
            WHERE no_wa = NEW.no_wa 
              AND status_pesanan NOT IN ('Dibatalkan')
        ),
        total_belanja = (
            SELECT COALESCE(SUM(grand_total), 0) 
            FROM pesanan 
            WHERE no_wa = NEW.no_wa 
              AND status_pesanan IN ('Lunas', 'Diproses', 'Siap Kirim', 'Selesai')
        ),
        terakhir_pesan = (
            SELECT MAX(waktu_pesan) 
            FROM pesanan 
            WHERE no_wa = NEW.no_wa
        ),
        updated_at = NOW()
    WHERE no_wa = NEW.no_wa;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stat_pelanggan
AFTER INSERT OR UPDATE OF status_pesanan ON pesanan
FOR EACH ROW
EXECUTE FUNCTION fn_update_stat_pelanggan();

-- 10. SETUP SUPABASE STORAGE BUCKET (Jika dijalankan di Supabase Cloud / Self-hosted)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-transfer', 'bukti-transfer', true)
ON CONFLICT (id) DO NOTHING;

-- Policy RLS untuk upload & view bukti transfer
CREATE POLICY "Public Bukti Transfer Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'bukti-transfer');

CREATE POLICY "Public Upload Bukti Transfer" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'bukti-transfer');

-- RLS Tables (Enable RLS dengan default public read/write untuk sistem pemesanan)
ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_pesanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all pelanggan" ON pelanggan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all pesanan" ON pesanan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all detail_pesanan" ON detail_pesanan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all pembayaran" ON pembayaran FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read menu" ON menu_item FOR SELECT USING (true);
CREATE POLICY "Allow admin all menu" ON menu_item FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 11. DATA AWAL (SEED MASTER MENU & CONTOH DATA TRANSAKSI)
-- ==============================================================================

INSERT INTO menu_item (nama, kategori, harga, deskripsi, foto_url, pilihan_level_pedas, urutan) VALUES
('Ayam Utuh', 'Main', 150000, 'Ayam panggang utuh marinasi 24 jam dengan racikan cabai peri-peri & rempah istimewa khas Jalan Bhakti 3. Juicy di dalam, smoky di luar. (Pilihan Saus Mild atau Hot)', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80', TRUE, 1),
('Lunch Box (White Rice + Coleslaw)', 'Lunch Box', 40000, 'Paket makan siang komplit: 1/4 ayam peri-peri flame-grilled, White Rice pulen hangat, dan Salad Coleslaw dingin segar. (Pilihan Saus Mild atau Hot)', 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80', TRUE, 2),
('Lunch Box (Mashed Potatoes + Coleslaw)', 'Lunch Box', 45000, 'Paket makan siang premium: 1/4 ayam peri-peri flame-grilled, Creamy Mashed Potatoes lembut dengan gravy hangat, dan Salad Coleslaw dingin. (Pilihan Saus Mild atau Hot)', 'https://images.unsplash.com/photo-1514944298352-b88307db1154?auto=format&fit=crop&w=800&q=80', TRUE, 3),
('Tambahan Saus Mild', 'Condiment', 10000, 'Extra cup Saus Peri-Peri level Mild (pedas sedang & gurih khas Jalan Bhakti 3).', 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80', FALSE, 4),
('Tambahan Saus Hot', 'Condiment', 10000, 'Extra cup Saus Peri-Peri level Hot (pedas mantap cabai peri-peri asli).', 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80', FALSE, 5),
('Mashed Potatoes', 'Condiment', 20000, 'Porsi ekstra kentang tumbuk lembut buttery disiram saus gravy peri-peri gurih hangat.', 'https://images.unsplash.com/photo-1514944298352-b88307db1154?auto=format&fit=crop&w=800&q=80', FALSE, 6),
('Coleslaw', 'Condiment', 20000, 'Porsi ekstra salad kubis segar & wortel renyah berpadu mayonnaise asam manis.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', FALSE, 7);

-- SEED CONTOH PELANGGAN CRM
INSERT INTO pelanggan (no_wa, nama_pelanggan, alamat_default, total_order, total_belanja, terakhir_pesan) VALUES
('081234567890', 'Budi Santoso', 'Jl. Jeruk No. 14, Jagakarsa, Jakarta Selatan', 7, 945000, NOW() - INTERVAL '3 days'),
('085711223344', 'Siti Rahmawati', 'Apartemen Kebagusan City Tower C Unit 1205, Pasar Minggu', 3, 342000, NOW() - INTERVAL '8 days'),
('087899887766', 'Dimas Pratama', 'Jl. Bhakti 3 No. 5B, Ciganjur, Jakarta Selatan', 1, 142000, NOW() - INTERVAL '2 days'),
('081399881122', 'Indra Gunawan', 'Jl. Moh Kahfi 1 No. 88, Jagakarsa', 6, 810000, NOW() - INTERVAL '48 days');

-- SEED CONTOH PESANAN AKTIF
INSERT INTO pesanan (order_id, no_wa, waktu_pesan, jadwal_pengiriman, alamat_pengiriman, link_gmaps, subtotal, ongkir, kode_unik, grand_total, status_pesanan, catatan) VALUES
('d1111111-1111-1111-1111-111111111111', '081234567890', NOW() - INTERVAL '2 hours', CURRENT_DATE + INTERVAL '1 day', 'Jl. Jeruk No. 14, Jagakarsa, Jakarta Selatan', 'https://maps.google.com/?q=-6.3312,106.8123', 170000, 15000, 234, 185234, 'Lunas', 'Minta saus dipisah. Sambal level Hot.'),
('d2222222-2222-2222-2222-222222222222', '087899887766', NOW() - INTERVAL '40 minutes', CURRENT_DATE + INTERVAL '1 day', 'Jl. Bhakti 3 No. 5B, Ciganjur, Jakarta Selatan', 'https://maps.google.com/?q=-6.3421,106.8045', 115000, 10000, 567, 125567, 'Menunggu Pembayaran', 'Tolong jangan terlalu pedas (Mild).'),
('d3333333-3333-3333-3333-333333333333', '085711223344', NOW() - INTERVAL '5 hours', CURRENT_DATE + INTERVAL '2 day', 'Apartemen Kebagusan City Tower C Unit 1205, Pasar Minggu', 'https://maps.google.com/?q=-6.3051,106.8321', 190000, 18000, 112, 208112, 'Siap Kirim', 'Titip di resepsionis lobi C.');

-- SEED DETAIL PESANAN
INSERT INTO detail_pesanan (order_id, kategori_item, nama_item, qty, harga_satuan, catatan_item) VALUES
('d1111111-1111-1111-1111-111111111111', 'Main', 'Ayam Utuh Peri-Peri (Whole Chicken)', 1, 115000, 'Level Hot'),
('d1111111-1111-1111-1111-111111111111', 'Condiment', 'Creamy Mashed Potatoes & Peri Gravy', 1, 18000, NULL),
('d1111111-1111-1111-1111-111111111111', 'Condiment', 'Fresh Tangy Coleslaw', 1, 15000, NULL),
('d1111111-1111-1111-1111-111111111111', 'Condiment', 'Fragrant Butter Rice', 2, 10000, NULL),
('d2222222-2222-2222-2222-222222222222', 'Main', 'Ayam Utuh Peri-Peri (Whole Chicken)', 1, 115000, 'Level Mild'),
('d3333333-3333-3333-3333-333333333333', 'Lunch Menu', 'Lunch Box Ayam Peri-Peri (1/4 Ayam + Butter Rice + Coleslaw)', 5, 38000, 'Level Medium');

-- SEED PEMBAYARAN CONTOH
INSERT INTO pembayaran (order_id, metode, bukti_transfer_url, waktu_bayar, status_verifikasi) VALUES
('d1111111-1111-1111-1111-111111111111', 'Transfer BCA', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', NOW() - INTERVAL '1 hour', 'Terverifikasi');
