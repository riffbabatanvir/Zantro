import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';

export default function ProductCard({ product }: { product: Product; key?: string | number }) {
  const { addToCart, cart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isInCart = cart.some((item) => item.id === product.id);
  const originalPrice = product.discount ? product.price / (1 - product.discount / 100) : product.price * 1.5;
  const isOutOfStock = (product as any).stock === 0;
  const isPreorder = (product as any).isPreorder || false;
  const isPreowned = (product as any).isPreowned || false;
  const canPreorder = isPreorder || isOutOfStock;
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-md transition-all border border-gray-100 dark:border-neutral-800"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-neutral-900">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image} alt={product.name}
            className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4 ${isOutOfStock ? 'opacity-50' : ''}`}
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <span className="bg-black/70 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {t('Out of Stock')}
            </span>
            {isPreorder && (
              <Link to={`/product/${product.id}`} className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest transition-colors">
                {t('Pre-Order Now')}
              </Link>
            )}
          </div>
        )}

        {/* Discount / Hot badge */}
        {!isOutOfStock && !isPreowned && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
            {product.discount ? `Limited offer: ${product.discount}% Discount` : 'Hot'}
          </div>
        )}

        {/* Pre-Owned badge */}
        {isPreowned && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">{t('Pre-Owned')}</span>
            {(product as any).percentNew != null && (
              <span className="bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">{(product as any).percentNew}% new</span>
            )}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>
      </div>

      <div className="p-3 space-y-2">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-orange-600 dark:text-orange-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1">
          <div className="flex text-orange-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">
            {product.soldCount ? (product.soldCount >= 1000 ? (product.soldCount / 1000).toFixed(1) + 'k+' : product.soldCount) : '0'} sold
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 line-through">৳{originalPrice.toFixed(2)}</span>
            <span className="text-lg font-black text-orange-600 dark:text-orange-400">৳{product.price.toFixed(2)}</span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (isOutOfStock && !isPreorder) return;
              if (isInCart) navigate('/cart');
              else addToCart({ ...product, isPreorder: canPreorder } as any);
            }}
            disabled={isOutOfStock && !isPreorder}
            className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-1.5 ${
              isInCart
                ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 hover:bg-green-200'
                : isOutOfStock && !isPreorder
                  ? 'bg-gray-100 dark:bg-neutral-800 text-gray-300 cursor-not-allowed'
                  : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200'
            }`}
          >
            {isInCart
              ? <><Check size={13} strokeWidth={2.5} /> In Cart</>
              : isOutOfStock && !isPreorder
                ? t('Out of Stock')
                : <><ShoppingCart size={13} strokeWidth={2.5} /> {t('Add to Cart')}</>
            }
          </button>

          <Link
            to={isOutOfStock && !isPreorder ? '#' : isPreorder ? `/product/${product.id}` : '/checkout'}
            onClick={(e) => { if (isOutOfStock && !isPreorder) { e.preventDefault(); return; } if (!isPreorder && !isInCart) addToCart({ ...product, isPreorder: canPreorder } as any); }}
            className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all shadow-lg ${
              isOutOfStock && !isPreorder
                ? 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed shadow-none'
                : canPreorder
                  ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200'
                  : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200'
            }`}
          >
            {isOutOfStock && !isPreorder ? t('Out of Stock') : canPreorder ? `🕐 ${t('Pre-Order')}` : 'Buy Now'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
