import React from 'react';
import { Flame, ShoppingBag, Search, ShieldCheck, Database, UtensilsCrossed, Smartphone } from 'lucide-react';
import { formatRupiah } from '../lib/utils';
import { STORE_INFO } from '../lib/types';

export default function Navbar({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenTracking,
  isAdmin,
  setIsAdmin,
  isLiveSupabase,
  onOpenSupabaseSettings,
  onOpenInstall
}) {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-white border-b border-stone-800 shadow-lg pt-[max(env(safe-area-inset-top),0px)]">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setIsAdmin(false)}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-base sm:text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  {STORE_INFO.name}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Peri-Peri
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-400 hidden xs:block">
                Pre-Order Selasa - Jumat • Ciganjur
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Supabase Indicator Pill */}
            <button
              onClick={onOpenSupabaseSettings}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium border transition-all ${
                isLiveSupabase
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
              }`}
              title="Klik untuk konfigurasi Supabase Database"
            >
              <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{isLiveSupabase ? 'Supabase Live' : 'Demo DB'}</span>
              <span className="sm:hidden">{isLiveSupabase ? 'Live' : 'Demo'}</span>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLiveSupabase ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            </button>

            {/* Install Shortcut Pill for Mobile/Desktop */}
            <button
              onClick={onOpenInstall}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all active:scale-95"
              title="Pasang Pintasan di Layar Utama HP"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pintasan HP</span>
            </button>

            {/* Lacak Pesanan Button (Desktop / Tablet) */}
            {!isAdmin && (
              <button
                onClick={onOpenTracking}
                className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-300 bg-stone-800/80 hover:bg-stone-800 hover:text-white border border-stone-700 transition-all"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>Lacak Pesanan</span>
              </button>
            )}

            {/* Toggle Mode Pelanggan / Admin */}
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-medium transition-all border ${
                isAdmin
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {isAdmin ? (
                <>
                  <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Katalog</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span className="hidden sm:inline">Admin Resto</span>
                  <span className="sm:hidden">Admin</span>
                </>
              )}
            </button>

            {/* Cart Button (Desktop only, on mobile handled by bottom nav and float bar) */}
            {!isAdmin && (
              <button
                onClick={onOpenCart}
                className="hidden sm:flex relative items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-stone-950" />
                <span>Keranjang</span>
                {cartCount > 0 && (
                  <span className="ml-1 bg-stone-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-black">
                    {cartCount}
                  </span>
                )}
                {cartTotal > 0 && (
                  <span className="pl-1 border-l border-stone-900/20 font-black">
                    {formatRupiah(cartTotal)}
                  </span>
                )}
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
