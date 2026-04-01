import { ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingCart({ onCartClick }: { onCartClick?: () => void }) {
  const { totalItems } = useCart();
  const location = useLocation();

  // Hide on specific pages where it might be redundant or in the way
  const hideOnPages = ['/cart', '/checkout', '/admin'];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[70]"
      >
        <button
          onClick={onCartClick}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-orange-600 text-white rounded-full shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:bg-orange-700 hover:scale-105 transition-all active:scale-95 relative"
        >
          <ShoppingCart size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 text-[9px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full shadow-sm border border-orange-100 dark:border-orange-900/30">
              {totalItems}
            </span>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
