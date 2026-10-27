import React, { useState, useMemo } from 'react';
import { ChefHat, Calendar, CheckSquare, Square, Printer, Flame, Utensils, Sparkles } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function KitchenPrepView({ orders }) {
  // Extract all distinct delivery dates
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(orders.map(o => o.jadwal_pengiriman).filter(Boolean)));
    return dates.sort();
  }, [orders]);

  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');
  const [checkedItems, setCheckedItems] = useState({});

  // Filter orders that need cooking (Lunas, Diproses, Siap Kirim) for the selected date
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.jadwal_pengiriman === selectedDate &&
      ['Lunas', 'Diproses', 'Siap Kirim'].includes(o.status_pesanan)
    );
  }, [orders, selectedDate]);

  // Aggregate items
  const aggregatedData = useMemo(() => {
    const summary = {};
    const spiceCounts = {};

    filteredOrders.forEach(order => {
      (order.items || []).forEach(it => {
        const key = it.nama_item;
        if (!summary[key]) {
          summary[key] = {
            nama: it.nama_item,
            kategori: it.kategori_item || 'Menu',
            totalQty: 0,
            notes: []
          };
        }
        summary[key].totalQty += it.qty;

        if (it.catatan_item) {
          summary[key].notes.push(`${it.qty}x: ${it.catatan_item}`);
          
          // Track spice levels
          ['Lemon & Herb', 'Mild', 'Hot', 'Extra Hot'].forEach(level => {
            if (it.catatan_item.includes(level)) {
              spiceCounts[level] = (spiceCounts[level] || 0) + it.qty;
            }
          });
        }
      });
    });

    return {
      items: Object.values(summary).sort((a, b) => b.totalQty - a.totalQty),
      spiceCounts,
      orderCount: filteredOrders.length
    };
  }, [filteredOrders]);

  const toggleCheck = (name) => {
    setCheckedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ChefHat className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Kitchen Prep View (Rekap Dapur)
            </h2>
          </div>
          <p className="text-xs text-stone-400">
            Kalkulasi bahan baku & porsi pesanan aktif (Lunas / Diproses) per jadwal pengiriman.
          </p>
        </div>

        {/* Date Selector & Print Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
            <Calendar className="w-4 h-4 text-amber-400" />
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none"
            >
              {availableDates.map(d => (
                <option key={d} value={d} className="bg-stone-900 text-white">
                  {formatDate(d)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar Dapur</span>
          </button>
        </div>
      </div>

      {/* Spice Breakdown Highlight */}
      {Object.keys(aggregatedData.spiceCounts).length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 border border-stone-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-stone-200">
              Breakdown Tingkat Pedas Peri-Peri:
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {Object.entries(aggregatedData.spiceCounts).map(([spice, count]) => (
              <span key={spice} className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs font-mono font-bold text-amber-400">
                {spice}: <strong className="text-white">{count} porsi</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Aggregated Items Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aggregatedData.items.length > 0 ? (
          aggregatedData.items.map(item => {
            const isDone = Boolean(checkedItems[item.nama]);

            return (
              <div
                key={item.nama}
                onClick={() => toggleCheck(item.nama)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40 opacity-70'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700 shadow-lg'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 border border-stone-700">
                      {item.kategori}
                    </span>
                    <button
                      type="button"
                      className="text-stone-400 hover:text-white"
                    >
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-500" />
                      )}
                    </button>
                  </div>

                  <h3 className={`font-bold text-base ${isDone ? 'line-through text-stone-400' : 'text-white'}`}>
                    {item.nama}
                  </h3>

                  {/* Notes / Variations */}
                  {item.notes.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-500">
                        Varian & Catatan Dapur:
                      </span>
                      <div className="space-y-0.5 max-h-24 overflow-y-auto pr-1">
                        {item.notes.map((n, idx) => (
                          <p key={idx} className="text-[11px] text-amber-300/80 italic font-mono">
                            • {n}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Big Quantity Indicator */}
                <div className="pt-4 border-t border-stone-800/80 flex items-baseline justify-between mt-3">
                  <span className="text-xs text-stone-400 font-medium">Total Siapkan:</span>
                  <div className="text-right">
                    <span className={`text-2xl font-black font-mono ${isDone ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.totalQty}
                    </span>
                    <span className="text-xs text-stone-400 ml-1">porsi/cup</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center bg-stone-900 rounded-3xl border border-stone-800 text-stone-400">
            <Utensils className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="font-bold text-stone-300">Belum ada pesanan aktif untuk tanggal ini</p>
            <p className="text-xs text-stone-500 mt-1">
              Pilih tanggal lain atau tunggu pesanan masuk diverifikasi Lunas.
            </p>
          </div>
        )}
      </div>

      {/* Summary Box */}
      <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs text-stone-400">
        <div>
          Jadwal Pengiriman: <strong className="text-amber-400">{formatDate(selectedDate)}</strong>
        </div>
        <div>
          Total Order Terjadwal: <strong className="text-white font-mono text-sm">{aggregatedData.orderCount} pesanan</strong>
        </div>
      </div>

    </div>
  );
}
