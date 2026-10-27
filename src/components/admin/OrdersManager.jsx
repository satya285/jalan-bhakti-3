import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Truck, 
  Check, 
  X, 
  ExternalLink, 
  MessageCircle, 
  Eye, 
  Search, 
  Calendar, 
  MapPin, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatRupiah, formatDate, formatDateTime, shortUUID, cleanWhatsAppNumber } from '../../lib/utils';
import { ORDER_STATUSES, STATUS_COLORS, LOYALTY_COLORS } from '../../lib/types';

export default function OrdersManager({
  orders,
  onUpdateStatus,
  onPrintThermal
}) {
  const [selectedStatusTab, setSelectedStatusTab] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState('Semua');

  // Unique delivery dates among orders
  const deliveryDates = ['Semua', ...Array.from(new Set(orders.map(o => o.jadwal_pengiriman).filter(Boolean)))];

  const filteredOrders = orders.filter(order => {
    const matchesTab = selectedStatusTab === 'Semua' || order.status_pesanan === selectedStatusTab;
    const matchesDate = selectedDateFilter === 'Semua' || order.jadwal_pengiriman === selectedDateFilter;
    const matchesSearch = 
      order.nama_pelanggan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.no_wa?.includes(searchQuery) ||
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesDate && matchesSearch;
  });

  const countByStatus = (status) => {
    if (status === 'Semua') return orders.length;
    return orders.filter(o => o.status_pesanan === status).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['Semua', ...ORDER_STATUSES].map(status => {
            const count = countByStatus(status);
            const isSelected = selectedStatusTab === status;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatusTab(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <span>{status}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-stone-950 text-amber-400 font-black' : 'bg-stone-800 text-stone-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Date Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDateFilter}
            onChange={e => setSelectedDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="Semua">Semua Jadwal Kirim</option>
            {deliveryDates.filter(d => d !== 'Semua').map(d => (
              <option key={d} value={d}>
                Kirim: {formatDate(d)}
              </option>
            ))}
          </select>

          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari pemesan / WA..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

      </div>

      {/* Orders List Grid */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const hasBukti = Boolean(order.pembayaran?.bukti_transfer_url);

            return (
              <div
                key={order.order_id}
                className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-4 transition-all hover:border-stone-700"
              >
                {/* Order Header Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-base">
                        #{shortUUID(order.order_id)}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status_pesanan] || 'bg-stone-800'}`}>
                        {order.status_pesanan}
                      </span>
                      {order.pembayaran?.metode && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                          {order.pembayaran.metode}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 flex items-center gap-2 flex-wrap">
                      <span>Pesan: {formatDateTime(order.waktu_pesan)}</span>
                      <span>•</span>
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Jadwal Kirim: {formatDate(order.jadwal_pengiriman)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Contact & Quick WA */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${cleanWhatsAppNumber(order.no_wa)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WA: {order.no_wa}</span>
                    </a>

                    <button
                      onClick={() => onPrintThermal(order)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition-colors"
                      title="Cetak Label Thermal Kurir"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cetak Struk</span>
                    </button>
                  </div>
                </div>

                {/* Customer Details & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-bold text-stone-400 block uppercase tracking-wider text-[10px]">
                      Penerima & Alamat Pengiriman:
                    </span>
                    <p className="font-bold text-stone-200 text-sm">
                      {order.nama_pelanggan}
                    </p>
                    <p className="text-stone-300 leading-relaxed">
                      {order.alamat_pengiriman}
                    </p>
                    {order.link_gmaps && (
                      <a
                        href={order.link_gmaps}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-amber-400 hover:underline pt-0.5"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Link Pin Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {order.catatan && (
                      <p className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-amber-300/90 italic">
                        Catatan: "{order.catatan}"
                      </p>
                    )}
                  </div>

                  {/* Items Breakdown */}
                  <div className="space-y-1.5 bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800">
                    <span className="font-bold text-stone-400 block uppercase tracking-wider text-[10px]">
                      Daftar Pesanan:
                    </span>
                    <div className="space-y-1">
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} className="flex justify-between items-start text-stone-300">
                          <div>
                            <span className="font-bold text-amber-400 mr-1.5">{it.qty}x</span>
                            <span>{it.nama_item}</span>
                            {it.catatan_item && (
                              <span className="block text-[11px] text-stone-400 italic pl-5">
                                {it.catatan_item}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-stone-400">
                            {formatRupiah(it.harga_satuan * it.qty)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-800 space-y-0.5 text-stone-400">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatRupiah(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ongkir:</span>
                        <span>{formatRupiah(order.ongkir)}</span>
                      </div>
                      <div className="flex justify-between text-amber-400">
                        <span>Kode Unik:</span>
                        <span>+{order.kode_unik}</span>
                      </div>
                      <div className="flex justify-between font-black text-white text-sm pt-1 border-t border-stone-800/80">
                        <span>Grand Total:</span>
                        <span className="text-amber-400 font-mono">{formatRupiah(order.grand_total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions & Proof Verification */}
                <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Proof thumbnail if available */}
                  <div className="flex items-center gap-2.5">
                    {hasBukti ? (
                      <button
                        onClick={() => setSelectedProofUrl(order.pembayaran.bukti_transfer_url)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span>Lihat Bukti Transfer</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          order.pembayaran.status_verifikasi === 'Terverifikasi'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {order.pembayaran.status_verifikasi || 'Menunggu'}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-stone-500 italic">
                        Belum ada bukti transfer diunggah
                      </span>
                    )}
                  </div>

                  {/* Status Progression Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status_pesanan === 'Menunggu Pembayaran' && (
                      <button
                        onClick={() => onUpdateStatus(order.order_id, 'Lunas')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verifikasi Lunas</span>
                      </button>
                    )}

                    {order.status_pesanan === 'Lunas' && (
                      <button
                        onClick={() => onUpdateStatus(order.order_id, 'Diproses')}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Mulai Masak / Proses</span>
                      </button>
                    )}

                    {order.status_pesanan === 'Diproses' && (
                      <button
                        onClick={() => onUpdateStatus(order.order_id, 'Siap Kirim')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Tandai Siap Kirim</span>
                      </button>
                    )}

                    {order.status_pesanan === 'Siap Kirim' && (
                      <button
                        onClick={() => onUpdateStatus(order.order_id, 'Selesai')}
                        className="px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Selesaikan Pesanan</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-stone-900 rounded-3xl border border-stone-800 text-stone-400">
            <p className="font-bold text-stone-300">Tidak ada pesanan</p>
            <p className="text-xs text-stone-500 mt-1">
              Tidak ada data pesanan untuk filter status atau tanggal yang dipilih.
            </p>
          </div>
        )}
      </div>

      {/* Modal Zoom Bukti Transfer */}
      {selectedProofUrl && (
        <div 
          onClick={() => setSelectedProofUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-lg w-full bg-stone-900 rounded-3xl border border-stone-800 p-4 space-y-3"
          >
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h4 className="font-bold text-sm text-white">Bukti Transfer Pembayaran</h4>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-black flex items-center justify-center p-2">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer Preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
