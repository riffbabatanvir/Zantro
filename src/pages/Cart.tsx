import { useCart } from '../CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950 pt-20">
        <h2 className="text-3xl font-light tracking-tight text-black dark:text-white mb-8">Your cart is empty</h2>
        <Link 
          to="/shop" 
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-black dark:text-white border-b border-black dark:border-white pb-1 hover:text-black/60 dark:text-white/60 hover:border-black/20 dark:border-white/20 transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-20">
          <h1 className="text-[11px] font-medium uppercase tracking-[0.4em] text-black/40 dark:text-white/40 mb-4">Shopping Cart</h1>
          <h2 className="text-5xl font-light tracking-tight text-black dark:text-white">Your Selection</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          <div className="lg:col-span-2 space-y-12">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-8 pb-12 border-b border-black/5 dark:border-white/5">
                <Link to={`/product/${item.id}`} className="w-32 aspect-[4/5] bg-gray-50 dark:bg-neutral-900 overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </Link>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <Link to={`/product/${item.id}`} className="group">
                      <h3 className="text-[11px] font-medium uppercase tracking-widest text-black dark:text-white mb-2 group-hover:text-orange-600 dark:text-orange-400 transition-colors">{item.name}</h3>
                      <p className="text-[10px] text-black/30 dark:text-white/30 uppercase tracking-widest">{item.category}</p>
                    </Link>
                    <p className="text-sm font-light text-black dark:text-white">৳{item.price}</p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center border-b border-black/10 dark:border-white/10 pb-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-10 text-center text-[10px] font-medium tracking-widest">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] font-medium uppercase tracking-widest text-black/30 dark:text-white/30 hover:text-black dark:text-white transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-gray-50 dark:bg-neutral-900 p-12">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-12">Summary</h3>
              
              <div className="space-y-6 mb-12">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40">
                  <span>Subtotal</span>
                  <span className="text-black dark:text-white">৳{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40">
                  <span>Shipping</span>
                  <span className="text-black dark:text-white">Calculated at next step</span>
                </div>
                <div className="pt-6 border-t border-black/5 dark:border-white/5 flex justify-between text-[11px] font-bold uppercase tracking-widest text-black dark:text-white">
                  <span>Total</span>
                  <span>৳{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Link 
                to="/checkout" 
                className="block w-full bg-orange-600 text-white text-center py-4 text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
              >
                Checkout
              </Link>
              
              <p className="mt-8 text-[10px] text-black/30 dark:text-white/30 text-center uppercase tracking-widest leading-relaxed">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
