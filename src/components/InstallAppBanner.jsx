import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check, ArrowRight } from 'lucide-react';

export default function InstallAppBanner({ isOpenManual, onCloseManual }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (from home screen)
    const isInStandaloneMode = () => 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isInStandaloneMode()) {
      setIsStandalone(true);
      return;
    }

    // Detect user agent
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // Listen for Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if user previously dismissed today
    const wasDismissed = sessionStorage.getItem('BHAKTI3_INSTALL_DISMISSED');
    if (wasDismissed) {
      setDismissed(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync manual open
  useEffect(() => {
    if (isOpenManual) {
      setShowModal(true);
    }
  }, [isOpenManual]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('BHAKTI3_INSTALL_DISMISSED', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setDismissed(true);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (onCloseManual) onCloseManual();
  };

  // If already running standalone (launched from home screen icon), don't show prompt
  if (isStandalone) return null;

  return (
    <>
      {/* 1. Floating Banner on Mobile (if not dismissed) */}
      {!dismissed && !showModal && (
        <div className="no-print fixed top-18 sm:top-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-30 animate-fade-in pointer-events-auto">
          <div className="p-3.5 rounded-2xl bg-stone-900/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl text-white flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-white truncate">
                    Pasang Shortcut di HP
                  </h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 truncate">
                  Buka langsung di layar utama seperti aplikasi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs active:scale-95 transition-all shadow-md shadow-amber-500/20"
              >
                {deferredPrompt ? 'Pasang' : 'Cara Pasang'}
              </button>

              <button
                onClick={handleDismiss}
                className="w-7 h-7 rounded-lg text-stone-500 hover:text-white flex items-center justify-center hover:bg-stone-800"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Modal Panduan Tambah ke Layar Utama (Android & iOS) */}
      {showModal && (
        <div 
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-md bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl text-white overflow-hidden p-6 space-y-5 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Pintasan Layar Utama HP
                  </h3>
                  <p className="text-xs text-stone-400">
                    Akses cepat & tampilan pas layar penuh
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction for iOS iPhone */}
            {isIOS && (
              <div className="space-y-3.5 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>Panduan untuk Pengguna iPhone (Safari):</span>
                </span>

                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                      1
                    </div>
                    <p className="leading-relaxed">
                      Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> di bilah bawah browser Safari Anda.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                      2
                    </div>
                    <p className="leading-relaxed">
                      Gulir ke bawah dan pilih menu <strong>'Tambah ke Layar Utama' (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-stone-300" />.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                      3
                    </div>
                    <p className="leading-relaxed">
                      Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon Jalan Bhakti 3 akan langsung muncul di layar utama iPhone Anda seperti aplikasi native!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instruction for Android */}
            {(!isIOS || isAndroid) && (
              <div className="space-y-3.5 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>Panduan untuk Pengguna Android (Chrome):</span>
                </span>

                <div className="space-y-3 text-xs text-stone-300">
                  {deferredPrompt ? (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Pasang Sekarang ke Layar Utama</span>
                    </button>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          1
                        </div>
                        <p className="leading-relaxed">
                          Ketuk ikon <strong>menu titik tiga (⋮)</strong> di pojok kanan atas browser Chrome.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          2
                        </div>
                        <p className="leading-relaxed">
                          Pilih menu <strong>'Tambahkan ke Layar Utama' (Add to Home screen)</strong> atau <strong>'Pasang Aplikasi'</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          3
                        </div>
                        <p className="leading-relaxed">
                          Ketuk <strong>Pasang / Tambahkan</strong>. Selesai! Aplikasi dapat dibuka layar penuh tanpa bilah URL browser.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Value props */}
            <div className="space-y-2 pt-1 text-stone-400 text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Bebas bilah URL browser, tampilan 100% pas layar HP</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Tidak memerlukan Play Store / App Store (Langsung Aktif)</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Hemat memori HP dan selalu ter-update otomatis</span>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors"
            >
              Saya Mengerti, Tutup Panduan
            </button>

          </div>
        </div>
      )}
    </>
  );
}
