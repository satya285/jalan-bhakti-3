import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MenuCatalog from './components/MenuCatalog';
import MenuItemModal from './components/MenuItemModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import AdminDashboard from './components/admin/AdminDashboard';
import SupabaseSettings from './components/admin/SupabaseSettings';
import MobileBottomNav from './components/MobileBottomNav';
import MobileCartBar from './components/MobileCartBar';
import InstallAppBanner from './components/InstallAppBanner';
import { api } from './lib/supabase';
import { STORE_INFO } from './lib/types';
import { Flame, Heart, MapPin, MessageCircle, Phone, Smartphone } from 'lucide-react';

export default function App() {
  // Application Data States
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);

  // View States
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals States
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [supabaseSettingsOpen, setSupabaseSettingsOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Load initial menu & orders
  useEffect(() => {
    try {
      // Clear legacy localStorage cache that might hold old menu items or old orders
      const savedMenu = localStorage.getItem('BHAKTI3_MENU');
      if (savedMenu && (savedMenu.includes('1/2 Ayam') || savedMenu.includes('115000'))) {
        localStorage.removeItem('BHAKTI3_MENU');
      }
      const savedOrders = localStorage.getItem('BHAKTI3_ORDERS');
      if (savedOrders && (savedOrders.includes('1/2 Ayam') || savedOrders.includes('115000'))) {
        localStorage.removeItem('BHAKTI3_ORDERS');
      }
    } catch (e) {}

    loadData();
    setIsLiveSupabase(api.isLiveSupabase());
  }, []);

  const loadData = async () => {
    try {
      const [menuData, ordersData] = await Promise.all([
        api.getMenu(),
        api.getOrders()
      ]);
      setMenu(menuData);
      setOrders(ordersData);
    } catch (e) {
      console.error('Error loading app data:', e);
    }
  };

  // Cart Management
  const handleAddToCart = (item) => {
    setCart(prev => {
      // Check if same item with same spice level & notes exists
      const existingIdx = prev.findIndex(
        i => i.id === item.id && i.spiceLevel === item.spiceLevel && i.catatan === item.catatan
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].qty += item.qty;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleQuickAdd = (item) => {
    handleAddToCart({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga,
      foto_url: item.foto_url,
      qty: 1,
      spiceLevel: null,
      catatan: null
    });
  };

  const handleUpdateCartQty = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCart(prev => {
      const updated = [...prev];
      updated[index].qty = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  // Order Handlers
  const handleOrderSuccess = (newOrder) => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setSuccessOrder(newOrder);
    loadData();
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await api.updateOrderStatus(orderId, newStatus);
    loadData();
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950 antialiased overflow-x-hidden">
      
      {/* Navigation Header */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => {
          setTrackingOrderId(null);
          setTrackingModalOpen(true);
        }}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        isLiveSupabase={isLiveSupabase}
        onOpenSupabaseSettings={() => setSupabaseSettingsOpen(true)}
        onOpenInstall={() => setShowInstallModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-28 md:pb-8">
        {isAdmin ? (
          <AdminDashboard
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onExitAdmin={() => setIsAdmin(false)}
            isLiveSupabase={isLiveSupabase}
          />
        ) : (
          <MenuCatalog
            menu={menu}
            onSelectItem={item => setSelectedItemForModal(item)}
            onQuickAdd={handleQuickAdd}
          />
        )}
      </main>

      {/* Mobile Floating Cart Summary Pill (Food App standard on iOS/Android) */}
      {!isAdmin && (
        <MobileCartBar
          cartCount={cartCount}
          cartTotal={cartTotal}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Native Mobile Bottom Navigation Bar (iOS & Android) */}
      <MobileBottomNav
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenMenu={() => {
          setIsAdmin(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => {
          setTrackingOrderId(null);
          setTrackingModalOpen(true);
        }}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
      />

      {/* Footer (Customer View only, hidden on print) */}
      {!isAdmin && (
        <footer className="no-print mt-12 bg-stone-900 border-t border-stone-800 text-stone-400 py-8 mb-16 md:mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="font-black text-lg text-white">
                    {STORE_INFO.name}
                  </span>
                </div>
                <p className="text-xs text-stone-400 max-w-md">
                  {STORE_INFO.tagline} • Pengiriman Pre-Order Selasa s/d Jumat. Makanan diambil sendiri via Gojek / Grab / Lalamove.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <button
                  onClick={() => setShowInstallModal(true)}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pasang di Layar Utama HP</span>
                </button>

                <a
                  href={`https://wa.me/62${STORE_INFO.whatsapp.slice(1)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-stone-300 hover:text-amber-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Resto</span>
                </a>

                <a
                  href={STORE_INFO.googleMapsPin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-stone-300 hover:text-amber-400 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Ciganjur, Jakarta Selatan</span>
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
              <p>© {new Date().getFullYear()} Jalan Bhakti 3 Ordering System • Domain: order.heragandhi.web.id</p>
              <p className="flex items-center gap-1">
                <span>Progressive Web App (PWA) Standalone Siap Layar Penuh</span>
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Modals Suite */}
      <MenuItemModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onOpenTracking={(orderId) => {
          setTrackingOrderId(orderId);
          setTrackingModalOpen(true);
        }}
      />

      <OrderTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        initialOrderId={trackingOrderId}
      />

      {supabaseSettingsOpen && (
        <div 
          onClick={() => setSupabaseSettingsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <SupabaseSettings onClose={() => setSupabaseSettingsOpen(false)} />
          </div>
        </div>
      )}

      {/* PWA Shortcut Install Banner for Android & iOS */}
      <InstallAppBanner 
        isOpenManual={showInstallModal} 
        onCloseManual={() => setShowInstallModal(false)} 
      />

    </div>
  );
}
