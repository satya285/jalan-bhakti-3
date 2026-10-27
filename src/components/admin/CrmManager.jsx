import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Crown, 
  AlertTriangle, 
  MessageCircle, 
  Search, 
  TrendingUp, 
  Calendar, 
  ExternalLink,
  Send,
  CheckCircle,
  Filter
} from 'lucide-react';
import { formatRupiah, formatDate, createAdminCrmWALink, cleanWhatsAppNumber } from '../../lib/utils';
import { LOYALTY_COLORS } from '../../lib/types';
import { api } from '../../lib/supabase';

const TEMPLATES = [
  {
    id: 'buka_kuota',
    title: '🔥 Buka Kuota Pre-Order (Senin Sore)',
    desc: 'Untuk blast ke pelanggan bahwa slot Selasa-Jumat sudah dibuka'
  },
  {
    id: 'vip_reward',
    title: '⭐ Bonus Spesial Pelanggan VIP',
    desc: 'Penawaran Free Extra Peri Sauce khusus pelanggan setia'
  },
  {
    id: 'win_back_churn',
    title: '⚠️ Win-Back Churn (>35 Hari)',
    desc: 'Sapaan hangat untuk pelanggan yang sudah lama tidak memesan'
  },
  {
    id: 'tanya_feedback',
    title: '💬 Tanya Review & Feedback',
    desc: 'Follow up rasa makanan & kepuasan pelayanan pengiriman'
  }
];

export default function CrmManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoyaltyFilter, setSelectedLoyaltyFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('buka_kuota');
  const [previewCustomer, setPreviewCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomersWithLoyalty();
      setCustomers(data);
      if (data.length > 0) setPreviewCustomer(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalOmset = customers.reduce((sum, c) => sum + Number(c.total_belanja || 0), 0);
  const vipCount = customers.filter(c => c.kategori_loyalti === 'VIP').length;
  const churnCount = customers.filter(c => c.kategori_loyalti === 'Churn').length;
  const regulerCount = customers.filter(c => c.kategori_loyalti === 'Reguler').length;

  const filteredCustomers = customers.filter(c => {
    const matchesFilter = selectedLoyaltyFilter === 'Semua' || c.kategori_loyalti === selectedLoyaltyFilter;
    const matchesSearch = 
      c.nama_pelanggan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.no_wa?.includes(searchQuery) ||
      c.alamat_default?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top CRM Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pelanggan</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {customers.length}
          </div>
          <p className="text-[11px] text-stone-500">
            Database CRM Aktif
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pelanggan VIP</span>
            <Crown className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
            {vipCount}
          </div>
          <p className="text-[11px] text-purple-300/80">
            &gt;= 5 Pesanan / Rp 500k+
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Alert Churn</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {churnCount}
          </div>
          <p className="text-[11px] text-rose-300/80">
            &gt; 35 hari belum order lagi
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Nilai Belanja</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {formatRupiah(totalOmset)}
          </div>
          <p className="text-[11px] text-emerald-300/80">
            Akumulasi pesanan terverifikasi
          </p>
        </div>

      </div>

      {/* WhatsApp Blast & Template Control Panel */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Modul Retensi WhatsApp Blast</span>
            </h3>
            <p className="text-xs text-stone-400">
              Pilih template pesan marketing untuk dikirimkan secara langsung ke WhatsApp pelanggan dengan 1 kali klik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              ⚡ Personalisasi Nama Otomatis
            </span>
          </div>
        </div>

        {/* Template Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map(t => {
            const isSelected = selectedTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                <div>
                  <h4 className={`font-bold text-xs ${isSelected ? 'text-amber-400' : 'text-stone-200'}`}>
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Template Aktif
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Directory Table with Loyalty Badges & WA Action */}
      <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-4">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['Semua', 'VIP', 'Reguler', 'Baru', 'Churn'].map(filter => {
              const isSelected = selectedLoyaltyFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedLoyaltyFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari pelanggan / no WA..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-800">
              <tr>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Kategori Loyalti</th>
                <th className="py-3 px-4">Total Order</th>
                <th className="py-3 px-4">Total Belanja</th>
                <th className="py-3 px-4">Pesanan Terakhir</th>
                <th className="py-3 px-4 text-right">Aksi WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 text-stone-300">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => {
                  const waLink = createAdminCrmWALink(customer, selectedTemplate);

                  return (
                    <tr 
                      key={customer.no_wa}
                      className="hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">
                          {customer.nama_pelanggan}
                        </div>
                        <div className="text-stone-400 font-mono text-[11px]">
                          {customer.no_wa}
                        </div>
                        {customer.alamat_default && (
                          <div className="text-[11px] text-stone-500 truncate max-w-xs">
                            {customer.alamat_default}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] border font-bold ${LOYALTY_COLORS[customer.kategori_loyalti] || 'bg-stone-800 text-stone-300'}`}>
                          {customer.kategori_loyalti}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-stone-200">
                        {customer.total_order} kali
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {formatRupiah(customer.total_belanja)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-stone-200">
                          {customer.terakhir_pesan ? formatDate(customer.terakhir_pesan) : '-'}
                        </div>
                        {customer.hari_sejak_pesanan_terakhir !== '-' && (
                          <div className={`text-[10px] font-medium ${
                            Number(customer.hari_sejak_pesanan_terakhir) > 35 ? 'text-rose-400 font-bold' : 'text-stone-400'
                          }`}>
                            {customer.hari_sejak_pesanan_terakhir} hari yang lalu
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim WA</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Tidak ada pelanggan yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
