# 🍗 SISTEM ORDERING PRE-ORDER TERINTEGRASI JALAN BHAKTI 3
> **Domain Target:** `order.heragandhi.web.id`  
> **Tech Stack:** React 19 + Vite + Tailwind CSS + Supabase PostgreSQL + Progressive Web App (PWA) + Docker (Proxmox VE) + Cloudflare Tunnels

---

## 📌 Ringkasan Sistem & Arsitektur

Aplikasi ini di-hosting secara mandiri pada server web container Docker di Proxmox VE, diekspos melalui Cloudflare Tunnels ke domain `order.heragandhi.web.id`, dan dapat diakses langsung via browser maupun ditambahkan sebagai **Pintasan Layar Utama (PWA Standalone App)** pada Android & iOS tanpa perlu install dari Play Store / App Store.

```
                  [ Pelanggan (Web / PWA Standalone di Android & iOS) ]
                                            │
                                            ▼
                          Cloudflare Tunnel (order.heragandhi.web.id)
                                            │
                                            ▼
                     [ Docker Container Nginx on Proxmox VE ] (Port 8080)
                                            │
                                            ▼
                     [ Supabase PostgreSQL (Cloud / Self-Hosted Docker) ]
                      ├── Tabel: pelanggan, pesanan, detail_pesanan, pembayaran
                      ├── Views: view_pelanggan_loyalti, view_rekap_dapur
                      └── Storage: bucket bukti-transfer
```

---

## 📱 Pintasan Layar Utama HP (Web Standalone PWA)

Aplikasi ini telah dilengkapi dengan **Web App Manifest**, **Apple Web App Standalone Meta**, dan **Banner Panduan Otomatis** sehingga tampilan di layar HP pengguna 100% serasi seperti aplikasi native:
* **Bebas Bilah URL Browser:** Saat dibuka dari pintasan layar utama, aplikasi berjalan *full screen* tanpa bilah alamat atas & tombol navigasi browser bawah.
* **Ikon Resmi & Splash Screen:** Memiliki squircle icon Jalan Bhakti 3 dan background gelap `#0c0a09`.
* **Safe-Area Adaptif:** Otomatis menyesuaikan lekukan layar, notch/Dynamic Island iPhone, dan gesture bar Android.

### Cara Menambahkan ke Layar Utama:
1. **Di Android (Chrome):**
   * Buka `https://order.heragandhi.web.id`.
   * Ketuk banner **"Pasang"** yang muncul di layar, atau ketuk menu titik tiga (⋮) di pojok kanan atas ➔ pilih **"Tambahkan ke Layar Utama" / "Pasang Aplikasi"**.
2. **Di iPhone (iOS Safari):**
   * Buka `https://order.heragandhi.web.id` di Safari.
   * Ketuk tombol **Bagikan (Share)** di bilah bawah.
   * Geser ke bawah lalu ketuk **"Tambah ke Layar Utama" (Add to Home Screen)**.

---

## 🍗 Menu Makanan & Harga Resmi

| No | Menu | Kategori | Pilihan Saus | Harga |
| :-: | :--- | :---: | :---: | :--- |
| 1 | **Ayam Utuh** | Main | 🌶️ Mild / 🌶️🌶️ Hot | **Rp 150.000** |
| 2 | **Lunch Box (White Rice + Coleslaw)** | Lunch Box | 🌶️ Mild / 🌶️🌶️ Hot | **Rp 40.000** |
| 3 | **Lunch Box (Mashed Potatoes + Coleslaw)** | Lunch Box | 🌶️ Mild / 🌶️🌶️ Hot | **Rp 45.000** |
| 4 | **Tambahan Saus Mild** | Condiment | - | **Rp 10.000** |
| 5 | **Tambahan Saus Hot** | Condiment | - | **Rp 10.000** |
| 6 | **Mashed Potatoes** | Condiment | - | **Rp 20.000** |
| 7 | **Coleslaw** | Condiment | - | **Rp 20.000** |

---

## 🚗 Logika Pengambilan & Checkout

* **Default Pengambilan (Rp 0):** Makanan diambil sendiri oleh pembeli via Gojek / Grab / Lalamove (atau diambil langsung ke dapur Jalan Bhakti 3).
* **Alamat & Pin Google Maps:** Tetap wajib diisi pelanggan untuk dicetak pada struk thermal sebagai titik antar/tujuan driver yang menjemput.
* **Perhitungan Tagihan Unik:**
  $$\text{Grand Total} = \text{Subtotal Menu} + \text{Ongkir (Rp 0)} + \text{Kode Unik (1-999)}$$
* Dilengkapi tombol **"Salin Nominal Pas"**, countdown timer 2 jam, rekening resmi BCA, Mandiri, QRIS, dan fitur upload bukti transfer.

---

## 🍳 Operasional Admin & Dapur

* **Manajemen Pesanan:** Verifikasi lunas, zoom foto bukti transfer, update status pesanan (*Menunggu ➔ Lunas ➔ Diproses ➔ Siap Kirim ➔ Selesai*).
* **Kitchen Prep View:** Rekapitulasi total porsi Ayam Utuh, Lunch Box, Coleslaw, Mashed Potatoes, dan level saus per hari pengiriman Selasa–Jumat.
* **Struk Thermal Kurir (58mm / 80mm):** Siap cetak langsung dengan **QR Code navigasi Google Maps** untuk mempermudah driver Gojek/Grab/Lalamove.
* **CRM Retensi WhatsApp:** Pemantauan loyalti (*VIP, Reguler, Baru, Churn*) dengan tombol kirim pesan template WhatsApp otomatis.

---

## 🐳 Deployment di Proxmox VE dengan Docker & Cloudflare Tunnel

```bash
# 1. Pindahkan folder ke Proxmox VE
cd jalan-bhakti-3

# 2. Build dan jalankan container (Nginx port 8080)
docker compose up -d --build
```

Arahkan Cloudflare Tunnel untuk domain `order.heragandhi.web.id` ke `http://localhost:8080`.
Aplikasi web langsung online dan dapat dipasang sebagai pintasan di layar HP siapapun!
