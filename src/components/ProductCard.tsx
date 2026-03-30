import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { motion } from 'motion/react';

export default function ProductCard({ product }: { product: Product; key?: string | number }) {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const isInCart = cart.some((item) => item.id === product.id);
  const originalPrice = product.discount ? product.price / (1 - product.discount / 100) : product.price * 1.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-md transition-all border border-gray-100 dark:border-neutral-800"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-neutral-900">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
          referrerPolicy="no-referrer"
        />
        {/* Badge - e.g. "Hot" or "Sale" */}
        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
          {product.discount ? `-${product.discount}%` : 'Hot'}
        </div>
      </Link>

      <div className="p-3 space-y-2">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-orange-600 dark:text-orange-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1">
          <div className="flex text-orange-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill={i < 4 ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">{product.soldCount ? (product.soldCount >= 1000 ? (product.soldCount / 1000).toFixed(1) + 'k+' : product.soldCount) : '0'} sold</span>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 line-through">৳{originalPrice.toFixed(2)}</span>
              <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                ৳{product.price.toFixed(2)}
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (isInCart) {
                  navigate('/cart');
                } else {
                  addToCart(product);
                }
              }}
              className={isInCart 
                ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 p-2 rounded-xl hover:bg-green-200 transition-colors"
                : "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 p-2 rounded-xl hover:bg-orange-200 transition-colors"
              }
              title={isInCart ? "Go to Cart" : "Add to Cart"}
            >
              {isInCart ? <Check size={16} strokeWidth={2.5} /> : <ShoppingCart size={16} strokeWidth={2.5} />}
            </button>
          </div>
          
          <Link
            to="/checkout"
            onClick={() => !isInCart && addToCart(product)}
            className="w-full bg-orange-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
