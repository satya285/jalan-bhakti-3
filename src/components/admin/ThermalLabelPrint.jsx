import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Calendar, MapPin, Phone, User, CheckCircle2, ArrowLeft, ExternalLink, QrCode } from 'lucide-react';
import { formatRupiah, formatDate, formatDateTime, shortUUID } from '../../lib/utils';
import { STORE_INFO } from '../../lib/types';

export default function ThermalLabelPrint({
  orders,
  selectedOrder,
  onBack
}) {
  const [paperWidth, setPaperWidth] = useState('80mm'); // '58mm' or '80mm'
  const [filterMode, setFilterMode] = useState(selectedOrder ? 'single' : 'siap_kirim');

  // Filter orders to print
  const ordersToPrint = selectedOrder && filterMode === 'single'
    ? [selectedOrder]
    : orders.filter(o => o.status_pesanan === 'Siap Kirim' || o.status_pesanan === 'Diproses');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Toolbar (Hidden on print) */}
      <div className="no-print p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" />
              <span>Modul Cetak Label Thermal Kurir</span>
            </h2>
            <p className="text-xs text-stone-400">
              Format thermal receipt 58mm / 80mm dengan QR Code navigasi Google Maps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Format Width Selector */}
          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl border border-stone-700 text-xs">
            <button
              onClick={() => setPaperWidth('58mm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                paperWidth === '58mm'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              58mm POS
            </button>
            <button
              onClick={() => setPaperWidth('80mm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                paperWidth === '80mm'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              80mm Standard
            </button>
          </div>

          {/* Filter Mode Selector */}
          {selectedOrder && (
            <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl border border-stone-700 text-xs">
              <button
                onClick={() => setFilterMode('single')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterMode === 'single'
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Pesanan Ini Saja
              </button>
              <button
                onClick={() => setFilterMode('siap_kirim')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterMode === 'siap_kirim'
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Semua Siap Kirim
              </button>
            </div>
          )}

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print PDF ({ordersToPrint.length})</span>
          </button>
        </div>
      </div>

      {/* Receipts Preview Area */}
      <div className="flex flex-col items-center gap-8 py-4">
        {ordersToPrint.length > 0 ? (
          ordersToPrint.map(order => {
            const mapsUrl = order.link_gmaps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.alamat_pengiriman)}`;

            return (
              <div
                key={order.order_id}
                style={{ width: paperWidth === '58mm' ? '300px' : '380px' }}
                className="bg-white text-black p-5 sm:p-6 rounded-2xl shadow-2xl border border-stone-300 font-mono text-xs leading-relaxed space-y-4 print:shadow-none print:border-none print:rounded-none print:p-2 print:m-0 print:w-full print:break-after-page"
              >
                {/* Header Struk */}
                <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-black">
                  <h3 className="font-black text-base uppercase tracking-wider">
                    {STORE_INFO.name}
                  </h3>
                  <p className="text-[10px] font-bold">
                    PERI-PERI FLAME-GRILLED PRE-ORDER
                  </p>
                  <p className="text-[10px]">
                    Jl. Bhakti 3, Ciganjur, Jakarta Selatan
                  </p>
                  <p className="text-[10px]">
                    WA: {STORE_INFO.whatsapp}
                  </p>
                </div>

                {/* Metadata Pesanan */}
                <div className="space-y-1 pb-3 border-b border-dashed border-black text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>NO. PESANAN:</span>
                    <span>#{shortUUID(order.order_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WAKTU ORDER:</span>
                    <span>{formatDateTime(order.waktu_pesan)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>JADWAL BATCH:</span>
                    <span>{formatDate(order.jadwal_pengiriman)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[10px]">
                    <span>METODE:</span>
                    <span>{order.ongkir === 0 ? 'DIAMBIL PEMBELI (GOJEK/GRAB)' : 'ANTAR KURIR RESTO'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span>{order.status_pesanan.toUpperCase()}</span>
                  </div>
                </div>

                {/* Data Penerima & Alamat */}
                <div className="space-y-1 pb-3 border-b border-dashed border-black">
                  <span className="font-bold block text-[10px] uppercase">
                    TUJUAN PENGIRIMAN:
                  </span>
                  <p className="font-bold text-sm">
                    {order.nama_pelanggan}
                  </p>
                  <p className="font-bold text-xs">
                    TELP / WA: {order.no_wa}
                  </p>
                  <p className="text-[11px] leading-snug pt-1">
                    {order.alamat_pengiriman}
                  </p>
                  {order.catatan && (
                    <p className="text-[10px] italic pt-1 font-bold">
                      *Catatan: {order.catatan}
                    </p>
                  )}
                </div>

                {/* Rincian Menu Dipesan */}
                <div className="space-y-1.5 pb-3 border-b-2 border-dashed border-black">
                  <span className="font-bold block text-[10px] uppercase">
                    RINCIAN MENU:
                  </span>
                  {(order.items || []).map((it, idx) => (
                    <div key={idx} className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between font-bold">
                        <span>{it.qty}x {it.nama_item}</span>
                        <span>{formatRupiah(it.harga_satuan * it.qty)}</span>
                      </div>
                      {it.catatan_item && (
                        <div className="text-[10px] italic pl-3">
                          &gt; {it.catatan_item}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 space-y-0.5 text-[11px] border-t border-dotted border-black">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatRupiah(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkir:</span>
                      <span>{formatRupiah(order.ongkir)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kode Unik:</span>
                      <span>+{order.kode_unik}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                      <span>TOTAL BAYAR:</span>
                      <span>{formatRupiah(order.grand_total)}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Navigasi Google Maps untuk Driver / Kurir */}
                <div className="pt-2 text-center space-y-2 flex flex-col items-center">
                  <span className="font-bold text-[10px] uppercase tracking-wider">
                    SCAN PIN LOKASI GOOGLE MAPS
                  </span>
                  
                  <div className="p-2 bg-white border-2 border-black rounded-lg inline-block">
                    <QRCodeSVG
                      value={mapsUrl}
                      size={paperWidth === '58mm' ? 120 : 150}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <p className="text-[9px] text-stone-700 max-w-xs leading-tight">
                    Arahkan kamera HP / Scanner Kurir pada QR Code ini untuk membuka rute navigasi Google Maps langsung ke lokasi pelanggan.
                  </p>
                </div>

                {/* Footer Struk */}
                <div className="text-center pt-3 border-t border-dashed border-black text-[9px] space-y-0.5">
                  <p className="font-bold">TERIMA KASIH TELAH MEMESAN</p>
                  <p>order.heragandhi.web.id</p>
                  <p>#FreshGrilledPreOrder</p>
                </div>

              </div>
            );
          })
        ) : (
          <div className="no-print p-12 text-center bg-stone-900 rounded-3xl border border-stone-800 text-stone-400">
            <p className="font-bold text-stone-300">Tidak ada pesanan "Siap Kirim"</p>
            <p className="text-xs text-stone-500 mt-1">
              Ubah status pesanan menjadi "Siap Kirim" pada tab Pesanan untuk mencetak struk thermal.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
