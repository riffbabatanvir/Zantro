import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, CheckCircle, XCircle, Clock, Truck, MapPin, Phone, Mail, User } from 'lucide-react';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

const STATUS_INFO: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending:   { label: 'Pending',   color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30',  icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30',     icon: CheckCircle },
  shipped:   { label: 'Shipped',   color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30',   icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30',       icon: XCircle },
};

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track/${orderId.trim()}`);
      if (res.ok) {
        setOrder(await res.json());
      } else {
        setError('Order not found. Please check your Order ID and try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = order ? (STATUS_INFO[order.status] || STATUS_INFO['pending']) : null;
  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 px-4 py-12 md:py-20">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-orange-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Track Your Order</h1>
          <p className="text-sm text-gray-400">Enter your Order ID to check the status</p>
        </motion.div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
            placeholder="Enter your Order ID..."
            className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-orange-500 transition-colors font-mono"
          />
          <button type="submit" disabled={loading}
            className="bg-orange-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            <Search size={16} /> {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 text-center mb-6">
            {error}
          </motion.div>
        )}

        {order && statusInfo && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Status Card */}
            <div className={`p-6 rounded-2xl border ${statusInfo.bg} border-transparent`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusInfo.bg}`}>
                  <statusInfo.icon size={24} className={statusInfo.color} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order #{order.id?.slice(-8)}</p>
                  <p className={`text-2xl font-black ${statusInfo.color}`}>{statusInfo.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar — only for non-cancelled */}
            {order.status !== 'cancelled' && (
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-6">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-4 h-1 bg-gray-200 dark:bg-neutral-700 -z-0" />
                  <div
                    className="absolute left-0 top-4 h-1 bg-orange-500 transition-all duration-700 -z-0"
                    style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                  />
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const info = STATUS_INFO[step];
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${done ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-400'}`}>
                          {done ? <CheckCircle size={14} /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${done ? 'text-orange-500' : 'text-gray-400'}`}>{info.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customer & Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-5 space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Info</h3>
                {order.customerInfo?.fullName && <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><User size={14} className="shrink-0 mt-0.5 text-gray-400" />{order.customerInfo.fullName}</div>}
                {order.customerInfo?.phone && <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Phone size={14} className="shrink-0 mt-0.5 text-gray-400" />{order.customerInfo.phone}</div>}
                {order.customerInfo?.email && <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Mail size={14} className="shrink-0 mt-0.5 text-gray-400" />{order.customerInfo.email}</div>}
                {order.customerInfo?.address && <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><MapPin size={14} className="shrink-0 mt-0.5 text-gray-400" />{order.customerInfo.address}</div>}
              </div>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-5 space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Summary</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">x{item.quantity} · ৳{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 flex justify-between">
                  <span className="text-xs font-bold text-gray-400">Total</span>
                  <span className="text-sm font-black text-orange-500">৳{order.finalTotal?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
