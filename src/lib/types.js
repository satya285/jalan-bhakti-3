// Konfigurasi & Master Data Jalan Bhakti 3

export const STORE_INFO = {
  name: 'Jalan Bhakti 3',
  tagline: 'Signature Flame-Grilled Peri-Peri Chicken',
  address: 'Jl. Bhakti 3, Ciganjur, Jagakarsa, Jakarta Selatan',
  whatsapp: '081234567890',
  instagram: '@jalanbhakti3',
  googleMapsPin: 'https://maps.google.com/?q=-6.3421,106.8045',
  bankAccounts: [
    {
      bank: 'BCA',
      accountNumber: '8831-294-011',
      accountName: 'HERA GANDHI - JALAN BHAKTI 3',
      logo: '🏦 BCA'
    },
    {
      bank: 'Bank Mandiri',
      accountNumber: '157-00-0982341-2',
      accountName: 'HERA GANDHI - JALAN BHAKTI 3',
      logo: '🏦 Mandiri'
    },
    {
      bank: 'QRIS',
      accountNumber: 'NMID: ID102009238411',
      accountName: 'JALAN BHAKTI 3 RESTO',
      logo: '📱 QRIS All Payment'
    }
  ],
  deliveryDaysText: 'Selasa s/d Jumat (Pre-Order)',
  flatOngkirOptions: [
    { 
      label: '🚗 Diambil Pembeli (Gojek / Grab / Lalamove) - Rp 0 (DEFAULT)', 
      value: 0,
      description: 'Makanan diambil sendiri via kurir instan GoSend/GrabExpress/Lalamove yang dipesan pembeli.'
    },
    { 
      label: '🛵 Antar Kurir Resto (Area Jaksel < 5km) - Rp 15.000', 
      value: 15000,
      description: 'Diantarkan oleh kurir internal Jalan Bhakti 3.'
    },
    { 
      label: '🛵 Antar Kurir Resto (Area Luar Jaksel 5-10km) - Rp 25.000', 
      value: 25000,
      description: 'Diantarkan oleh kurir internal Jalan Bhakti 3.'
    }
  ]
};

export const MENU_CATEGORIES = ['Semua', 'Main', 'Lunch Box', 'Condiment'];

export const SPICE_LEVELS = [
  { id: 'mild', label: '🌶️ Saus Mild (Sedang)', desc: 'Pedas gurih ramah lidah dengan rempah peri-peri khas' },
  { id: 'hot', label: '🌶️🌶️ Saus Hot (Pedas Mantap)', desc: 'Pedas nampol dari racikan cabai peri-peri asli, favorit!' }
];

export const ORDER_STATUSES = [
  'Menunggu Pembayaran',
  'Lunas',
  'Diproses',
  'Siap Kirim',
  'Selesai',
  'Dibatalkan'
];

export const STATUS_COLORS = {
  'Menunggu Pembayaran': 'bg-amber-100 text-amber-800 border-amber-300',
  'Lunas': 'bg-blue-100 text-blue-800 border-blue-300',
  'Diproses': 'bg-purple-100 text-purple-800 border-purple-300',
  'Siap Kirim': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Selesai': 'bg-stone-200 text-stone-800 border-stone-300',
  'Dibatalkan': 'bg-rose-100 text-rose-800 border-rose-300'
};

export const LOYALTY_COLORS = {
  'VIP': 'bg-purple-100 text-purple-800 border-purple-300 font-semibold',
  'Reguler': 'bg-blue-100 text-blue-800 border-blue-300',
  'Baru': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Churn': 'bg-rose-100 text-rose-800 border-rose-300 font-medium'
};

// Menu Makanan sesuai spesifikasi terbaru Jalan Bhakti 3
export const INITIAL_MENU = [
  {
    id: 'menu-1',
    nama: 'Ayam Utuh',
    kategori: 'Main',
    harga: 150000,
    deskripsi: 'Ayam panggang utuh khas Jalan Bhakti 3 marinasi 24 jam dengan racikan cabai peri-peri & rempah istimewa. Juicy di dalam, smoky di luar. (Pilihan Saus Mild atau Hot)',
    foto_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
    pilihan_level_pedas: true,
    is_tersedia: true,
    badge: 'Signature Whole Chicken'
  },
  {
    id: 'menu-2',
    nama: 'Lunch Box (White Rice + Coleslaw)',
    kategori: 'Lunch Box',
    harga: 40000,
    deskripsi: 'Paket makan siang komplit: Potongan ayam peri-peri flame-grilled, White Rice hangat pulen, dan Salad Coleslaw segar dingin. (Pilihan Saus Mild atau Hot)',
    foto_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
    pilihan_level_pedas: true,
    is_tersedia: true,
    badge: 'Best Value Lunch'
  },
  {
    id: 'menu-3',
    nama: 'Lunch Box (Mashed Potatoes + Coleslaw)',
    kategori: 'Lunch Box',
    harga: 45000,
    deskripsi: 'Paket makan siang premium: Potongan ayam peri-peri flame-grilled, Creamy Mashed Potatoes lembut dengan gravy, dan Salad Coleslaw segar dingin. (Pilihan Saus Mild atau Hot)',
    foto_url: 'https://images.unsplash.com/photo-1514944298352-b88307db1154?auto=format&fit=crop&w=800&q=80',
    pilihan_level_pedas: true,
    is_tersedia: true,
    badge: 'Staff Favorite'
  },
  {
    id: 'menu-4',
    nama: 'Tambahan Saus Mild',
    kategori: 'Condiment',
    harga: 10000,
    deskripsi: 'Extra cup Saus Peri-Peri level Mild (pedas sedang & rempah gurih khas Jalan Bhakti 3).',
    foto_url: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80',
    pilihan_level_pedas: false,
    is_tersedia: true
  },
  {
    id: 'menu-5',
    nama: 'Tambahan Saus Hot',
    kategori: 'Condiment',
    harga: 10000,
    deskripsi: 'Extra cup Saus Peri-Peri level Hot (pedas mantap membakar selera khas cabai asli).',
    foto_url: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
    pilihan_level_pedas: false,
    is_tersedia: true
  },
  {
    id: 'menu-6',
    nama: 'Mashed Potatoes',
    kategori: 'Condiment',
    harga: 20000,
    deskripsi: 'Porsi ekstra kentang tumbuk buttery yang lembut disiram kuah gravy peri-peri hangat.',
    foto_url: 'https://images.unsplash.com/photo-1514944298352-b88307db1154?auto=format&fit=crop&w=800&q=80',
    pilihan_level_pedas: false,
    is_tersedia: true
  },
  {
    id: 'menu-7',
    nama: 'Coleslaw',
    kategori: 'Condiment',
    harga: 20000,
    deskripsi: 'Porsi ekstra salad irisan kubis & wortel renyah berpadu dressing asam manis menyegarkan.',
    foto_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    pilihan_level_pedas: false,
    is_tersedia: true
  }
];
