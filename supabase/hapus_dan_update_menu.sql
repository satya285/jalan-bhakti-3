-- ==============================================================================
-- SKRIP HAPUS MENU LAMA & ISI HANYA 7 MENU BARU JALAN BHAKTI 3
-- Jalankan di SQL Editor Supabase: https://supabase.com/dashboard/project/oawedqkowdqomywvtahw/sql/new
-- ==============================================================================

-- 1. HAPUS SEMUA MENU LAMA DARI TABEL menu_item
TRUNCATE TABLE menu_item RESTART IDENTITY CASCADE;

-- 2. MASUKKAN HANYA 7 MENU BARU RESMI
INSERT INTO menu_item (nama, kategori, harga, deskripsi, foto_url, pilihan_level_pedas, urutan) VALUES
('Ayam Utuh', 'Main', 150000, 'Ayam panggang utuh marinasi 24 jam dengan racikan cabai peri-peri & rempah istimewa khas Jalan Bhakti 3. Juicy di dalam, smoky di luar. (Pilihan Saus Mild atau Hot)', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80', TRUE, 1),
('Lunch Box (White Rice + Coleslaw)', 'Lunch Box', 40000, 'Paket makan siang komplit: Potongan ayam peri-peri flame-grilled, White Rice pulen hangat, dan Salad Coleslaw dingin segar. (Pilihan Saus Mild atau Hot)', 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80', TRUE, 2),
('Lunch Box (Mashed Potatoes + Coleslaw)', 'Lunch Box', 45000, 'Paket makan siang premium: Potongan ayam peri-peri flame-grilled, Creamy Mashed Potatoes lembut dengan gravy hangat, dan Salad Coleslaw dingin. (Pilihan Saus Mild atau Hot)', 'https://images.unsplash.com/photo-1514944298352-b88307db1154?auto=format&fit=crop&w=800&q=80', TRUE, 3),
('Tambahan Saus Mild', 'Condiment', 10000, 'Extra cup Saus Peri-Peri level Mild (pedas sedang & rempah gurih khas Jalan Bhakti 3).', 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80', FALSE, 4),
('Tambahan Saus Hot', 'Condiment', 10000, 'Extra cup Saus Peri-Peri level Hot (pedas mantap cabai peri-peri asli).', 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80', FALSE, 5),
('Mashed Potatoes', 'Condiment', 20000, 'Porsi ekstra kentang tumbuk lembut buttery disiram saus gravy peri-peri gurih hangat.', 'https://images.unsplash.com/photo-1514944298352-b88307db1154?auto=format&fit=crop&w=800&q=80', FALSE, 6),
('Coleslaw', 'Condiment', 20000, 'Porsi ekstra salad kubis segar & wortel renyah berpadu mayonnaise asam manis.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', FALSE, 7);
