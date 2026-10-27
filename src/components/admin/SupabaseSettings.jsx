import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, Key, Globe, ShieldCheck, Terminal } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials, api } from '../../lib/supabase';

export default function SupabaseSettings({ onClose }) {
  const current = getSupabaseCredentials();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSave = () => {
    saveSupabaseCredentials(url, key);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload();
    }, 1000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Temporarily save to test
      saveSupabaseCredentials(url, key);
      const res = await api.testConnection();
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySqlPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Konfigurasi Database & Supabase PostgreSQL
          </h2>
        </div>
        <p className="text-xs text-stone-400">
          Aplikasi ini mendukung mode <strong>Supabase Live</strong> (Cloud atau Self-hosted di Proxmox) dan mode <strong>Demo Interaktif</strong> tanpa perlu setup awal.
        </p>
      </div>

      {/* Connection Status Card */}
      <div className={`p-5 rounded-3xl border ${
        current.isConfigured
          ? 'bg-emerald-950/20 border-emerald-500/40'
          : 'bg-amber-950/20 border-amber-500/40'
      } space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${current.isConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <h3 className="font-bold text-sm text-white">
              Status Database: {current.isConfigured ? 'Terhubung ke Supabase' : 'Mode Demo / Offline Local DB Aktif'}
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            current.isConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {current.isConfigured ? 'Live PostgreSQL' : 'Local Mock Data'}
          </span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          {current.isConfigured
            ? 'Aplikasi membaca dan menulis data transaksi, status dapur, dan CRM langsung ke database PostgreSQL Supabase Anda.'
            : 'Saat ini berjalan dengan penyimpanan lokal yang mensimulasikan seluruh alur pesanan, rekap dapur, cetak struk thermal, dan WhatsApp marketing secara penuh.'}
        </p>
      </div>

      {/* Supabase Credentials Form */}
      <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Kredensial API Supabase
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>Project URL Supabase</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co atau http://192.168.1.xxx:8000 (Proxmox Docker)"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Anon Public API Key</span>
            </label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
            testResult.success
              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-950/40 text-rose-300 border border-rose-500/40'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !url || !key}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-2 border border-stone-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Tersimpan! Memuat Ulang...</span>
              </>
            ) : (
              <span>Simpan Kredensial</span>
            )}
          </button>
        </div>
      </div>

      {/* SQL Migration Quick Reference */}
      <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          File Skema Database PostgreSQL
        </h3>
        <p className="text-xs text-stone-400">
          Skema database lengkap (tabel pelanggan, pesanan, detail_pesanan, pembayaran, view royalti CRM, trigger kalkulasi otomatis, dan storage bucket) tersedia di file:
        </p>

        <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-amber-400 flex items-center justify-between">
          <span>jalan-bhakti-3/supabase/schema.sql</span>
          <button
            onClick={handleCopySqlPath}
            className="text-stone-400 hover:text-white px-2 py-1 rounded bg-stone-800 flex items-center gap-1 text-[11px]"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Tersalin' : 'Salin Path'}</span>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Ingin mengembalikan data demo awal ke kondisi bersih?
          </span>
          <button
            onClick={() => api.resetMockData()}
            className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
          >
            Reset Data Demo Lokal
          </button>
        </div>
      </div>

    </div>
  );
}
