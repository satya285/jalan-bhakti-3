import React, { useState } from 'react';
import { 
  Package, 
  ChefHat, 
  Printer, 
  Users, 
  Database, 
  ArrowLeft, 
  Flame, 
  BellRing,
  Sparkles
} from 'lucide-react';
import OrdersManager from './OrdersManager';
import KitchenPrepView from './KitchenPrepView';
import ThermalLabelPrint from './ThermalLabelPrint';
import CrmManager from './CrmManager';
import SupabaseSettings from './SupabaseSettings';

export default function AdminDashboard({
  orders,
  onUpdateStatus,
  onExitAdmin,
  isLiveSupabase
}) {
  const [activeTab, setActiveTab] = useState('pesanan');
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState(null);

  const pendingVerificationCount = orders.filter(o => o.status_pesanan === 'Menunggu Pembayaran').length;
  const readyToShipCount = orders.filter(o => o.status_pesanan === 'Siap Kirim').length;

  const handlePrintSpecificOrder = (order) => {
    setSelectedOrderToPrint(order);
    setActiveTab('logistik');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Admin Top Navigation Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onExitAdmin}
            className="w-10 h-10 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            title="Kembali ke Tampilan Pelanggan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white">
                Dashboard Operasional Dapur & CRM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950">
                Staff Admin
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Jalan Bhakti 3 • Ciganjur, Jagakarsa
            </p>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="flex items-center gap-3 text-xs">
          {pendingVerificationCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold animate-pulse">
              <BellRing className="w-3.5 h-3.5" />
              <span>{pendingVerificationCount} Menunggu Verifikasi</span>
            </div>
          )}

          {readyToShipCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
              <span>{readyToShipCount} Siap Kirim</span>
            </div>
          )}
        </div>

      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        
        <button
          onClick={() => {
            setSelectedOrderToPrint(null);
            setActiveTab('pesanan');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'pesanan'
              ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-102'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Manajemen Pesanan</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'pesanan' ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-stone-300'
          }`}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dapur')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'dapur'
              ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-102'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Kitchen Prep View (Rekap Dapur)</span>
        </button>

        <button
          onClick={() => setActiveTab('logistik')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'logistik'
              ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-102'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Logistik & Struk Thermal (QR Maps)</span>
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'crm'
              ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-102'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>CRM & Retensi WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-102'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Konfigurasi Supabase</span>
        </button>

      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'pesanan' && (
          <OrdersManager
            orders={orders}
            onUpdateStatus={onUpdateStatus}
            onPrintThermal={handlePrintSpecificOrder}
          />
        )}

        {activeTab === 'dapur' && (
          <KitchenPrepView
            orders={orders}
          />
        )}

        {activeTab === 'logistik' && (
          <ThermalLabelPrint
            orders={orders}
            selectedOrder={selectedOrderToPrint}
            onBack={() => {
              setSelectedOrderToPrint(null);
              setActiveTab('pesanan');
            }}
          />
        )}

        {activeTab === 'crm' && (
          <CrmManager />
        )}

        {activeTab === 'settings' && (
          <SupabaseSettings
            onClose={() => setActiveTab('pesanan')}
          />
        )}
      </div>

    </div>
  );
}
