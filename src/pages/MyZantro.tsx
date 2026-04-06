import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Package, Search, Star, ShoppingCart, Check, Trash2, History, Phone, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, XCircle, MapPin, User, Mail, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '../WishlistContext';
import { useProducts } from '../ProductContext';
import { useCart } from '../CartContext';
import { toast } from 'sonner';

type Tab = 'wishlist' | 'tracking' | 'history';

export default function MyZantro() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab');
    if (t === 'tracking') return 'tracking';
    if (t === 'history') return 'history';
    return 'wishlist';
  });

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'tracking') setTab('tracking');
    else if (t === 'history') setTab('history');
  }, [searchParams]);
  const { wishlist, toggle } = useWishlist();
  const { products } = useProducts();
  const { addToCart, cart } = useCart();

  // Order tracking state
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Order history state
  const [historyPhone, setHistoryPhone] = useState('');
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleHistorySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyPhone.trim()) return;
    setHistoryLoading(true); setHistoryError(''); setHistoryOrders([]);
    try {
      const res = await fetch(`/api/orders/by-phone/${encodeURIComponent(historyPhone.trim())}`);
      if (res.ok) setHistoryOrders(await res.json());
      else setHistoryError('No orders found for this phone number. Please double-check the number you used at checkout.');
    } catch { setHistoryError('Something went wrong. Please try again.'); }
    finally { setHistoryLoading(false); }
  };

  const STATUS_STEPS_H = ['pending', 'confirmed', 'shipped', 'delivered'];
  const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending:   { label: 'Pending',   color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30',   icon: CheckCircle },
    shipped:   { label: 'Shipped',   color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30',     icon: XCircle },
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await fetch(`/api/orders/track/${orderId.trim()}`);
      if (res.ok) setOrder(await res.json());
      else setError('Order not found. Please check your Order ID and try again.');
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
  const STATUS_INFO: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending:   { label: 'Pending',   color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30',   icon: CheckCircle },
    shipped:   { label: 'Shipped',   color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30',     icon: XCircle },
  };
  const statusInfo = order ? (STATUS_INFO[order.status] || STATUS_INFO['pending']) : null;
  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <>
      <Helmet>
        <title>My Zantro — Wishlist, Orders & Tracking</title>
        <meta name="robots" content="noindex" />
      </Helmet>
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">My Zantro</h1>
          <p className="text-sm text-gray-400 mt-1">Your wishlist, orders & tracking</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-neutral-900 p-1 rounded-2xl">
          <button
            onClick={() => setTab('wishlist')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === 'wishlist'
                ? 'bg-white dark:bg-neutral-800 text-orange-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Heart size={16} className={tab === 'wishlist' ? 'fill-orange-500' : ''} />
            Wishlist {wishlist.length > 0 && <span className="bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === 'history'
                ? 'bg-white dark:bg-neutral-800 text-orange-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <History size={16} />
            Orders
          </button>
          <button
            onClick={() => setTab('tracking')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === 'tracking'
                ? 'bg-white dark:bg-neutral-800 text-orange-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Package size={16} />
            Track
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Wishlist Tab ── */}
          {tab === 'wishlist' && (
            <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {wishlistProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <Heart size={48} className="text-gray-200 dark:text-neutral-700" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your wishlist is empty</p>
                  <Link to="/shop" className="text-xs font-bold text-orange-500 hover:underline">Browse Products</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlistProducts.map(product => {
                    const inCart = cart.some(i => i.id === product.id);
                    const isOutOfStock = (product as any).stock === 0;
                    return (
                      <motion.div key={product.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-3 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800">
                        <Link to={`/product/${product.id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${product.id}`}>
                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight hover:text-orange-500 transition-colors">{product.name}</p>
                          </Link>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={9} className="text-orange-400" fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                          <p className="text-base font-black text-orange-500 mt-1">৳{product.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => { if (!isOutOfStock) { addToCart(product as any); toast.success('Added to cart!'); } }}
                              disabled={isOutOfStock}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                isOutOfStock ? 'bg-gray-100 dark:bg-neutral-800 text-gray-300 cursor-not-allowed'
                                : inCart ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200'
                              }`}
                            >
                              {inCart ? <><Check size={11} /> In Cart</> : <><ShoppingCart size={11} /> Add to Cart</>}
                            </button>
                            <button
                              onClick={() => toggle(product.id)}
                              className="p-1.5 rounded-xl text-gray-300 hover:text-red-500 transition-colors"
                              title="Remove from wishlist"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Order History Tab ── */}
          {tab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter the phone number you used when placing your order.</p>
                <form onSubmit={handleHistorySearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={historyPhone}
                      onChange={e => setHistoryPhone(e.target.value)}
                      placeholder="e.g. 01XXXXXXXXX"
                      className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <button type="submit" disabled={historyLoading}
                    className="bg-orange-600 text-white px-5 py-3 rounded-2xl text-sm font-black hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                    <Search size={15} /> {historyLoading ? '...' : 'Find'}
                  </button>
                </form>
              </div>

              {historyError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 text-center mb-4">
                  {historyError}
                </div>
              )}

              {historyOrders.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{historyOrders.length} order{historyOrders.length !== 1 ? 's' : ''} found</p>
                  {historyOrders.map((order: any) => {
                    const meta = STATUS_META[order.status] || STATUS_META['pending'];
                    const StatusIcon = meta.icon;
                    const isExpanded = expandedOrderId === order.id;
                    const currentStep = STATUS_STEPS_H.indexOf(order.status);
                    return (
                      <motion.div key={order.id} layout className="bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
                        {/* Order summary row — always visible */}
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="w-full flex items-center gap-3 p-4 text-left"
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                            <StatusIcon size={16} className={meta.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-gray-800 dark:text-gray-200 font-mono">#{order.id?.slice(-6).toUpperCase()}</span>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              {' · '}
                              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-orange-500">৳{order.finalTotal?.toFixed(0)}</p>
                            {isExpanded ? <ChevronUp size={14} className="text-gray-400 ml-auto mt-1" /> : <ChevronDown size={14} className="text-gray-400 ml-auto mt-1" />}
                          </div>
                        </button>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-neutral-700 pt-4">

                                {/* Progress bar */}
                                {order.status !== 'cancelled' && (
                                  <div className="flex items-center justify-between relative">
                                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 dark:bg-neutral-700" />
                                    <div
                                      className="absolute left-0 top-4 h-0.5 bg-orange-500 transition-all duration-500"
                                      style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS_H.length - 1)) * 100}%` : '0%' }}
                                    />
                                    {STATUS_STEPS_H.map((step, i) => {
                                      const done = i <= currentStep;
                                      return (
                                        <div key={step} className="flex flex-col items-center gap-1 z-10">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${done ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-400'}`}>
                                            {done ? <Check size={11} /> : i + 1}
                                          </div>
                                          <span className={`text-[9px] font-bold uppercase tracking-wide ${done ? 'text-orange-500' : 'text-gray-400'}`}>
                                            {STATUS_META[step].label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Items */}
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Items</p>
                                  <div className="space-y-2">
                                    {order.items?.map((item: any, i: number) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <img src={item.image} alt={item.name} className="w-9 h-9 rounded-xl object-contain bg-white dark:bg-neutral-800 p-1 shrink-0" referrerPolicy="no-referrer" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                                          <p className="text-[10px] text-gray-400">x{item.quantity} · ৳{item.price}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Payment info */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-neutral-700">
                                  <span className="text-xs font-bold text-gray-400">Total Paid</span>
                                  <span className="text-sm font-black text-orange-500">৳{order.finalTotal?.toFixed(0)}</span>
                                </div>

                                {/* Remark */}
                                {order.remark && (
                                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Message from Store</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">{order.remark}</p>
                                  </div>
                                )}

                                {/* Track link */}
                                <Link
                                  to={`/order-tracking?id=${order.id}`}
                                  className="block text-center text-xs font-black uppercase tracking-widest text-orange-500 hover:underline"
                                >
                                  Full Tracking Details →
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {!historyLoading && historyOrders.length === 0 && !historyError && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <History size={44} className="text-gray-200 dark:text-neutral-700" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Enter your phone number above</p>
                  <p className="text-xs text-gray-400">We'll pull up all orders linked to that number</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Track Order Tab ── */}
          {tab === 'tracking' && (
            <motion.div key="tracking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <form onSubmit={handleTrack} className="flex gap-2 mb-6">
                <input
                  type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
                  placeholder="Enter your 6-digit Order ID..."
                  className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors font-mono"
                />
                <button type="submit" disabled={loading}
                  className="bg-orange-600 text-white px-5 py-3 rounded-2xl text-sm font-black hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  <Search size={15} /> {loading ? '...' : 'Track'}
                </button>
              </form>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 text-center mb-4">
                  {error}
                </div>
              )}

              {order && statusInfo && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Status */}
                  <div className={`p-5 rounded-2xl ${statusInfo.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.bg}`}>
                        <statusInfo.icon size={20} className={statusInfo.color} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order #{order.id?.slice(-6).toUpperCase()}</p>
                        <p className={`text-2xl font-black mt-0.5 ${statusInfo.color}`}>{statusInfo.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  {order.status !== 'cancelled' && (
                    <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-5">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-4 h-1 bg-gray-200 dark:bg-neutral-700" />
                        <div className="absolute left-0 top-4 h-1 bg-orange-500 transition-all duration-700"
                          style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }} />
                        {STATUS_STEPS.map((step, i) => {
                          const done = i <= currentStep;
                          return (
                            <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${done ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-400'}`}>
                                {done ? <Check size={13} /> : i + 1}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${done ? 'text-orange-500' : 'text-gray-400'}`}>
                                {STATUS_INFO[step].label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Customer Info + Order Summary side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4 space-y-2">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Info</h3>
                      {order.customerInfo?.fullName && <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><User size={13} className="shrink-0 mt-0.5 text-gray-400" />{order.customerInfo.fullName}</div>}
                      {order.customerInfo?.phone && <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Phone size={13} className="shrink-0 mt-0.5 text-gray-400" />{order.customerInfo.phone}</div>}
                      {order.customerInfo?.email && <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Mail size={13} className="shrink-0 mt-0.5 text-gray-400" />{order.customerInfo.email}</div>}
                      {order.customerInfo?.address && <div className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><MapPin size={13} className="shrink-0 mt-0.5 text-gray-400" />{order.customerInfo.address}</div>}
                    </div>

                    <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4 space-y-2">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Summary</h3>
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <img src={item.image} alt={item.name} className="w-9 h-9 rounded-xl object-contain bg-white dark:bg-neutral-800 p-1 shrink-0" referrerPolicy="no-referrer" />
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

                  {/* Remark */}
                  {order.remark && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Message from Store</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{order.remark}</p>
                    </div>
                  )}

                  {/* Cancellation Section */}
                  {order.status === 'cancelled' ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Order Cancelled</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This order has been cancelled.</p>
                    </div>
                  ) : order.status === 'delivered' ? null : order.cancelRequest ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={15} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400">Cancellation Requested</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your cancellation request has been received. Our team will review it shortly.</p>
                      {order.cancelRequest.reason && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">Reason: "{order.cancelRequest.reason}"</p>}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                      {!showCancelForm ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Need to cancel?</p>
                            <p className="text-xs text-gray-400 mt-0.5">Submit a request and we'll get back to you.</p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}
