import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../ProductContext';
import { useCart } from '../CartContext';
import { Star, ShoppingCart, Truck, ChevronRight, Minus, Plus, Play, Send, Trash2, Share2, Heart, X, ZoomIn } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { toast } from 'sonner';
import { useWishlist } from '../WishlistContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState<any[]>([]);

  const product = useMemo(() => products.find((p) => p.id === id), [id, products]);
  const isInCart = product ? cart.some((item) => item.id === product.id) : false;

  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string }>({ type: 'image', url: '' });

  // Recently viewed - save to localStorage
  useEffect(() => {
    if (product) {
      setSelectedMedia({ type: 'image', url: product.image });
      setLocalReviews((product as any).customerReviews || []);
      // Save to recently viewed
      try {
        const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filtered = stored.filter((p: any) => p.id !== product.id);
        const updated = [{ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, rating: product.rating, discount: product.discount }, ...filtered].slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch {}
    }
  }, [product]);

  const allMedia = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    const media: { type: 'image' | 'video', url: string }[] = [];
    const addImage = (url: string) => {
      if (url && !seen.has(url)) { seen.add(url); media.push({ type: 'image', url }); }
    };
    if (product.images && product.images.length > 0) product.images.forEach(addImage);
    addImage(product.image);
    if (product.video) media.push({ type: 'video', url: product.video });
    return media;
  }, [product]);

  const sizeVariant = (product as any)?.variants?.find((v: any) => v.type === 'size');
  const colorVariant = (product as any)?.variants?.find((v: any) => v.type === 'color');

  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error('Please fill in your name and review');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reviewName, rating: reviewRating, comment: reviewComment })
      });
      if (res.ok) {
        const newReview = await res.json();
        setLocalReviews(prev => [newReview, ...prev]);
        setReviewName('');
        setReviewComment('');
        setReviewRating(5);
        toast.success('Review submitted!');
      } else {
        toast.error('Failed to submit review');
      }
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Product not found.</p>
      </div>
    );
  }

  // Zoom overlay (rendered inside return)
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const originalPrice = product.discount ? product.price / (1 - product.discount / 100) : product.price * 1.5;
  const discountPercent = product.discount ? product.discount : 33;
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = product ? isWishlisted(product.id) : false;
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const isAdmin = !!localStorage.getItem('adminToken');

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product?.name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/products/${id}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLocalReviews(prev => prev.filter((r: any) => r.id !== reviewId));
        toast.success('Review deleted');
      } else {
        toast.error('Failed to delete review');
      }
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const stock = (product as any).stock;
  const isLowStock = stock !== undefined && stock > 0 && stock <= 5;
  const isOutOfStock = stock !== undefined && stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({ ...product, selectedSize: selectedSize || undefined, selectedColor: selectedColor || undefined } as any, quantity);
  };

  const avgRating = localReviews.length > 0
    ? (localReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / localReviews.length).toFixed(1)
    : product.rating || 5;

  return (
    <div className="bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto md:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24 mb-16 md:mb-32">
          {/* Image Display */}
          <div className="flex flex-col gap-4">
            {/* Zoom Modal */}
            {zoomedImage && (
              <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
                <button className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={28} /></button>
                <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full object-contain rounded-xl" referrerPolicy="no-referrer" onClick={e => e.stopPropagation()} />
              </div>
            )}

            <div className="bg-white dark:bg-neutral-950 md:rounded-3xl overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-neutral-800 relative group/img">
              <div className="aspect-square md:aspect-[4/5] overflow-hidden p-4 md:p-12 flex items-center justify-center">
                {selectedMedia.type === 'video' ? (
                  <video src={selectedMedia.url} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  <>
                    <motion.img key={selectedMedia.url} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      src={selectedMedia.url} alt={product.name} className="w-full h-full object-contain cursor-zoom-in" referrerPolicy="no-referrer"
                      onClick={() => setZoomedImage(selectedMedia.url)} />
                    <button onClick={() => setZoomedImage(selectedMedia.url)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm">
                      <ZoomIn size={15} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {allMedia.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {allMedia.map((media, idx) => (
                  <button key={idx} onClick={() => setSelectedMedia(media)}
                    className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all snap-start ${selectedMedia.url === media.url ? 'border-orange-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
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
                    <Star key={i} size={12} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-bold">{avgRating} ({localReviews.length > 0 ? localReviews.length : (product.reviewCount || 0)} reviews)</span>
              </div>

              <h1 className="text-2xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl md:text-5xl font-black text-orange-600 dark:text-orange-400">৳{product.price}</span>
                <span className="text-lg text-gray-400 line-through font-bold">৳{originalPrice.toFixed(2)}</span>
                <span className="bg-red-50 text-red-600 text-xs font-black px-2 py-1 rounded">SAVE {discountPercent}%</span>
              </div>

              {/* Stock Badge */}
              {isOutOfStock && (
                <div className="inline-block mb-4 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-black rounded-full uppercase tracking-widest">
                  Out of Stock
                </div>
              )}
              {isLowStock && (
                <div className="inline-block mb-4 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-black rounded-full uppercase tracking-widest animate-pulse">
                  Only {stock} left!
                </div>
              )}
              {stock !== undefined && stock > 5 && (
                <div className="inline-block mb-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-black rounded-full uppercase tracking-widest">
                  In Stock ({stock} available)
                </div>
              )}

              <p className="text-sm md:text-lg text-gray-500 leading-relaxed font-medium">
                {product.description}
              </p>

              {/* Share + Wishlist */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                    wishlisted
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500'
                      : 'border-gray-200 dark:border-neutral-700 text-gray-500 hover:border-red-300'
                  }`}
                >
                  <Heart size={15} className={wishlisted ? 'fill-red-500 text-red-500' : ''} />
                  {wishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-neutral-700 text-sm font-bold text-gray-500 hover:border-orange-300 dark:hover:border-orange-600 transition-all"
                >
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              {/* Size Selector */}
              {sizeVariant && sizeVariant.options.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizeVariant.options.map((size: string) => (
                      <button key={size} onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${selectedSize === size ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {colorVariant && colorVariant.options.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Color {selectedColor && <span className="text-orange-500 normal-case font-bold">— {selectedColor}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colorVariant.options.map((color: string) => (
                      <button key={color} onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${selectedColor === color ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'}`}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-6">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center bg-white dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 rounded-2xl p-1 shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-600 dark:text-orange-400 transition-colors">
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-gray-900 dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(stock !== undefined ? Math.min(stock, quantity + 1) : quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-600 dark:text-orange-400 transition-colors">
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isInCart ? (
                  <Link to="/cart" className="flex-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-green-200 transition-all shadow-lg shadow-green-100 active:scale-95 text-center flex items-center justify-center">
                    Go to Cart
                  </Link>
                ) : (
                  <button onClick={handleAddToCart} disabled={isOutOfStock}
                    className={`flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200 shadow-orange-100'}`}>
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
                <Link to="/checkout" onClick={() => !isInCart && !isOutOfStock && handleAddToCart()}
                  className={`flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg text-center active:scale-95 flex items-center justify-center ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200'}`}>
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

        {/* Customer Reviews Section */}
        <section className="px-4 md:px-0 mb-16 md:mb-32 border-t border-gray-100 dark:border-neutral-800 pt-16">
          <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-8">Customer Reviews</h2>

          {/* Review Summary */}
          {localReviews.length > 0 && (
            <div className="flex items-center gap-4 mb-8 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
              <div className="text-center">
                <p className="text-5xl font-black text-orange-600 dark:text-orange-400">{avgRating}</p>
                <div className="flex text-orange-400 justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{localReviews.length} reviews</p>
              </div>
            </div>
          )}

          {/* Existing Reviews */}
          {localReviews.length > 0 && (
            <div className="space-y-4 mb-10">
              {localReviews.map((review: any) => (
                <div key={review.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black text-sm text-gray-900 dark:text-white">{review.name}</p>
                      <div className="flex text-orange-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} fill={i < review.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                      {isAdmin && (
                        <button onClick={() => handleDeleteReview(review.id)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded" title="Delete review">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {localReviews.length === 0 && (
            <p className="text-sm text-gray-400 mb-8">No reviews yet. Be the first to review!</p>
          )}

          {/* Submit Review Form */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Write a Review</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Your name" value={reviewName} onChange={e => setReviewName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= reviewRating ? 'text-orange-400' : 'text-gray-200 dark:text-neutral-700'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea placeholder="Share your experience with this product..." value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                rows={3} className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors resize-none" />
              <button onClick={handleSubmitReview} disabled={isSubmittingReview}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-50">
                <Send size={14} /> {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-16 px-4 md:px-0 border-t border-gray-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Similar Items</h2>
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

      {/* Mobile Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 border-t border-gray-100 dark:border-neutral-800 p-3 z-[60] flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {isInCart ? (
          <Link to="/cart" className="flex-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-center active:scale-95 transition-transform flex items-center justify-center">
            Go to Cart
          </Link>
        ) : (
          <button onClick={handleAddToCart} disabled={isOutOfStock}
            className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest active:scale-95 transition-transform ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'}`}>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
        <Link to="/checkout" onClick={() => !isInCart && !isOutOfStock && handleAddToCart()}
          className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-center active:scale-95 transition-transform flex items-center justify-center ${isOutOfStock ? 'bg-gray-300 text-gray-500 pointer-events-none' : 'bg-orange-600 text-white'}`}>
          Buy Now
        </Link>
      </div>
    </div>
  );
}
