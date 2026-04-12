import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../ProductContext';
import { useCart } from '../CartContext';
import { Star, ShoppingCart, Truck, ChevronRight, ChevronLeft, Minus, Plus, Play, Send, Trash2, Share2, Heart, X, ZoomIn } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { toast } from 'sonner';
import { useWishlist } from '../WishlistContext';
import { Helmet } from 'react-helmet-async';


// Renders description text that supports:
//   - Lines starting with "- " or "• " → bullet points
//   - Lines matching ![](url) → inline image
//   - Lines starting with "## " → sub-heading
//   - Blank lines → paragraph break
//   - Everything else → paragraph text
function RichDescription({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let numberedBuffer: string[] = [];

  const parseInline = (str: string, key: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let idx = 0;
    const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
    let match;
    let lastIndex = 0;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(str)) !== null) {
      if (match.index > lastIndex) parts.push(<span key={idx++}>{str.slice(lastIndex, match.index)}</span>);
      if (match[2] !== undefined) parts.push(<strong key={idx++} style={{ fontWeight: 700 }}>{match[2]}</strong>);
      else if (match[3] !== undefined) parts.push(<em key={idx++}>{match[3]}</em>);
      else if (match[4] !== undefined) parts.push(<span key={idx++} style={{ textDecoration: 'line-through', opacity: 0.6 }}>{match[4]}</span>);
      else if (match[5] !== undefined) parts.push(<code key={idx++} style={{ background: 'rgba(0,0,0,0.07)', borderRadius: '4px', padding: '1px 5px', fontFamily: 'monospace', fontSize: '0.9em' }}>{match[5]}</code>);
      else if (match[6] !== undefined) parts.push(<a key={idx++} href={match[7]} target="_blank" rel="noopener noreferrer" style={{ color: '#f97316', textDecoration: 'underline' }}>{match[6]}</a>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) parts.push(<span key={idx++}>{str.slice(lastIndex)}</span>);
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  const flushBullets = (key: string) => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <ul key={key} style={{ listStyle: 'none', padding: 0, margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {bulletBuffer.map((b, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', lineHeight: 1.6 }}>
            <span style={{ color: '#f97316', fontWeight: 900, fontSize: '16px', lineHeight: 1.4, flexShrink: 0 }}>•</span>
            <span>{parseInline(b, `b${i}`)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  const flushNumbered = (key: string) => {
    if (numberedBuffer.length === 0) return;
    elements.push(
      <ol key={key} style={{ padding: '0 0 0 20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {numberedBuffer.map((b, i) => (
          <li key={i} style={{ fontSize: '14px', lineHeight: 1.6 }}>{parseInline(b, `n${i}`)}</li>
        ))}
      </ol>
    );
    numberedBuffer = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushBullets(`b-${i}`); flushNumbered(`n-${i}`);
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '16px 0' }} />);
      return;
    }

    const imgMatch =
      trimmed.match(/^!\[.*?\]\((.+?)\)$/) ||
      trimmed.match(/^!\[.*?\]\s+(.+)$/) ||
      trimmed.match(/^!\[\](.+)$/) ||
      (trimmed.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) ? [null, trimmed] : null);
    if (imgMatch) {
      flushBullets(`b-${i}`); flushNumbered(`n-${i}`);
      elements.push(<img key={i} src={imgMatch[1]} alt="Product detail" style={{ width: '100%', borderRadius: '12px', margin: '16px 0', display: 'block', objectFit: 'cover' }} referrerPolicy="no-referrer" />);
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushBullets(`b-${i}`); flushNumbered(`n-${i}`);
      elements.push(<p key={i} style={{ fontWeight: 700, fontSize: '15px', marginTop: '20px', marginBottom: '6px' }} className="text-gray-900 dark:text-white">{parseInline(trimmed.slice(3), `h2-${i}`)}</p>);
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushBullets(`b-${i}`); flushNumbered(`n-${i}`);
      elements.push(<p key={i} style={{ fontWeight: 600, fontSize: '13px', marginTop: '14px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }} className="text-gray-900 dark:text-white">{parseInline(trimmed.slice(4), `h3-${i}`)}</p>);
      return;
    }

    if (trimmed.startsWith('> ')) {
      flushBullets(`b-${i}`); flushNumbered(`n-${i}`);
      elements.push(<blockquote key={i} style={{ borderLeft: '3px solid #f97316', paddingLeft: '12px', margin: '10px 0', opacity: 0.7, fontStyle: 'italic', fontSize: '14px', lineHeight: 1.6 }}>{parseInline(trimmed.slice(2), `bq-${i}`)}</blockquote>);
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('\u2022 ')) {
      flushNumbered(`n-${i}`);
      bulletBuffer.push(trimmed.slice(2));
      return;
    }

    const numMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numMatch) {
      flushBullets(`b-${i}`);
      numberedBuffer.push(numMatch[1]);
      return;
    }

    if (trimmed === '') {
      flushBullets(`b-${i}`); flushNumbered(`n-${i}`);
      return;
    }

    flushBullets(`b-${i}`); flushNumbered(`n-${i}`);
    elements.push(
      <p key={i} style={{ fontSize: '14px', lineHeight: 1.7, margin: '8px 0' }} className="text-gray-600 dark:text-gray-400">
        {parseInline(trimmed, `p-${i}`)}
      </p>
    );
  });

  flushBullets('b-end');
  flushNumbered('n-end');
  return <div>{elements}</div>;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { products, isLoading } = useProducts();
  const { addToCart, cart, removeFromCart } = useCart();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState<any[]>([]);

  const product = useMemo(() => products.find((p) => p.id === id), [id, products]);
  const isInCart = product ? cart.some((item) => item.id === product.id) : false;

  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string }>({ type: 'image', url: '' });
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = product ? isWishlisted(product.id) : false;

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
    const addVideo = (url: string) => {
      if (url && !seen.has(url)) { seen.add(url); media.push({ type: 'video', url }); }
    };
    if (product.images && product.images.length > 0) product.images.forEach(addImage);
    addImage(product.image);
    if ((product as any).videos && (product as any).videos.length > 0) {
      (product as any).videos.forEach(addVideo);
    } else if (product.video) {
      addVideo(product.video);
    }
    return media;
  }, [product]);

  // Keyboard navigation for zoom modal — must be after allMedia
  useEffect(() => {
    if (!zoomedImage) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setZoomedImage(null); return; }
      const imgs = allMedia.filter((m) => m.type === 'image');
      if (imgs.length <= 1) return;
      const idx = imgs.findIndex((m) => m.url === zoomedImage);
      if (e.key === 'ArrowLeft') setZoomedImage(imgs[(idx - 1 + imgs.length) % imgs.length].url);
      if (e.key === 'ArrowRight') setZoomedImage(imgs[(idx + 1) % imgs.length].url);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [zoomedImage, allMedia]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-black/30 dark:text-white/30 uppercase tracking-widest">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <Helmet>
          <title>Product Not Found — Zantro</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-black/30 dark:text-white/30 mb-4">404</p>
          <h1 className="text-3xl font-light tracking-tight text-black dark:text-white mb-3">Product Not Found</h1>
          <p className="text-sm text-black/40 dark:text-white/40 mb-10 max-w-xs">
            This product may have been removed or the link is incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              to="/shop"
              className="px-6 py-3 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-colors"
            >
              Browse All Products
            </Link>
            <Link
              to="/"
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-black dark:text-white border-b border-black dark:border-white pb-1 hover:text-black/60 dark:hover:text-white/60 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const originalPrice = product.discount ? product.price / (1 - product.discount / 100) : product.price * 1.5;
  const discountPercent = product.discount ? product.discount : 33;
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
  const isPreorder = (product as any).isPreorder || false;
  const showPreorderButton = isPreorder || isOutOfStock;
  const isPreowned = (product as any).isPreowned || false;
  const yearsUsed = (product as any).yearsUsed;
  const percentNew = (product as any).percentNew;
  const preorderTiers: Array<{ minQty: number; maxQty?: number; label: string; price: number }> = (product as any).preorderPriceTiers || [];
  const hasTiers = isPreorder && preorderTiers.length > 0;
  const selectedTier = hasTiers ? preorderTiers[selectedTierIdx] : null;

  // For tier products: price = flat package price, quantity = number of packages (min 1)
  // The tier price is already a total for the whole package (e.g. "3 pcs for ৳800")
  const packagePrice = selectedTier ? selectedTier.price : product.price;
  const packageQtyLabel = selectedTier ? selectedTier.label : null;

  // Keep quantity reset to 1 package when tier changes
  const handleTierChange = (idx: number) => {
    setSelectedTierIdx(idx);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock && !isPreorder) return;
    // Remove existing entry for this product first so re-adding with new tier replaces it
    if (hasTiers) removeFromCart(product.id);
    addToCart({
      ...product,
      price: packagePrice,          // flat package price — NOT multiplied by qty later
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
      isPreorder: isPreorder || isOutOfStock,
      selectedTierLabel: packageQtyLabel,
      preorderMinQty: 1,            // minimum 1 package
      preorderIsPackage: true,
    } as any, quantity);
    if (isPreorder || isOutOfStock) {
      toast.success('Pre-order added! Expected delivery: 1–2 months.');
    }
  };

  const avgRating = localReviews.length > 0
    ? (localReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / localReviews.length).toFixed(1)
    : product.rating || 5;

  return (
    <>
      <Helmet>
        <title>{product.name} — Zantro</title>
        <meta name="description" content={`${(product.description || '').slice(0, 155)}`} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} — Zantro`} />
        <meta property="og:description" content={(product.description || '').slice(0, 155)} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={`https://zantrobd.com/product/${product.id}`} />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="BDT" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org/",
          "@type": isPreowned ? "IndividualProduct" : "Product",
          "name": product.name,
          "description": product.description || '',
          "image": [
            ...(product.images && product.images.length > 0 ? product.images : []),
            product.image,
          ].filter(Boolean),
          "url": `https://zantrobd.com/product/${product.id}`,
          "sku": product.id,
          "brand": { "@type": "Brand", "name": "Zantro" },
          "category": product.category,
          ...(product.rating ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": String(product.rating),
              "reviewCount": String(localReviews.length || product.reviewCount || 1),
              "bestRating": "5",
              "worstRating": "1",
            }
          } : {}),
          ...(localReviews.length > 0 ? {
            "review": localReviews.slice(0, 5).map((r: any) => ({
              "@type": "Review",
              "author": { "@type": "Person", "name": r.name },
              "reviewRating": { "@type": "Rating", "ratingValue": String(r.rating), "bestRating": "5", "worstRating": "1" },
              "reviewBody": r.comment,
              "datePublished": r.date,
            }))
          } : {}),
          "offers": hasTiers
            ? preorderTiers.map((tier) => ({
                "@type": "Offer",
                "name": tier.label,
                "price": String(tier.price),
                "priceCurrency": "BDT",
                "availability": "https://schema.org/PreOrder",
                "url": `https://zantrobd.com/product/${product.id}`,
                "seller": { "@type": "Organization", "name": "Zantro" },
              }))
            : {
                "@type": "Offer",
                "price": String(product.price),
                "priceCurrency": "BDT",
                "availability": isOutOfStock
                  ? "https://schema.org/OutOfStock"
                  : isPreorder
                  ? "https://schema.org/PreOrder"
                  : stock !== undefined
                  ? "https://schema.org/InStock"
                  : "https://schema.org/InStock",
                "url": `https://zantrobd.com/product/${product.id}`,
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                "seller": { "@type": "Organization", "name": "Zantro" },
                ...(stock !== undefined && !isPreorder ? { "inventoryLevel": { "@type": "QuantitativeValue", "value": stock } } : {}),
              },
        })}</script>
      </Helmet>
    <div className="bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto md:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24 mb-16 md:mb-32">
          {/* Image Display */}
          <div className="flex flex-col gap-4">
            {/* Zoom Modal */}
            {zoomedImage && (
              <div
                className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
                onClick={() => setZoomedImage(null)}
                style={{ cursor: 'zoom-out' }}
              >
                <button
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                  onClick={() => setZoomedImage(null)}
                ><X size={20} /></button>
                <img
                  src={zoomedImage}
                  alt="Zoomed"
                  className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl select-none"
                  referrerPolicy="no-referrer"
                  onClick={e => e.stopPropagation()}
                  draggable={false}
                />
                {allMedia.filter(m => m.type === 'image').length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        const imgs = allMedia.filter(m => m.type === 'image');
                        const idx = imgs.findIndex(m => m.url === zoomedImage);
                        setZoomedImage(imgs[(idx - 1 + imgs.length) % imgs.length].url);
                      }}
                    ><ChevronLeft size={22} /></button>
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        const imgs = allMedia.filter(m => m.type === 'image');
                        const idx = imgs.findIndex(m => m.url === zoomedImage);
                        setZoomedImage(imgs[(idx + 1) % imgs.length].url);
                      }}
                    ><ChevronRight size={22} /></button>
                  </>
                )}
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs select-none">Tap outside or press Esc to close</p>
              </div>
            )}

            <div className="bg-white dark:bg-neutral-950 md:rounded-3xl overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-neutral-800 relative group/img">
              <div className="aspect-square md:aspect-[4/5] overflow-hidden p-4 md:p-12 flex items-center justify-center">
                {selectedMedia.type === 'video' ? (
                  <video src={selectedMedia.url} controls autoPlay poster={product.image} className="w-full h-full object-contain" />
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
                      <div className="w-full h-full relative">
                        <img src={product.image} alt="Video" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow">
                            <Play size={12} className="text-gray-800 ml-0.5" fill="currentColor" />
                          </div>
                        </div>
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
                <span className="text-3xl md:text-5xl font-black text-orange-600 dark:text-orange-400">৳{packagePrice}</span>
                {!hasTiers && <span className="text-lg text-gray-400 line-through font-bold">৳{originalPrice.toFixed(2)}</span>}
                {!hasTiers && <span className="bg-red-50 text-red-600 text-xs font-black px-2 py-1 rounded">SAVE {discountPercent}%</span>}
                {hasTiers && selectedTier && <span className="text-sm text-gray-400 font-medium">per package</span>}
              </div>

              {/* Stock Badge */}
              {isPreowned && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-black rounded-full uppercase tracking-widest">
                    ♻️ Pre-Owned
                  </div>
                  {percentNew != null && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-black rounded-full uppercase tracking-widest">
                      {percentNew}% Condition
                    </div>
                  )}
                  {yearsUsed != null && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-black rounded-full uppercase tracking-widest">
                      Used {yearsUsed} {yearsUsed === 1 ? 'year' : 'years'}
                    </div>
                  )}
                </div>
              )}
              {isPreorder && (
                <div className="inline-block mb-4 mr-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-black rounded-full uppercase tracking-widest">
                  🕐 Pre-Order — 1–2 Months Delivery
                </div>
              )}
              {isOutOfStock && !isPreorder && (
                <div className="inline-block mb-4 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-black rounded-full uppercase tracking-widest">
                  Out of Stock — Pre-Order Available
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

              {/* Share + Wishlist + WhatsApp */}
              <div className="flex gap-2 mt-4 flex-wrap">
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
                <a
                  href={`https://wa.me/8801779102808?text=${encodeURIComponent(`Hi, I want to order:\n*${product.name}*\nPrice: ৳${product.price}\nLink: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 text-sm font-bold text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Order
                </a>
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

              {/* Preorder Tier Selector */}
              {hasTiers && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Select Package</p>
                  <div className="space-y-2">
                    {preorderTiers.map((tier, idx) => (
                      <button key={idx} type="button" onClick={() => handleTierChange(idx)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                          selectedTierIdx === idx
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-orange-300'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedTierIdx === idx ? 'border-orange-500' : 'border-gray-300 dark:border-neutral-500'
                          }`}>
                            {selectedTierIdx === idx && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                          </div>
                          <span className={`text-sm font-bold ${selectedTierIdx === idx ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                            {tier.label}
                          </span>
                        </div>
                        <span className={`text-sm font-black tabular-nums ${selectedTierIdx === idx ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                          ৳{tier.price.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedTier && quantity > 1 && (
                    <p className="text-xs text-gray-400 mt-2 pl-1">
                      {quantity} × {selectedTier.label} = <span className="font-black text-gray-900 dark:text-white">৳{(packagePrice * quantity).toFixed(2)}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Quantity — "Packages" for tiered preorders */}
              <div className="flex items-center gap-6">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {hasTiers ? 'Packages' : 'Quantity'}
                </span>
                <div className="flex items-center bg-white dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 rounded-2xl p-1 shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-600 dark:text-orange-400 transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-gray-900 dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(stock !== undefined && !isPreorder ? Math.min(stock, quantity + 1) : quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-600 dark:text-orange-400 transition-colors">
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Action Buttons — always allow re-selecting tier for preorder */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleAddToCart} disabled={isOutOfStock && !isPreorder}
                  className={`flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                    isOutOfStock && !isPreorder ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                    showPreorderButton ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200' :
                    'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200 shadow-orange-100'
                  }`}>
                  {hasTiers && isInCart ? t('Update Cart') : showPreorderButton ? t('Add Pre-order to Cart') : t('Add to Cart')}
                </button>
                <Link to="/checkout" onClick={() => !(isOutOfStock && !isPreorder) && handleAddToCart()}
                  className={`flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg text-center active:scale-95 flex items-center justify-center ${isOutOfStock && !isPreorder ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200'}`}>
                  {showPreorderButton ? t('Pre-Order & Checkout') : t('Buy Now')}
                </Link>
              </div>
            </div>


          </div>
        </div>

        {/* Rich Product Description Section */}
        {product.description && (
          <section className="px-4 md:px-0 mb-16">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6 uppercase text-[13px] tracking-widest">Product Description</h2>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-neutral-800">
              <RichDescription text={product.description} />
            </div>
          </section>
        )}

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
        <button onClick={handleAddToCart} disabled={isOutOfStock && !isPreorder}
          className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest active:scale-95 transition-transform ${
            isOutOfStock && !isPreorder ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
            showPreorderButton ? 'bg-orange-600 text-white' :
            'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
          }`}>
          {hasTiers && isInCart ? t('Update') : showPreorderButton ? t('Add Pre-order') : t('Add to Cart')}
        </button>
        <Link to="/checkout" onClick={() => !(isOutOfStock && !isPreorder) && handleAddToCart()}
          className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-center active:scale-95 transition-transform flex items-center justify-center ${isOutOfStock && !isPreorder ? 'bg-gray-300 text-gray-500 pointer-events-none' : 'bg-orange-600 text-white'}`}>
          {showPreorderButton ? t('Pre-Order & Buy') : t('Buy Now')}
        </Link>
      </div>
    </div>
  );
    </>
  );
}