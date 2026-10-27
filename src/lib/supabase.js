import { createClient } from '@supabase/supabase-js';
import { INITIAL_MENU } from './types';

// Mock seed database for fallback & immediate demo capability
const STORAGE_PREFIX = 'BHAKTI3_';

function getStoredOrInitial(key, initialValue) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : initialValue;
  } catch (e) {
    return initialValue;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

// Initial mock customers
const INITIAL_CUSTOMERS = [
  {
    no_wa: '081234567890',
    nama_pelanggan: 'Budi Santoso',
    alamat_default: 'Jl. Jeruk No. 14, Jagakarsa, Jakarta Selatan',
    total_order: 7,
    total_belanja: 945000,
    terakhir_pesan: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    no_wa: '085711223344',
    nama_pelanggan: 'Siti Rahmawati',
    alamat_default: 'Apartemen Kebagusan City Tower C Unit 1205, Pasar Minggu',
    total_order: 3,
    total_belanja: 342000,
    terakhir_pesan: new Date(Date.now() - 8 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    no_wa: '087899887766',
    nama_pelanggan: 'Dimas Pratama',
    alamat_default: 'Jl. Bhakti 3 No. 5B, Ciganjur, Jakarta Selatan',
    total_order: 1,
    total_belanja: 142000,
    terakhir_pesan: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    no_wa: '081399881122',
    nama_pelanggan: 'Indra Gunawan',
    alamat_default: 'Jl. Moh Kahfi 1 No. 88, Jagakarsa',
    total_order: 6,
    total_belanja: 810000,
    terakhir_pesan: new Date(Date.now() - 48 * 86400000).toISOString(), // > 35 days -> Churn
    created_at: new Date(Date.now() - 120 * 86400000).toISOString()
  }
];

// Helper to determine upcoming pre-order dates
const today = new Date();
const targetTomorrow = new Date(today);
targetTomorrow.setDate(today.getDate() + 1);
const isoTomorrow = targetTomorrow.toISOString().split('T')[0];

const targetNext = new Date(today);
targetNext.setDate(today.getDate() + 2);
const isoNext = targetNext.toISOString().split('T')[0];

// Initial mock orders
const INITIAL_ORDERS = [
  {
    order_id: 'd1111111-1111-1111-1111-111111111111',
    no_wa: '081234567890',
    nama_pelanggan: 'Budi Santoso',
    waktu_pesan: new Date(Date.now() - 2 * 3600000).toISOString(),
    jadwal_pengiriman: isoTomorrow,
    alamat_pengiriman: 'Jl. Jeruk No. 14, Jagakarsa, Jakarta Selatan',
    link_gmaps: 'https://maps.google.com/?q=-6.3312,106.8123',
    subtotal: 190000,
    ongkir: 0,
    kode_unik: 234,
    grand_total: 190234,
    status_pesanan: 'Lunas',
    catatan: 'Minta saus dipisah. Pilihan level Hot.',
    items: [
      {
        detail_id: 'dt-1',
        nama_item: 'Ayam Utuh',
        kategori_item: 'Main',
        qty: 1,
        harga_satuan: 150000,
        catatan_item: 'Level: 🌶️🌶️ Saus Hot (Pedas Mantap)'
      },
      {
        detail_id: 'dt-2',
        nama_item: 'Mashed Potatoes',
        kategori_item: 'Condiment',
        qty: 2,
        harga_satuan: 20000
      }
    ],
    pembayaran: {
      metode: 'Transfer BCA',
      bukti_transfer_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      waktu_bayar: new Date(Date.now() - 3600000).toISOString(),
      status_verifikasi: 'Terverifikasi'
    }
  },
  {
    order_id: 'd2222222-2222-2222-2222-222222222222',
    no_wa: '087899887766',
    nama_pelanggan: 'Dimas Pratama',
    waktu_pesan: new Date(Date.now() - 40 * 60000).toISOString(),
    jadwal_pengiriman: isoTomorrow,
    alamat_pengiriman: 'Jl. Bhakti 3 No. 5B, Ciganjur, Jakarta Selatan',
    link_gmaps: 'https://maps.google.com/?q=-6.3421,106.8045',
    subtotal: 150000,
    ongkir: 0,
    kode_unik: 567,
    grand_total: 150567,
    status_pesanan: 'Menunggu Pembayaran',
    catatan: 'Pilihan saus Mild ya.',
    items: [
      {
        detail_id: 'dt-5',
        nama_item: 'Ayam Utuh',
        kategori_item: 'Main',
        qty: 1,
        harga_satuan: 150000,
        catatan_item: 'Level: 🌶️ Saus Mild (Sedang)'
      }
    ],
    pembayaran: {
      metode: 'Transfer BCA',
      bukti_transfer_url: null,
      waktu_bayar: null,
      status_verifikasi: 'Menunggu Verifikasi'
    }
  },
  {
    order_id: 'd3333333-3333-3333-3333-333333333333',
    no_wa: '085711223344',
    nama_pelanggan: 'Siti Rahmawati',
    waktu_pesan: new Date(Date.now() - 5 * 3600000).toISOString(),
    jadwal_pengiriman: isoNext,
    alamat_pengiriman: 'Apartemen Kebagusan City Tower C Unit 1205, Pasar Minggu',
    link_gmaps: 'https://maps.google.com/?q=-6.3051,106.8321',
    subtotal: 200000,
    ongkir: 0,
    kode_unik: 112,
    grand_total: 200112,
    status_pesanan: 'Siap Kirim',
    catatan: 'Driver Gojek jemput jam 12 siang.',
    items: [
      {
        detail_id: 'dt-6',
        nama_item: 'Lunch Box (White Rice + Coleslaw)',
        kategori_item: 'Lunch Box',
        qty: 5,
        harga_satuan: 40000,
        catatan_item: 'Level: 🌶️ Saus Mild (Sedang)'
      }
    ],
    pembayaran: {
      metode: 'QRIS',
      bukti_transfer_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      waktu_bayar: new Date(Date.now() - 4 * 3600000).toISOString(),
      status_verifikasi: 'Terverifikasi'
    }
  }
];

// Supabase client instance management
let supabaseClient = null;

export function getSupabaseCredentials() {
  const customUrl = localStorage.getItem('BHAKTI3_SUPABASE_URL');
  const customKey = localStorage.getItem('BHAKTI3_SUPABASE_KEY');
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = customUrl || envUrl || '';
  const key = customKey || envKey || '';
  const isConfigured = Boolean(url && key && url.startsWith('http') && !url.includes('your-project-id'));

  return { url, key, isConfigured };
}

export function initSupabase() {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (e) {
      console.error('Supabase Client init error:', e);
      supabaseClient = null;
    }
  }
  return null;
}

export function saveSupabaseCredentials(url, key) {
  if (url) localStorage.setItem('BHAKTI3_SUPABASE_URL', url.trim());
  if (key) localStorage.setItem('BHAKTI3_SUPABASE_KEY', key.trim());
  return initSupabase();
}

// Initial client boot
initSupabase();

// Unified Data API (with automatic fallback to realistic local store)
export const api = {
  isLiveSupabase() {
    return Boolean(supabaseClient);
  },

  async testConnection() {
    const { url, key, isConfigured } = getSupabaseCredentials();
    if (!isConfigured) {
      return { success: false, message: 'URL atau Anon Key Supabase belum diisi.' };
    }
    try {
      const client = createClient(url, key);
      const { data, error } = await client.from('menu_item').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true, message: 'Koneksi ke Supabase PostgreSQL berhasil!' };
    } catch (err) {
      return { success: false, message: err.message || 'Gagal terhubung ke Supabase.' };
    }
  },

  async getMenu() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('menu_item')
          .select('*')
          .order('urutan', { ascending: true });

        if (!error && data && data.length > 0) {
          // Deteksi apakah Supabase masih menyimpan menu lama
          const hasOldItems = data.some(d => 
            d.nama.includes('1/2 Ayam') || 
            d.nama.includes('Rice Bowl') || 
            d.nama.includes('Peri-Peri (Whole Chicken)') ||
            d.harga === 115000 ||
            d.harga === 38000 ||
            d.harga === 18000
          );

          if (hasOldItems) {
            console.log('Menghapus menu lama di Supabase dan menyelaraskan ke 7 menu baru...');
            try {
              await supabaseClient.from('menu_item').delete().neq('nama', '___');
              const inserts = INITIAL_MENU.map((it, idx) => ({
                nama: it.nama,
                kategori: it.kategori,
                harga: it.harga,
                deskripsi: it.deskripsi,
                foto_url: it.foto_url,
                pilihan_level_pedas: it.pilihan_level_pedas,
                is_tersedia: it.is_tersedia,
                urutan: idx + 1
              }));
              await supabaseClient.from('menu_item').insert(inserts);
            } catch (err) {
              console.warn('Gagal sync otomatis ke Supabase:', err);
            }
            return INITIAL_MENU;
          }
          return data;
        }
      } catch (err) {
        console.warn('Fallback to local menu due to:', err);
      }
    }
    return INITIAL_MENU;
  },

  async findCustomerByPhone(phone) {
    const cleanPhone = phone.trim();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('pelanggan')
          .select('*')
          .eq('no_wa', cleanPhone)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Customer lookup error:', err);
      }
    }
    const customers = getStoredOrInitial('CUSTOMERS', INITIAL_CUSTOMERS);
    return customers.find(c => c.no_wa === cleanPhone) || null;
  },

  async createOrder({ customerData, orderData, items }) {
    const orderId = crypto.randomUUID ? crypto.randomUUID() : 'ord-' + Date.now();
    const nowIso = new Date().toISOString();

    const fullOrder = {
      order_id: orderId,
      no_wa: customerData.no_wa,
      nama_pelanggan: customerData.nama_pelanggan,
      waktu_pesan: nowIso,
      jadwal_pengiriman: orderData.jadwal_pengiriman,
      alamat_pengiriman: orderData.alamat_pengiriman,
      link_gmaps: orderData.link_gmaps || null,
      subtotal: orderData.subtotal,
      ongkir: orderData.ongkir,
      kode_unik: orderData.kode_unik,
      grand_total: orderData.grand_total,
      status_pesanan: 'Menunggu Pembayaran',
      catatan: orderData.catatan || null,
      items: items.map((it, idx) => ({
        detail_id: crypto.randomUUID ? crypto.randomUUID() : `item-${idx}-${Date.now()}`,
        order_id: orderId,
        kategori_item: it.kategori,
        nama_item: it.nama,
        qty: it.qty,
        harga_satuan: it.harga,
        catatan_item: it.catatan || null
      })),
      pembayaran: {
        metode: orderData.metode_pembayaran || 'Transfer BCA',
        bukti_transfer_url: null,
        waktu_bayar: null,
        status_verifikasi: 'Menunggu Verifikasi'
      }
    };

    // Attempt Supabase insert
    if (supabaseClient) {
      try {
        // 1. Upsert Pelanggan
        await supabaseClient.from('pelanggan').upsert({
          no_wa: customerData.no_wa,
          nama_pelanggan: customerData.nama_pelanggan,
          alamat_default: orderData.alamat_pengiriman,
          terakhir_pesan: nowIso
        });

        // 2. Insert Pesanan
        await supabaseClient.from('pesanan').insert({
          order_id: orderId,
          no_wa: customerData.no_wa,
          jadwal_pengiriman: orderData.jadwal_pengiriman,
          alamat_pengiriman: orderData.alamat_pengiriman,
          link_gmaps: orderData.link_gmaps,
          subtotal: orderData.subtotal,
          ongkir: orderData.ongkir,
          kode_unik: orderData.kode_unik,
          grand_total: orderData.grand_total,
          status_pesanan: 'Menunggu Pembayaran',
          catatan: orderData.catatan
        });

        // 3. Insert Details
        const detailsToInsert = items.map(it => ({
          order_id: orderId,
          kategori_item: it.kategori,
          nama_item: it.nama,
          qty: it.qty,
          harga_satuan: it.harga,
          catatan_item: it.catatan || null
        }));
        await supabaseClient.from('detail_pesanan').insert(detailsToInsert);

        // 4. Insert Pembayaran
        await supabaseClient.from('pembayaran').insert({
          order_id: orderId,
          metode: orderData.metode_pembayaran || 'Transfer BCA'
        });
      } catch (err) {
        console.warn('Supabase insert failed, saving to local store:', err);
      }
    }

    // Always update local store for instant reactive UI & offline support
    const orders = getStoredOrInitial('ORDERS', INITIAL_ORDERS);
    orders.unshift(fullOrder);
    setStored('ORDERS', orders);

    // Update customer in local store
    const customers = getStoredOrInitial('CUSTOMERS', INITIAL_CUSTOMERS);
    const existingIdx = customers.findIndex(c => c.no_wa === customerData.no_wa);
    if (existingIdx >= 0) {
      customers[existingIdx].nama_pelanggan = customerData.nama_pelanggan;
      customers[existingIdx].alamat_default = orderData.alamat_pengiriman;
      customers[existingIdx].total_order = (customers[existingIdx].total_order || 0) + 1;
      customers[existingIdx].terakhir_pesan = nowIso;
    } else {
      customers.push({
        no_wa: customerData.no_wa,
        nama_pelanggan: customerData.nama_pelanggan,
        alamat_default: orderData.alamat_pengiriman,
        total_order: 1,
        total_belanja: 0,
        terakhir_pesan: nowIso,
        created_at: nowIso
      });
    }
    setStored('CUSTOMERS', customers);

    return fullOrder;
  },

  async getOrders() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('pesanan')
          .select(`
            *,
            pelanggan (nama_pelanggan, alamat_default),
            detail_pesanan (*),
            pembayaran (*)
          `)
          .order('waktu_pesan', { ascending: false });

        if (!error && data) {
          return data.map(o => ({
            ...o,
            nama_pelanggan: o.pelanggan?.nama_pelanggan || 'Pelanggan',
            items: o.detail_pesanan || [],
            pembayaran: o.pembayaran?.[0] || null
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch orders failed:', err);
      }
    }
    return getStoredOrInitial('ORDERS', INITIAL_ORDERS);
  },

  async getOrderById(orderId) {
    const orders = await this.getOrders();
    return orders.find(o => o.order_id === orderId) || null;
  },

  async updateOrderStatus(orderId, newStatus) {
    if (supabaseClient) {
      try {
        await supabaseClient
          .from('pesanan')
          .update({ status_pesanan: newStatus })
          .eq('order_id', orderId);
      } catch (err) {
        console.warn('Supabase update order status failed:', err);
      }
    }

    const orders = getStoredOrInitial('ORDERS', INITIAL_ORDERS);
    const order = orders.find(o => o.order_id === orderId);
    if (order) {
      order.status_pesanan = newStatus;
      if (newStatus === 'Lunas' && order.pembayaran) {
        order.pembayaran.status_verifikasi = 'Terverifikasi';
      }
      setStored('ORDERS', orders);

      // Re-calculate customer stats if verified Lunas
      if (newStatus === 'Lunas') {
        const customers = getStoredOrInitial('CUSTOMERS', INITIAL_CUSTOMERS);
        const cust = customers.find(c => c.no_wa === order.no_wa);
        if (cust) {
          cust.total_belanja = (cust.total_belanja || 0) + order.grand_total;
          setStored('CUSTOMERS', customers);
        }
      }
    }
    return true;
  },

  async uploadBuktiTransfer(orderId, fileOrBase64) {
    let publicUrl = fileOrBase64;

    if (supabaseClient && typeof fileOrBase64 !== 'string') {
      try {
        const fileExt = fileOrBase64.name.split('.').pop();
        const filePath = `${orderId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from('bukti-transfer')
          .upload(filePath, fileOrBase64);

        if (!uploadError) {
          const { data } = supabaseClient.storage.from('bukti-transfer').getPublicUrl(filePath);
          publicUrl = data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload error:', err);
      }
    }

    // Save proof to local & supabase
    if (supabaseClient) {
      try {
        await supabaseClient
          .from('pembayaran')
          .update({
            bukti_transfer_url: publicUrl,
            waktu_bayar: new Date().toISOString(),
            status_verifikasi: 'Menunggu Verifikasi'
          })
          .eq('order_id', orderId);
      } catch (e) {
        console.warn('Supabase update pembayaran error:', e);
      }
    }

    const orders = getStoredOrInitial('ORDERS', INITIAL_ORDERS);
    const order = orders.find(o => o.order_id === orderId);
    if (order) {
      if (!order.pembayaran) order.pembayaran = {};
      order.pembayaran.bukti_transfer_url = publicUrl;
      order.pembayaran.waktu_bayar = new Date().toISOString();
      order.pembayaran.status_verifikasi = 'Menunggu Verifikasi';
      setStored('ORDERS', orders);
    }

    return publicUrl;
  },

  async getCustomersWithLoyalty() {
    let rawCustomers = [];
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('view_pelanggan_loyalti')
          .select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase fetch customers failed:', err);
      }
    }

    rawCustomers = getStoredOrInitial('CUSTOMERS', INITIAL_CUSTOMERS);
    const now = new Date();

    return rawCustomers.map(c => {
      const lastOrderDate = c.terakhir_pesan ? new Date(c.terakhir_pesan) : null;
      const daysSince = lastOrderDate ? Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24)) : 999;
      
      let kategori_loyalti = 'Baru';
      if (!c.total_order || c.total_order === 0) {
        kategori_loyalti = 'Baru';
      } else if (daysSince > 35 && c.total_order >= 1) {
        kategori_loyalti = 'Churn';
      } else if (c.total_order >= 5 || (c.total_belanja && c.total_belanja >= 500000)) {
        kategori_loyalti = 'VIP';
      } else if (c.total_order >= 2) {
        kategori_loyalti = 'Reguler';
      }

      return {
        ...c,
        kategori_loyalti,
        hari_sejak_pesanan_terakhir: daysSince === 999 ? '-' : daysSince
      };
    });
  },

  resetMockData() {
    localStorage.removeItem(STORAGE_PREFIX + 'CUSTOMERS');
    localStorage.removeItem(STORAGE_PREFIX + 'ORDERS');
    localStorage.removeItem(STORAGE_PREFIX + 'MENU');
    window.location.reload();
  }
};
