import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Upload, 
  Clock, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  QrCode, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatRupiah, formatDate, shortUUID, createCustomerToAdminWALink } from '../lib/utils';
import { STORE_INFO } from '../lib/types';
import { api } from '../lib/supabase';

export default function OrderSuccessModal({
  order,
  onClose,
  onOpenTracking
}) {
  if (!order) return null;

  const [copiedNominal, setCopiedNominal] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState('');
  const [uploading, setUploading] = useState(false);
  const [buktiUrl, setBuktiUrl] = useState(order.pembayaran?.bukti_transfer_url || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Countdown timer for 2 hours
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 hours in seconds

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Countdown interval
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyNominal = () => {
    navigator.clipboard.writeText(String(order.grand_total));
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  const handleCopyRekening = (rekening) => {
    navigator.clipboard.writeText(rekening);
    setCopiedRekening(rekening);
    setTimeout(() => setCopiedRekening(''), 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Read local base64 for instant preview
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        setBuktiUrl(base64);
        // Upload via API
        await api.uploadBuktiTransfer(order.order_id, base64);
        setUploadSuccess(true);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah bukti transfer.');
    } finally {
      setUploading(false);
    }
  };

  const waConfirmLink = createCustomerToAdminWALink(order, STORE_INFO.whatsapp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl text-white overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Success Header */}
        <div className="p-6 bg-gradient-to-b from-amber-500/20 via-stone-900 to-stone-900 border-b border-stone-800 text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Pesanan Berhasil Dibuat
          </span>
          <h2 className="text-2xl font-black text-white">
            Instruksi Pembayaran Pre-Order
          </h2>
          <p className="text-xs text-stone-400">
            No. Pesanan: <strong className="font-mono text-stone-200">#{shortUUID(order.order_id)}</strong>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Tagihan Unik Highlight Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-950 to-stone-900 border-2 border-amber-500/40 text-center space-y-3 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Total Nominal Transfer (Wajib Pas)
            </span>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                {formatRupiah(order.grand_total)}
              </span>
            </div>

            <p className="text-xs text-amber-300/90 font-medium max-w-md mx-auto">
              Sudah termasuk <strong>Kode Unik: {order.kode_unik}</strong>. Tiga digit terakhir ini memastikan pembayaran Anda terverifikasi instan tanpa tertukar dengan pesanan lain.
            </p>

            <button
              onClick={handleCopyNominal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold border border-amber-500/40 transition-colors"
            >
              {copiedNominal ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Nominal Pas Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Nominal Pas ({order.grand_total})</span>
                </>
              )}
            </button>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-stone-800/60 border border-stone-700/80 text-xs">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-stone-300">Selesaikan transfer dalam:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {formatTimer(timeLeft)}
            </span>
          </div>

          {/* Rekening Tujuan Transfer */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Rekening Resmi Jalan Bhakti 3
            </h3>

            <div className="space-y-2">
              {STORE_INFO.bankAccounts.map((acc, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-200">{acc.logo}</span>
                    </div>
                    <p className="font-mono font-black text-sm text-amber-400 mt-0.5">
                      {acc.accountNumber}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      a/n {acc.accountName}
                    </p>
                  </div>

                  {!acc.bank.includes('QRIS') && (
                    <button
                      onClick={() => handleCopyRekening(acc.accountNumber)}
                      className="px-3 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedRekening === acc.accountNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upload Bukti Transfer */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-stone-950 border border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-amber-400" />
              Unggah Bukti Transfer (Opsional / Direkomendasikan)
            </h3>
            
            {buktiUrl ? (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-emerald-950/20 p-3 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-300">
                      Bukti transfer tersimpan & terlampir!
                    </p>
                    <p className="text-[11px] text-stone-400 truncate">
                      Admin akan segera memverifikasi pesanan Anda.
                    </p>
                  </div>
                  <img
                    src={buktiUrl}
                    alt="Bukti Transfer"
                    className="w-12 h-12 rounded-lg object-cover border border-stone-700"
                  />
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-amber-500 cursor-pointer transition-colors bg-stone-900/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-stone-400 mb-1" />
                <span className="text-xs font-bold text-stone-300">
                  {uploading ? 'Mengunggah...' : 'Klik untuk Pilih Foto Bukti Transfer'}
                </span>
                <span className="text-[10px] text-stone-500">
                  Format JPG, PNG, atau Screenshot M-Banking
                </span>
              </label>
            )}
          </div>

          {/* Ringkasan Pengiriman & Pengambilan */}
          <div className="text-xs text-stone-400 space-y-1.5 p-3 rounded-xl bg-stone-800/40 border border-stone-800">
            <div className="flex items-center gap-2 text-stone-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Jadwal Batch: <strong>{formatDate(order.jadwal_pengiriman)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <span>🚗 {order.ongkir === 0 ? 'Metode: Diambil Sendiri oleh Pembeli (Gojek / Grab / Lalamove)' : `Metode: Antar Kurir (${formatRupiah(order.ongkir)})`}</span>
            </div>
            <div className="flex items-start gap-2 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Alamat/Titik Antar: {order.alamat_pengiriman}</span>
            </div>
          </div>

          {/* Action WhatsApp Confirmation */}
          <div className="space-y-2 pt-2">
            <a
              href={waConfirmLink}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-center"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Konfirmasi Otomatis ke WhatsApp Admin</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTracking(order.order_id);
              }}
              className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Lacak Status Pesanan Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
