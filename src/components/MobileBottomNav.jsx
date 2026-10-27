import React from 'react';
import { Utensils, ShoppingBag, Search, ShieldCheck, UserCheck } from 'lucide-react';
import { formatRupiah } from '../lib/utils';

export default function MobileBottomNav({
  activeTab,
  cartCount,
  cartTotal,
  onOpenMenu,
  onOpenCart,
  onOpenTracking,
  isAdmin,
  onToggleAdmin
}) {
  return (
    <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-xl border-t border-stone-800 shadow-[0_-8px_25px_rgba(0,0,0,0.5)] pb-[max(env(safe-area-inset-bottom),10px)] pt-2 px-3">
      <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto text-center">
        
        {/* Tab 1: Menu / Katalog */}
        <button
          onClick={onOpenMenu}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            !isAdmin
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${!isAdmin ? 'bg-amber-500/20 text-amber-400' : ''}`}>
            <Utensils className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>

        {/* Tab 2: Keranjang Belanja */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 text-stone-400 hover:text-amber-400 transition-all active:scale-90"
        >
          <div className="relative p-1 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-gradient-to-r from-amber-500 to-red-500 text-stone-950 text-[10px] w-5 h-5 rounded-full font-black flex items-center justify-center shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {cartCount > 0 ? formatRupiah(cartTotal) : 'Keranjang'}
          </span>
        </button>

        {/* Tab 3: Lacak Pesanan */}
        <button
          onClick={onOpenTracking}
          className="flex flex-col items-center justify-center py-1 text-stone-400 hover:text-amber-400 transition-all active:scale-90"
        >
          <div className="p-1 rounded-xl">
            <Search className="w-5 h-5 text-stone-300" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Lacak</span>
        </button>

        {/* Tab 4: Admin Resto */}
        <button
          onClick={onToggleAdmin}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            isAdmin
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isAdmin ? 'bg-amber-500/20 text-amber-400' : ''}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {isAdmin ? 'Mode Admin' : 'Admin'}
          </span>
        </button>

      </div>
    </nav>
  );
}
