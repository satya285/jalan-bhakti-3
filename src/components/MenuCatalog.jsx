import React, { useState } from 'react';
import { Flame, Clock, Calendar, Sparkles, Plus, Search, MapPin } from 'lucide-react';
import { formatRupiah } from '../lib/utils';
import { MENU_CATEGORIES, STORE_INFO } from '../lib/types';

export default function MenuCatalog({ menu, onSelectItem, onQuickAdd }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'Semua' || item.kategori === selectedCategory;
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Pre-Order Announcement Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white border border-stone-800 shadow-2xl p-6 sm:p-10">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold tracking-wide uppercase">
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span>Sistem Pemesanan Pre-Order Batch</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Sensasi Smoky & Pedas Asli{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
              Ayam Peri-Peri Jalan Bhakti 3
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
            Ayam segar pilihan dimarinasi 24 jam dengan racikan cabai African bird's eye chili, rempah aromatik, & jeruk segar. Dipanggang di atas bara api khusus hanya setiap hari <strong className="text-amber-400 font-bold">Selasa s/d Jumat</strong>.
          </p>

          {/* Value Props Pills */}
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] sm:text-xs font-medium text-stone-300">
            <div className="flex items-center gap-1.5 bg-stone-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700/60">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Pre-Order: <strong>Selasa - Jumat</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700/60">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Fresh Flame-Grilled</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30">
              <span>🚗 Diambil via Gojek / Grab / Lalamove</span>
            </div>
          </div>

        </div>
      </section>

      {/* Filter Categories & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {MENU_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari menu lezat..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-200 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map(item => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group cursor-pointer bg-stone-900 border border-stone-800/80 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
          >
            {/* Image Container */}
            <div className="relative h-48 sm:h-52 w-full bg-stone-800 overflow-hidden">
              <img
                src={item.foto_url}
                alt={item.nama}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80" />
              
              {/* Badge */}
              {item.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-black text-[11px] uppercase tracking-wider shadow-md">
                  {item.badge}
                </span>
              )}

              {/* Spice Indicator */}
              {item.pilihan_level_pedas && (
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-amber-400 font-bold text-xs flex items-center gap-1 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  <span>Pilihan Level Pedas</span>
                </span>
              )}
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                  {item.kategori}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {item.nama}
                </h3>
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>

              {/* Price & Action */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-800/80">
                <div>
                  <span className="text-xs text-stone-500 block">Harga</span>
                  <span className="text-lg font-black text-amber-400">
                    {formatRupiah(item.harga)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.pilihan_level_pedas) {
                      onSelectItem(item);
                    } else {
                      onQuickAdd(item);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-stone-950 font-bold text-xs border border-amber-500/30 hover:border-amber-400 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{item.pilihan_level_pedas ? 'Pilih Level' : 'Tambah'}</span>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {filteredMenu.length === 0 && (
        <div className="text-center py-16 bg-stone-900/50 rounded-3xl border border-stone-800 p-8">
          <p className="text-stone-400 text-sm">
            Tidak ada menu yang cocok dengan kata kunci "{searchQuery}".
          </p>
        </div>
      )}

    </div>
  );
}
