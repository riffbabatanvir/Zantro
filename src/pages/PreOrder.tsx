import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../ProductContext';
import { useCart } from '../CartContext';
import { Clock, Package, AlertTriangle, ShoppingCart, Check, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface PreorderPriceTier {
  minQty: number;
  maxQty?: number;
  label: string;
  price: number;
}

function PreorderProductCard({ product }: { product: any }) {
  const { addToCart, cart } = useCart();
  const tiers: PreorderPriceTier[] = product.preorderPriceTiers || [];
  const hasTiers = tiers.length > 0;

  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const selectedTier = hasTiers ? tiers[selectedTierIdx] : null;
  const displayPrice = selectedTier ? selectedTier.price : product.price;

  const isInCart = cart.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    if (isInCart) return;
    addToCart({
      ...product,
      price: displayPrice,
      isPreorder: true,
      selectedTierLabel: selectedTier?.label,
      preorderMinQty: selectedTier ? selectedTier.minQty : 1,
    } as any, selectedTier ? selectedTier.minQty : 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="relative block aspect-square bg-gray-50 dark:bg-neutral-800 overflow-hidden group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
          Pre-Order
        </div>
        {product.discount && (
          <div className="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-medium text-black dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest mt-1">{product.category}</p>
        </div>

        {/* Tier Selector */}
        {hasTiers ? (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Select Quantity Tier</p>
            <div className="space-y-1.5">
              {tiers.map((tier, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTierIdx(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                    selectedTierIdx === idx
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-black/8 dark:border-white/8 hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedTierIdx === idx ? 'border-orange-500' : 'border-black/25 dark:border-white/25'
                    }`}>
                      {selectedTierIdx === idx && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    </div>
                    <span className={`text-xs font-medium ${selectedTierIdx === idx ? 'text-orange-700 dark:text-orange-300' : 'text-black/70 dark:text-white/70'}`}>
                      {tier.label}
                    </span>
                  </div>
                  <span className={`text-xs font-bold tabular-nums ${selectedTierIdx === idx ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'}`}>
                    ৳{tier.price.toFixed(2)}<span className="font-normal text-black/30 dark:text-white/30">/pc</span>
                  </span>
                </button>
              ))}
            </div>
            {selectedTier && (
              <p className="text-[10px] text-black/40 dark:text-white/40 pl-1">
                Min order: <span className="font-bold text-black dark:text-white">{selectedTier.minQty} pc{selectedTier.minQty > 1 ? 's' : ''}</span>
                {selectedTier.maxQty ? ` – ${selectedTier.maxQty} pcs` : selectedTier.maxQty === undefined ? '+' : ''}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-black dark:text-white">৳{product.price.toFixed(2)}</span>
            {product.discount && (
              <span className="text-xs text-black/30 dark:text-white/30 line-through">
                ৳{Math.round(product.price / (1 - product.discount / 100)).toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
              isInCart
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-400 dark:hover:text-black'
            }`}
          >
            {isInCart ? <><Check size={13} /> Added</> : <><ShoppingCart size={13} /> Pre-Order</>}
          </button>
          {isInCart && (
            <Link
              to="/checkout"
              className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PreOrder() {
  const { products } = useProducts();
  const preorderProducts = products.filter((p: any) => p.isPreorder);

  return (
    <>
      <Helmet>
        <title>Pre-Order — Zantro</title>
        <meta name="description" content="Pre-order exclusive products at Zantro. Reserve yours today before they arrive." />
        <meta property="og:title" content="Pre-Order — Zantro" />
        <meta property="og:url" content="https://zantrobd.com/preorder" />
      </Helmet>

      <div className="bg-white dark:bg-neutral-950 min-h-screen pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-orange-500 mb-3">Exclusive Access</p>
            <h1 className="text-5xl font-light tracking-tight text-black dark:text-white mb-8">Pre-Order</h1>

            {/* Notice Banner */}
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 rounded-2xl p-6 flex flex-col md:flex-row gap-6 md:items-start">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                  <Clock size={18} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                  <Package size={18} className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-black dark:text-white mb-2 uppercase tracking-wider">Important Notice Regarding Pre-Order Items</h2>
                <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed max-w-3xl">
                  All products listed on this page are available exclusively through pre-order. By placing a pre-order,
                  you are reserving an item that has not yet arrived in our inventory. Pre-ordered products may take approximately{' '}
                  <span className="font-semibold text-orange-600 dark:text-orange-400">1 to 2 months</span> to be delivered after your order is confirmed.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} className="text-orange-500 shrink-0" />
                    <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium uppercase tracking-widest">Delivery timeline: 1–2 months</p>
                  </div>
                  <span className="hidden sm:block text-orange-300 dark:text-orange-700">·</span>
                  <p className="text-[11px] text-orange-600/70 dark:text-orange-400/70 font-medium uppercase tracking-widest">50% advance payment available at checkout</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          {preorderProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-6">
                <Package size={28} className="text-orange-400" />
              </div>
              <h3 className="text-xl font-light text-black dark:text-white mb-2">No pre-order items available</h3>
              <p className="text-sm text-black/40 dark:text-white/40">Check back soon — new pre-order items will appear here.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {preorderProducts.map((product) => (
                <div key={product.id}>
                  <PreorderProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
