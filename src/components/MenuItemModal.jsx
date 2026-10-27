import React, { useState } from 'react';
import { X, Plus, Minus, Flame, Sparkles, Check } from 'lucide-react';
import { formatRupiah } from '../lib/utils';
import { SPICE_LEVELS } from '../lib/types';

export default function MenuItemModal({ item, onClose, onAddToCart }) {
  if (!item) return null;

  const [selectedSpice, setSelectedSpice] = useState(
    item.pilihan_level_pedas ? (SPICE_LEVELS[0] || null) : null // Default Mild
  );
  const [qty, setQty] = useState(1);
  const [catatan, setCatatan] = useState('');

  const totalPrice = item.harga * qty;

  const handleAdd = () => {
    let finalNotes = [];
    if (selectedSpice) {
      finalNotes.push(`Level: ${selectedSpice.label}`);
    }
    if (catatan.trim()) {
      finalNotes.push(catatan.trim());
    }

    onAddToCart({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga,
      foto_url: item.foto_url,
      qty: qty,
      spiceLevel: selectedSpice?.label || null,
      catatan: finalNotes.join(' | ')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:max-w-lg bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Image Header */}
        <div className="relative h-48 sm:h-56 w-full bg-stone-800 overflow-hidden">
          <img
            src={item.foto_url}
            alt={item.nama}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-300 hover:text-white flex items-center justify-center border border-stone-700 hover:scale-105 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {item.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md">
              {item.badge}
            </span>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
              {item.kategori}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {item.nama}
            </h3>
            <p className="text-lg font-black text-amber-400">
              {formatRupiah(item.harga)}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <p className="text-sm text-stone-300 leading-relaxed">
            {item.deskripsi}
          </p>

          {/* Spice Level Selector if enabled */}
          {item.pilihan_level_pedas && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500" />
                Pilih Tingkat Kepedasan Saus Peri-Peri:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SPICE_LEVELS.map(spice => {
                  const isSelected = selectedSpice?.id === spice.id;
                  return (
                    <button
                      key={spice.id}
                      type="button"
                      onClick={() => setSelectedSpice(spice)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white font-medium shadow-sm'
                          : 'bg-stone-800/60 border-stone-700/80 text-stone-400 hover:border-stone-600 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-stone-200'}`}>
                          {spice.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <span className="text-[11px] text-stone-400 line-clamp-2">
                        {spice.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catatan / Request Khusus */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Catatan Khusus (Opsional):
            </label>
            <input
              type="text"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Contoh: Saus dipisah, ayam potong 4, ekstra sendok..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer / Add to Cart Action */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-4">
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-white text-base min-w-[20px] text-center">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <span>Tambah ke Keranjang</span>
            <span>•</span>
            <span>{formatRupiah(totalPrice)}</span>
          </button>

        </div>
      </div>
    </div>
  );
}
