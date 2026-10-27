import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatRupiah } from '../lib/utils';

export default function MobileCartBar({
  cartCount,
  cartTotal,
  onOpenCart
}) {
  if (cartCount === 0) return null;

  return (
    <div className="no-print md:hidden fixed bottom-[calc(max(env(safe-area-inset-bottom),10px)+58px)] left-0 right-0 z-30 px-3 pointer-events-none animate-slide-up">
      <div 
        onClick={onOpenCart}
        className="pointer-events-auto max-w-md mx-auto p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-red-600 text-stone-950 shadow-[0_8px_25px_rgba(245,158,11,0.4)] flex items-center justify-between cursor-pointer active:scale-98 transition-transform font-bold"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center font-black text-xs shadow-inner">
            {cartCount}
          </div>
          <div className="leading-tight">
            <span className="text-[11px] uppercase tracking-wider block opacity-90 text-stone-900 font-extrabold">
              Total Keranjang
            </span>
            <span className="text-base font-black text-stone-950 font-mono">
              {formatRupiah(cartTotal)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black bg-stone-950 text-amber-400 px-3.5 py-2 rounded-xl shadow-sm">
          <span>Lihat Pesanan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
