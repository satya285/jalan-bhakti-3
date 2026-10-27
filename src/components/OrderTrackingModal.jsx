import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, Clock, ChefHat, Truck, Check, MapPin, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { formatRupiah, formatDate, shortUUID } from '../lib/utils';
import { ORDER_STATUSES, STATUS_COLORS } from '../lib/types';
import { api } from '../lib/supabase';

const STEPS = [
  { status: 'Menunggu Pembayaran', icon: Clock, label: 'Menunggu Pembayaran' },
  { status: 'Lunas', icon: CheckCircle2, label: 'Lunas & Terverifikasi' },
  { status: 'Diproses', icon: ChefHat, label: 'Diproses Dapur' },
  { status: 'Siap Kirim', icon: Truck, label: 'Siap Kirim' },
  { status: 'Selesai', icon: Check, label: 'Pesanan Selesai' }
];

export default function OrderTrackingModal({
  isOpen,
  onClose,
  initialOrderId
}) {
  if (!isOpen) return null;

  const [query, setQuery] = useState(initialOrderId || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = async (overrideQuery) => {
    const q = (overrideQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);
    try {
      const allOrders = await api.getOrders();
      const filtered = allOrders.filter(o => 
        o.order_id === q ||
        o.order_id.toLowerCase().includes(q.toLowerCase()) ||
        shortUUID(o.order_id).toLowerCase() === q.toLowerCase() ||
        o.no_wa.includes(q.replace(/[^0-9]/g, ''))
      );
      setOrders(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const idx = STEPS.findIndex(s => s.status === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl text-white overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Pelacakan Status
            </span>
            <h2 className="text-xl font-bold text-white">
              Lacak Pesanan Jalan Bhakti 3
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 sm:p-6 border-b border-stone-800 bg-stone-950/50">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Masukkan Nomor WhatsApp atau Kode Pesanan (contoh: 0812... / 111111)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-colors active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </form>
        </div>

        {/* Results List */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {orders.length > 0 ? (
            orders.map(order => {
              const currentStep = getStepIndex(order.status_pesanan);

              return (
                <div 
                  key={order.order_id}
                  className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-5"
                >
                  {/* Order Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-base">
                          #{shortUUID(order.order_id)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status_pesanan] || 'bg-stone-800'}`}>
                          {order.status_pesanan}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Penerima: <strong className="text-stone-200">{order.nama_pelanggan}</strong> ({order.no_wa})
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-stone-500 block">Jadwal Pengiriman</span>
                      <span className="text-xs font-bold text-stone-200">
                        {formatDate(order.jadwal_pengiriman)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal / Vertical Progress Steps */}
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-1 relative">
                      {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={idx} className="flex flex-col items-center text-center space-y-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                              isCurrent
                                ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 font-black scale-110'
                                : isCompleted
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'bg-stone-800 text-stone-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] leading-tight hidden sm:block ${
                              isCurrent ? 'font-black text-amber-400' : isCompleted ? 'text-stone-300 font-medium' : 'text-stone-500'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items Breakdown */}
                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
                    <span className="font-bold text-stone-400 block uppercase tracking-wider text-[10px]">
                      Menu yang Dipesan:
                    </span>
                    {(order.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-stone-300">
                        <span>• {it.nama_item} <strong className="text-amber-400">({it.qty}x)</strong> {it.catatan_item && <span className="text-stone-400 italic">[{it.catatan_item}]</span>}</span>
                        <span className="font-mono">{formatRupiah(it.harga_satuan * it.qty)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-amber-400">
                      <span>Total Bayar (Termasuk Ongkir & Kode Unik):</span>
                      <span className="font-mono text-sm">{formatRupiah(order.grand_total)}</span>
                    </div>
                  </div>

                  {/* Address & Pin */}
                  <div className="text-xs text-stone-400 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-stone-300">{order.alamat_pengiriman}</p>
                      {order.link_gmaps && (
                        <a 
                          href={order.link_gmaps} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-amber-400 hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                        >
                          <span>Buka Pin Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          ) : searched ? (
            <div className="py-12 text-center space-y-2 text-stone-400">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-stone-200">Pesanan Tidak Ditemukan</p>
              <p className="text-xs text-stone-500">
                Pastikan nomor WhatsApp atau nomor pesanan yang dimasukkan sudah sesuai.
              </p>
            </div>
          ) : (
            <div className="py-12 text-center text-stone-500 text-xs">
              Ketikkan nomor WhatsApp Anda di atas untuk melihat seluruh riwayat dan progres status pesanan Anda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
