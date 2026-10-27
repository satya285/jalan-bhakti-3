import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Phone, User, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, ExternalLink, Car, Bike } from 'lucide-react';
import { formatRupiah, generateKodeUnik, getNextDeliveryDates } from '../lib/utils';
import { STORE_INFO, LOYALTY_COLORS } from '../lib/types';
import { api } from '../lib/supabase';

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  onOrderSuccess
}) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

  // Delivery dates available (Selasa - Jumat)
  const deliveryDates = getNextDeliveryDates();

  // Form State
  const [noWa, setNoWa] = useState('');
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [linkGmaps, setLinkGmaps] = useState('');
  const [jadwalPengiriman, setJadwalPengiriman] = useState(deliveryDates[0]?.isoDate || '');
  
  // BY DEFAULT: Makanan diambil sendiri via Gojek/Grab/Lalamove (Rp 0)
  const [ongkir, setOngkir] = useState(STORE_INFO.flatOngkirOptions[0].value); // Default Rp 0
  const [metodeBayar, setMetodeBayar] = useState('Transfer BCA');
  const [catatan, setCatatan] = useState('');
  
  // Random unique code (1-999) generated on checkout mount
  const [kodeUnik, setKodeUnik] = useState(generateKodeUnik());

  // CRM Lookup State
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [crmCustomer, setCrmCustomer] = useState(null);
  const [lookupMessage, setLookupMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-lookup customer data when WA number reaches 10+ digits
  useEffect(() => {
    const cleanNumber = noWa.replace(/[^0-9]/g, '');
    if (cleanNumber.length >= 10) {
      let isCurrent = true;
      setIsLookingUp(true);

      const timer = setTimeout(async () => {
        try {
          const found = await api.findCustomerByPhone(cleanNumber);
          if (isCurrent && found) {
            setCrmCustomer(found);
            if (!namaPelanggan) setNamaPelanggan(found.nama_pelanggan || '');
            if (!alamat && found.alamat_default) setAlamat(found.alamat_default);
            setLookupMessage(`Selamat datang kembali, Kak ${found.nama_pelanggan}! Data alamat Anda telah terisi otomatis.`);
          } else if (isCurrent) {
            setCrmCustomer(null);
            setLookupMessage('');
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (isCurrent) setIsLookingUp(false);
        }
      }, 400);

      return () => {
        isCurrent = false;
        clearTimeout(timer);
      };
    } else {
      setCrmCustomer(null);
      setLookupMessage('');
    }
  }, [noWa]);

  const grandTotal = subtotal + Number(ongkir) + Number(kodeUnik);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noWa || !namaPelanggan || !alamat || !jadwalPengiriman) {
      alert('Mohon lengkapi Nomor WhatsApp, Nama, Alamat, dan Jadwal Pengiriman.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await api.createOrder({
        customerData: {
          no_wa: noWa.trim(),
          nama_pelanggan: namaPelanggan.trim()
        },
        orderData: {
          jadwal_pengiriman: jadwalPengiriman,
          alamat_pengiriman: alamat.trim(),
          link_gmaps: linkGmaps.trim() || null,
          subtotal,
          ongkir: Number(ongkir),
          kode_unik: Number(kodeUnik),
          grand_total: grandTotal,
          metode_pembayaran: metodeBayar,
          catatan: catatan.trim() || null
        },
        items: items
      });

      onOrderSuccess(order);
    } catch (err) {
      console.error('Submit order error:', err);
      alert('Terjadi kesalahan saat memproses pesanan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl text-white overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900/95 sticky top-0 z-10">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
              Checkout & Konfirmasi
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Data Pesanan & Tagihan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center hover:bg-stone-700 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* CRM Notification if customer is recognized */}
          {crmCustomer && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300">
                    Pelanggan Terdaftar
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-stone-950 font-black">
                    {crmCustomer.total_order > 4 ? 'VIP Customer' : 'Member Bhakti 3'}
                  </span>
                </div>
                <p className="text-stone-300">{lookupMessage}</p>
              </div>
            </div>
          )}

          {/* Bagian 1: Data Kontak & Pemesan */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              1. Informasi Pemesan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* WhatsApp Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300 flex items-center justify-between">
                  <span>Nomor WhatsApp *</span>
                  {isLookingUp && <span className="text-[11px] text-amber-400 animate-pulse">Memeriksa CRM...</span>}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={noWa}
                    onChange={e => setNoWa(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-stone-500">
                  Untuk notifikasi status dan auto-fill riwayat pemesanan.
                </p>
              </div>

              {/* Nama Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">
                  Nama Pemesan / Penerima *
                </label>
                <input
                  type="text"
                  required
                  value={namaPelanggan}
                  onChange={e => setNamaPelanggan(e.target.value)}
                  placeholder="Nama Lengkap / Panggilan"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Jadwal Pre-Order & Pengambilan */}
          <div className="space-y-3.5 pt-2 border-t border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              2. Jadwal Pre-Order & Metode Pengambilan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Jadwal Date Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">
                  Pilih Tanggal Pengiriman / Pengambilan *
                </label>
                <select
                  value={jadwalPengiriman}
                  onChange={e => setJadwalPengiriman(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-medium"
                >
                  {deliveryDates.map(d => (
                    <option key={d.isoDate} value={d.isoDate}>
                      {d.display} (Batch Pre-Order)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-400/90 font-medium">
                  ⚡ Pre-order siap Selasa s/d Jumat, dipanggang fresh di hari H.
                </p>
              </div>

              {/* Pilihan Metode Pengambilan / Ongkir */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">
                  Metode Pengambilan Makanan *
                </label>
                <select
                  value={ongkir}
                  onChange={e => setOngkir(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-medium"
                >
                  {STORE_INFO.flatOngkirOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Default Pickup Banner Note */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
              <Car className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-white block font-bold">Default: Diambil Sendiri oleh Pembeli (Rp 0)</strong>
                <span>Makanan diambil via <strong>Gojek / Grab / Lalamove</strong> yang dipesan sendiri oleh pembeli saat pesanan berstatus Siap Kirim (atau diambil langsung ke lokasi Jalan Bhakti 3).</span>
              </div>
            </div>

            {/* Alamat Pengiriman / Titik Antar Kurir */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300 flex items-center justify-between">
                <span>Alamat Tujuan Pengantaran / Rumah Anda *</span>
                <span className="text-[10px] text-stone-500 font-normal">Dicetak pada label thermal kurir</span>
              </label>
              <textarea
                required
                rows={2}
                value={alamat}
                onChange={e => setAlamat(e.target.value)}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan (misal: pagar hitam depan pos satpam)..."
                className="w-full px-4 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Link Google Maps Pin */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300 flex items-center justify-between">
                <span>Link Pin Google Maps (Sangat Disarankan)</span>
                {linkGmaps && (
                  <a
                    href={linkGmaps}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Uji Pin Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="url"
                  value={linkGmaps}
                  onChange={e => setLinkGmaps(e.target.value)}
                  placeholder="https://maps.app.goo.gl/... atau koordinat pin lokasi Anda"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[10px] text-stone-500">
                Link maps ini otomatis diubah menjadi QR Code pada struk kurir agar driver Gojek/Grab/Lalamove langsung scan dan tiba tepat di tujuan.
              </p>
            </div>
          </div>

          {/* Bagian 3: Metode Pembayaran */}
          <div className="space-y-2.5 pt-2 border-t border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              3. Metode Pembayaran Transfer
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {['Transfer BCA', 'Transfer Mandiri', 'QRIS'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetodeBayar(m)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left ${
                    metodeBayar === m
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                      : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-600'
                  }`}
                >
                  <span className="truncate">{m}</span>
                  {metodeBayar === m && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 hidden sm:block" />}
                </button>
              ))}
            </div>
          </div>

          {/* Bagian 4: Ringkasan & Kalkulasi Kode Unik */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Subtotal Menu ({items.length} item)</span>
              <span className="font-bold text-stone-200">{formatRupiah(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-xs text-stone-400">
              <span>Ongkos Kirim</span>
              <span className="font-bold text-stone-200">
                {ongkir === 0 ? 'Rp 0 (Diambil Pembeli via Gojek/Grab/Lalamove)' : formatRupiah(ongkir)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-amber-400/90 items-center">
              <div className="flex items-center gap-1.5">
                <span>Kode Unik Verifikasi Pembayaran</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Otomatis
                </span>
              </div>
              <span className="font-black font-mono text-amber-400">
                +{kodeUnik}
              </span>
            </div>

            <div className="pt-2.5 border-t border-stone-800 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-stone-400 block font-medium">Total Tagihan Transfer</span>
                <span className="text-[10px] text-amber-400">Nominal unik wajib ditransfer persis</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {/* Action Submit */}
          <div className="pt-1 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <span>Memproses Pesanan...</span>
              ) : (
                <>
                  <span>Buat Tagihan Pesanan ({formatRupiah(grandTotal)})</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
