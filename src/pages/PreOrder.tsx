import { Helmet } from 'react-helmet-async';
import { useProducts } from '../ProductContext';
import ProductCard from '../components/ProductCard';
import { Clock, Package, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

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
                  All products listed on this page are available exclusively through pre-order. By placing a pre-order, you are reserving an item that has not yet arrived in our inventory. Please be aware that pre-ordered products may take approximately <span className="font-semibold text-orange-600 dark:text-orange-400">1 to 2 months</span> to be delivered after your order is confirmed. We appreciate your patience and will keep you updated on the status of your order throughout the process.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <AlertTriangle size={13} className="text-orange-500 shrink-0" />
                  <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium uppercase tracking-widest">Delivery timeline: 1–2 months from order date</p>
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
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {preorderProducts.map((product) => (
                <div key={product.id} className="relative">
                  <div className="absolute top-3 left-3 z-10 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Pre-Order
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
