import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Package, Search, Star, ShoppingCart, Check, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '../WishlistContext';
import { useProducts } from '../ProductContext';
import { useCart } from '../CartContext';
import { toast } from 'sonner';

type Tab = 'wishlist' | 'tracking';

export default function MyZantro() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => searchParams.get('tab') === 'tracking' ? 'tracking' : 'wishlist');

  useEffect(() => {
    if (searchParams.get('tab') === 'tracking') setTab('tracking');
  }, [searchParams]);
  const { wishlist, toggle } = useWishlist();
  const { products } = useProducts();
  const { addToCart, cart } = useCart();

  // Order tracking state
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  const STATUS_INFO: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: 'Pending',   color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    confirmed: { label: 'Confirmed', color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
    shipped:   { label: 'Shipped',   color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    delivered: { label: 'Delivered', color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30' },
    cancelled: { label: 'Cancelled', color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' },
  };
  const statusInfo = order ? (STATUS_INFO[order.status] || STATUS_INFO['pending']) : null;
  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <>
      <Helmet>
        <title>My Zantro — Wishlist & Order Tracking</title>
        <meta name="robots" content="noindex" />
      </Helmet>
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">My Zantro</h1>
          <p className="text-sm text-gray-400 mt-1">Your wishlist & order tracking</p>
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
            onClick={() => setTab('tracking')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === 'tracking'
                ? 'bg-white dark:bg-neutral-800 text-orange-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Package size={16} />
            Track Order
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order #{order.id?.slice(-6).toUpperCase()}</p>
                    <p className={`text-2xl font-black mt-1 ${statusInfo.color}`}>{statusInfo.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
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

                  {/* Remark */}
                  {order.remark && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Message from Store</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{order.remark}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Items Ordered</p>
                    <div className="space-y-2">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-neutral-800 p-1 shrink-0" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400">x{item.quantity} · ৳{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-neutral-700 mt-3 pt-3 flex justify-between">
                      <span className="text-xs font-bold text-gray-400">Total</span>
                      <span className="text-sm font-black text-orange-500">৳{order.finalTotal?.toFixed(2)}</span>
                    </div>
                  </div>
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
