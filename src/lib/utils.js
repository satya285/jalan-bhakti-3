// Utility functions for Jalan Bhakti 3 Ordering System

export function formatRupiah(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '-';
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function shortUUID(uuid) {
  if (!uuid) return '';
  const clean = uuid.replace(/-/g, '').toUpperCase();
  return clean.slice(-6);
}

export function generateKodeUnik() {
  // Angka acak 1 - 999
  return Math.floor(Math.random() * 999) + 1;
}

export function cleanWhatsAppNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Menghasilkan tanggal pengiriman pre-order (Selasa s/d Jumat terdekat)
 */
export function getNextDeliveryDates() {
  const dates = [];
  const today = new Date();
  
  // Cari 8 hari ke depan yang jatuh pada hari Selasa (2), Rabu (3), Kamis (4), Jumat (5)
  for (let i = 1; i <= 14; i++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + i);
    const day = candidate.getDay(); // 0 = Minggu, 2 = Selasa, 5 = Jumat
    
    if (day >= 2 && day <= 5) {
      const year = candidate.getFullYear();
      const month = String(candidate.getMonth() + 1).padStart(2, '0');
      const d = String(candidate.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${d}`;
      
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(candidate);
      const display = `${dayName}, ${candidate.getDate()} ${new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(candidate)}`;
      
      dates.push({
        isoDate,
        display,
        dayName
      });
      
      if (dates.length >= 6) break;
    }
  }
  
  return dates;
}

/**
 * Menghasilkan link WhatsApp untuk konfirmasi pesanan dari Pelanggan ke Admin
 */
export function createCustomerToAdminWALink(order, adminPhone = '6281234567890') {
  const shortId = shortUUID(order.order_id);
  const itemsText = (order.items || [])
    .map(it => `• ${it.nama_item} (${it.qty}x) ${it.catatan_item ? `[${it.catatan_item}]` : ''}`)
    .join('\n');

  const text = `Halo Admin Jalan Bhakti 3! 🍗🔥
Saya ingin konfirmasi pesanan:

*No. Pesanan:* #${shortId}
*Nama:* ${order.nama_pelanggan || '-'}
*Jadwal Pengiriman:* ${formatDate(order.jadwal_pengiriman)}
*Alamat:* ${order.alamat_pengiriman || '-'}
${order.link_gmaps ? `*Pin Gmaps:* ${order.link_gmaps}` : ''}

*Menu Dipesan:*
${itemsText}

*Subtotal:* ${formatRupiah(order.subtotal)}
*Ongkir:* ${formatRupiah(order.ongkir)}
*Kode Unik:* ${order.kode_unik}
*Grand Total:* *${formatRupiah(order.grand_total)}*

Mohon dicek ya min. Terima kasih! 🙏`;

  return `https://wa.me/${cleanWhatsAppNumber(adminPhone)}?text=${encodeURIComponent(text)}`;
}

/**
 * Menghasilkan link WhatsApp Marketing / Retensi CRM dari Admin ke Pelanggan
 */
export function createAdminCrmWALink(customer, templateType = 'buka_kuota') {
  const phone = cleanWhatsAppNumber(customer.no_wa);
  const nama = customer.nama_pelanggan || 'Kak';

  let message = '';
  switch (templateType) {
    case 'buka_kuota':
      message = `Halo ${nama}! 🔥 Kuota pre-order Ayam Peri-Peri Jalan Bhakti 3 untuk batch minggu ini (Selasa - Jumat) sudah dibuka! 🍗✨
Dibuat fresh dari panggangan dengan cabai peri-peri asli & bumbu rempah aromatik.

Yuk amankan slot pengirimanmu sebelum kuota harian habis:
👉 https://order.heragandhi.web.id`;
      break;

    case 'vip_reward':
      message = `Halo pelanggan setia ${nama} ⭐ Terima kasih sudah sering mempercayakan makan siang dan makan malam bersama Jalan Bhakti 3!
Sebagai pelanggan VIP, kami siapkan *Free Extra Peri Sauce (Jar 100ml)* untuk pesanan batch minggu ini.

Pesan sekarang:
👉 https://order.heragandhi.web.id (Tulis di catatan: 'KLAIM BONUS VIP')`;
      break;

    case 'win_back_churn':
      message = `Halo ${nama}, kangen gurih dan pedas smoky-nya Ayam Peri-Peri Jalan Bhakti 3? 🍗🤤
Sudah cukup lama sejak pesanan terakhirmu. Kebetulan minggu ini kami punya racikan saus pedas baru yang makin mantap!

Cek menu dan jadwal pengiriman di sini yuk:
👉 https://order.heragandhi.web.id`;
      break;

    case 'tanya_feedback':
      message = `Halo ${nama}, terima kasih sudah memesan di Jalan Bhakti 3 kemarin. Bagaimana rasa Ayam Peri-Peri dan condiment-nya, apakah pas di lidah? 😊
Kritik dan saran dari Kakak sangat berarti bagi kami. Terima kasih banyak ya! 🙏`;
      break;

    default:
      message = `Halo ${nama}, terima kasih dari Jalan Bhakti 3!`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
