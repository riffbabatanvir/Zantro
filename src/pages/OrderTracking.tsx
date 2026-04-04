import { useState } from 'react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Search, Package, CheckCircle, XCircle, Clock, Truck, MapPin, Phone, Mail, User, AlertTriangle } from 'lucide-react';

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

  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      if (res.ok) {
        setCancelSuccess(true);
        setShowCancelForm(false);
        setCancelReason('');
        setOrder((prev: any) => ({ ...prev, cancelRequest: { reason: cancelReason.trim(), requestedAt: new Date().toISOString() } }));
      }
    } catch {}
    finally { setCancelLoading(false); }
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
            placeholder="Enter your 6-digit Order ID (e.g. A2F3BC)..."
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
                <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 space-y-1.5">
                  {order.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-400">Payment</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {order.paymentMethod === 'bank'
                          ? `Bank — ${order.selectedBank === 'pubali' ? 'Pubali Bank' : order.selectedBank === 'mtb' ? 'Mutual Trust Bank' : order.selectedBank === 'npsb' ? 'NPSB (Any Bank)' : order.selectedBank || ''}`
                          : order.paymentMethod === 'cod' ? 'Cash on Delivery'
                          : order.paymentMethod === 'bkash' ? 'bKash'
                          : order.paymentMethod === 'nagad' ? 'Nagad'
                          : order.paymentMethod === 'crypto' ? 'Crypto'
                          : order.paymentMethod === 'card' ? 'Card'
                          : order.paymentMethod}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-400">{order.preorderPayOption === '50' ? 'Paid Now (50%)' : 'Total'}</span>
                    <span className="text-sm font-black text-orange-500">৳{order.finalTotal?.toFixed(2)}</span>
                  </div>
                  {order.preorderPayOption === '50' && (
                    order.fullPaid ? (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">Payment Status</span>
                        <span className="text-xs font-black text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">✓ Fully Paid</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-3 py-2 mt-1">
                        <div>
                          <p className="text-xs font-bold text-red-600 dark:text-red-400">Due Amount</p>
                          <p className="text-[10px] text-red-500/70 dark:text-red-400/70">Payable before shipment</p>
                        </div>
                        <span className="text-sm font-black text-red-600 dark:text-red-400">৳{order.preorderRemainingAmount?.toFixed(2)}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Remark from store */}
            {order.remark && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">Message from Store</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{order.remark}</p>
              </div>
            )}

            {/* Cancellation Section */}
            {order.status === 'cancelled' ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Order Cancelled</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This order has been cancelled.</p>
              </div>
            ) : order.status === 'delivered' ? null : order.cancelRequest ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400">Cancellation Requested</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your cancellation request has been received. Our team will review it shortly.</p>
                {order.cancelRequest.reason && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">Reason: "{order.cancelRequest.reason}"</p>}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/5">
                {!showCancelForm ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Need to cancel?</p>
                      <p className="text-xs text-gray-400 mt-0.5">Submit a cancellation request and we'll get back to you.</p>
                    </div>
                    <button onClick={() => setShowCancelForm(true)}
                      className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0">
                      Request Cancellation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Reason for cancellation</p>
                    <textarea
                      rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                      placeholder="Please describe why you'd like to cancel this order..."
                      className="w-full bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-red-400 transition-colors resize-none placeholder:text-gray-400"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleCancelRequest} disabled={cancelLoading || !cancelReason.trim()}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
                        {cancelLoading ? 'Submitting...' : 'Submit Request'}
                      </button>
                      <button onClick={() => { setShowCancelForm(false); setCancelReason(''); }}
                        className="px-5 py-2.5 border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-black/30 dark:hover:border-white/30 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
