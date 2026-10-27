import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatRupiah } from '../lib/utils';
import { STORE_INFO } from '../lib/types';

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout
}) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 text-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Keranjang Pesanan</h2>
                <p className="text-xs text-stone-400">
                  {items.length} jenis item dipilih
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 divide-y divide-stone-800/80">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-stone-800/60 flex items-center justify-center text-stone-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-300">Keranjang masih kosong</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Pilih Ayam Utuh Peri-Peri atau Lunch Box favorit Anda dari katalog menu.
                </p>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={index} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                  {item.foto_url && (
                    <img
                      src={item.foto_url}
                      alt={item.nama}
                      className="w-16 h-16 rounded-xl object-cover bg-stone-800 flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-bold text-sm text-stone-100 truncate">
                      {item.nama}
                    </h4>

                    {item.catatan && (
                      <p className="text-[11px] text-amber-400 font-medium">
                        {item.catatan}
                      </p>
                    )}

                    <div className="text-xs font-black text-stone-300">
                      {formatRupiah(item.harga)}
                    </div>

                    {/* Quantity & Remove */}
                    <div className="pt-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-stone-800/80 rounded-lg px-2 py-1 border border-stone-700">
                        <button
                          onClick={() => onUpdateQty(index, item.qty - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-300 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 min-w-[16px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(index, item.qty + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-300 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400">
                          {formatRupiah(item.harga * item.qty)}
                        </span>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-stone-500 hover:text-red-400 p-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-stone-950 border-t border-stone-800 space-y-4">
              
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Sistem Pre-Order: Jadwal pengiriman dapat Anda pilih pada tahap selanjutnya (Selasa - Jumat).
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Subtotal Menu</span>
                  <span className="font-bold text-stone-200">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Ongkos Kirim & Kode Unik</span>
                  <span className="text-stone-400">Dihitung saat Checkout</span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-stone-200">Estimasi Subtotal</span>
                  <span className="font-black text-xl text-amber-400">{formatRupiah(subtotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
              >
                <span>Lanjut ke Pengiriman</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
