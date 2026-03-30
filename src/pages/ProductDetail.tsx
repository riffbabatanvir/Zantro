import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../ProductContext';
import { useCart } from '../CartContext';
import { Star, ShoppingCart, Truck, ShieldCheck, RotateCcw, ChevronRight, Minus, Plus, Play } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => products.find((p) => p.id === id), [id, products]);
  const isInCart = product ? cart.some((item) => item.id === product.id) : false;

  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string }>({ type: 'image', url: '' });

  useEffect(() => {
    if (product) {
      setSelectedMedia({ type: 'image', url: product.image });
    }
  }, [product]);

  const allMedia = useMemo(() => {
    if (!product) return [];
    const media: { type: 'image' | 'video', url: string }[] = [{ type: 'image', url: product.image }];
    if (product.images) {
      product.images.forEach(img => media.push({ type: 'image', url: img }));
    }
    if (product.video) {
      media.push({ type: 'video', url: product.video });
    }
    return media;
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Product not found.</p>
      </div>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const originalPrice = product.discount ? product.price / (1 - product.discount / 100) : product.price * 1.5;
  const discountPercent = product.discount ? product.discount : 33;

  return (
    <div className="bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto md:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24 mb-16 md:mb-32">
          {/* Image Display */}
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-neutral-950 md:rounded-3xl overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-neutral-800">
              <div className="aspect-square md:aspect-[4/5] overflow-hidden p-4 md:p-12 flex items-center justify-center">
                {selectedMedia.type === 'video' ? (
                  <video 
                    src={selectedMedia.url} 
                    controls 
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <motion.img
                    key={selectedMedia.url}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={selectedMedia.url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>
            
            {/* Thumbnails */}
            {allMedia.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {allMedia.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMedia(media)}
                    className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all snap-start ${
                      selectedMedia.url === media.url ? 'border-orange-500' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Play className="text-gray-400" size={24} />
                      </div>
                    ) : (
                      <img src={media.url} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="px-4 md:px-0 flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  {product.category}
                </span>
                <div className="flex text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-bold">{product.rating || 5} ({product.reviewCount || 0} reviews)</span>
              </div>
              
              <h1 className="text-2xl md:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl md:text-5xl font-black text-orange-600 dark:text-orange-400">৳{product.price}</span>
                <span className="text-lg text-gray-400 line-through font-bold">৳{originalPrice.toFixed(2)}</span>
                <span className="bg-red-50 text-red-600 text-xs font-black px-2 py-1 rounded">SAVE {discountPercent}%</span>
              </div>

              <p className="text-sm md:text-lg text-gray-500 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            <div className="space-y-8 mb-12">
              <div className="flex items-center gap-6">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center bg-white dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 rounded-2xl p-1 shadow-sm dark:shadow-none">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-600 dark:text-orange-400 transition-colors"
                  >
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-600 dark:text-orange-400 transition-colors"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isInCart ? (
                  <Link
                    to="/cart"
                    className="flex-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-green-200 transition-all shadow-lg shadow-green-100 active:scale-95 text-center flex items-center justify-center"
                  >
                    Go to Cart
                  </Link>
                ) : (
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="flex-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-orange-200 transition-all shadow-lg shadow-orange-100 active:scale-95"
                  >
                    Add to Cart
                  </button>
                )}
                <Link
                  to="/checkout"
                  onClick={() => !isInCart && addToCart(product, quantity)}
                  className="flex-1 bg-orange-600 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 text-center active:scale-95 flex items-center justify-center"
                >
                  Buy Now
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 pt-8 border-t border-gray-100 dark:border-neutral-800">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Free Shipping<br/>(In Patuakhali)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-16 px-4 md:px-0 border-t border-gray-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Similar Items</h2>
              <Link to="/shop" className="text-sm font-bold text-orange-500">View More</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Fixed Bottom Bar - Alibaba/Taobao Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 border-t border-gray-100 dark:border-neutral-800 p-3 z-[60] flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {isInCart ? (
          <Link
            to="/cart"
            className="flex-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-center active:scale-95 transition-transform flex items-center justify-center"
          >
            Go to Cart
          </Link>
        ) : (
          <button
            onClick={() => addToCart(product, quantity)}
            className="flex-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 py-4 rounded-xl text-sm font-black uppercase tracking-widest active:scale-95 transition-transform"
          >
            Add to Cart
          </button>
        )}
        <Link
          to="/checkout"
          onClick={() => !isInCart && addToCart(product, quantity)}
          className="flex-1 bg-orange-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest text-center active:scale-95 transition-transform flex items-center justify-center"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}
