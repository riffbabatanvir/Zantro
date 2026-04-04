import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[85vw] max-w-sm bg-white dark:bg-neutral-950 shadow-2xl z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-orange-500" />
                <h2 className="font-black text-gray-900 dark:text-white tracking-tight">
                  Cart <span className="text-orange-500">({totalItems})</span>
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingCart size={48} className="text-gray-200 dark:text-neutral-700" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your cart is empty</p>
                  <button onClick={onClose}
                    className="text-xs font-bold text-orange-500 hover:underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <motion.div key={`${item.id}-${(item as any).selectedSize}-${(item as any).selectedColor}-${idx}`}
                    layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 p-3 bg-gray-50 dark:bg-neutral-900 rounded-2xl"
                  >
                    <Link to={`/product/${item.id}`} onClick={onClose}
                      className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`} onClick={onClose}>
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight hover:text-orange-500 transition-colors">{item.name}</p>
                      </Link>
                      {((item as any).selectedSize || (item as any).selectedColor) && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {(item as any).selectedSize && `Size: ${(item as any).selectedSize}`}
                          {(item as any).selectedSize && (item as any).selectedColor && ' · '}
                          {(item as any).selectedColor && `Color: ${(item as any).selectedColor}`}
                        </p>
                      )}
                      <p className="text-sm font-black text-orange-500 mt-1">৳{item.price.toFixed(2)}</p>
                      {(item as any).selectedTierLabel && (
                        <p className="text-[9px] uppercase tracking-widest text-orange-400 font-bold mt-0.5">{(item as any).selectedTierLabel}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 rounded-lg border border-gray-100 dark:border-neutral-700 p-0.5">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1, (item as any).selectedSize, (item as any).selectedColor)}
                            disabled={item.quantity <= ((item as any).preorderMinQty || 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                            <Minus size={11} strokeWidth={2.5} />
                          </button>
                          <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1, (item as any).selectedSize, (item as any).selectedColor)}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors">
                            <Plus size={11} strokeWidth={2.5} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id, (item as any).selectedSize, (item as any).selectedColor)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">৳{totalPrice.toFixed(2)}</span>
                </div>
                <Link to="/checkout" onClick={onClose}
                  className="w-full bg-orange-600 text-white py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-center hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                  Checkout <ArrowRight size={16} />
                </Link>
                <Link to="/cart" onClick={onClose}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-gray-500 dark:text-gray-400 text-center hover:text-orange-500 transition-colors">
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
