import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../ProductContext';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';

const LOAD_MORE_PAGE_SIZE = 20;

export default function Home() {
  const { t } = useLanguage();
  const { products, isLoading } = useProducts();
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);

  // ── Recommended (first 12, admin-controlled) ─────────────────────────────
  useEffect(() => {
    fetch('/api/settings/recommended')
      .then(r => r.json())
      .then(ids => { if (Array.isArray(ids) && ids.length > 0) setRecommendedIds(ids); })
      .catch(() => {});
  }, []);

  // The top 12 recommended products shown first
  const featuredProducts = recommendedIds.length > 0
    ? recommendedIds.slice(0, 12).map(id => products.find(p => p.id === id)).filter(Boolean) as typeof products
    : products.filter(p => !p.isPreowned && p.category !== 'Pre-Owned').slice(0, 12);

  // ── Load More state ───────────────────────────────────────────────────────
  const [extraProducts, setExtraProducts] = useState<typeof products>([]);
  const [loadMoreSkip, setLoadMoreSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      // Exclude the recommended IDs so we don't show duplicates
      const excludeParam = featuredProducts.map(p => p.id).join(',');
      const url = `/api/products/browse?skip=${loadMoreSkip}&limit=${LOAD_MORE_PAGE_SIZE}&excludeIds=${encodeURIComponent(excludeParam)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setExtraProducts(prev => [...prev, ...data.products]);
        const newSkip = loadMoreSkip + data.products.length;
        setLoadMoreSkip(newSkip);
        // If we received fewer than the limit, there are no more pages
        if (data.products.length < LOAD_MORE_PAGE_SIZE || newSkip >= data.total) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      // silently fail — user can try again
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, loadMoreSkip, featuredProducts]);

  // ── Flash Sale ────────────────────────────────────────────────────────────
  const flashSaleProducts = products.filter(p => p.isFlashSale);
  const [flashSaleEnabled, setFlashSaleEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/settings/flashsale')
      .then(r => r.json())
      .then(data => setFlashSaleEnabled(data.enabled))
      .catch(() => {});
  }, []);

  // ── Countdown ─────────────────────────────────────────────────────────────
  const SALE_DURATION_MS = 24 * 60 * 60 * 1000;

  const getSaleEndTime = () => {
    try {
      const stored = localStorage.getItem('zantro_flash_sale_end');
      if (stored) {
        const end = Number(stored);
        if (end > Date.now()) return end;
      }
    } catch {}
    const end = Date.now() + SALE_DURATION_MS;
    try { localStorage.setItem('zantro_flash_sale_end', String(end)); } catch {}
    return end;
  };

  const calcTimeLeft = (endTime: number) => {
    const diff = Math.max(0, endTime - Date.now());
    return {
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const [saleEndTime] = useState(getSaleEndTime);
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(saleEndTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const left = calcTimeLeft(saleEndTime);
      setTimeLeft(left);
      if (left.hours === 0 && left.minutes === 0 && left.seconds === 0) {
        const newEnd = Date.now() + SALE_DURATION_MS;
        try { localStorage.setItem('zantro_flash_sale_end', String(newEnd)); } catch {}
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [saleEndTime]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <>
      <Helmet>
        <title>Zantro | Bangladesh's Favourite Online Shop — Fashion, Gadgets & More</title>
        <meta name="description" content="Zantro is Bangladesh's go-to online shop for fashion, gadgets, home essentials & more. Free delivery in Patuakhali. Order now and get it fast!" />
        <meta property="og:title" content="Zantro | Bangladesh's Favourite Online Shop" />
        <meta property="og:description" content="Shop fashion, gadgets, home essentials & more at Zantro. Free delivery in Patuakhali. Best prices guaranteed!" />
        <meta property="og:url" content="https://zantrobd.com" />
      </Helmet>

      <div className="bg-transparent">
        <Hero />

        <CategorySection />

        {/* Flash Sale Section */}
        {flashSaleEnabled && flashSaleProducts.length > 0 && (
          <section className="py-8 md:py-16">
            <div className="max-w-7xl mx-auto px-4 lg:px-12">
              <div className="bg-white dark:bg-neutral-950 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none border border-orange-100 dark:border-orange-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-950/30 rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl md:text-3xl font-black text-gray-900 italic tracking-tighter">{t('FLASH SALE')}</h2>
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-bold w-8 text-center">{formatTime(timeLeft.hours)}</span>
                        <span className="text-orange-600 dark:text-orange-400 font-bold">:</span>
                        <span className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-bold w-8 text-center">{formatTime(timeLeft.minutes)}</span>
                        <span className="text-orange-600 dark:text-orange-400 font-bold">:</span>
                        <span className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-bold w-8 text-center">{formatTime(timeLeft.seconds)}</span>
                      </div>
                    </div>
                    <Link to="/shop" className="text-sm font-bold text-orange-500 flex items-center gap-1">
                      {t('View All')} <ArrowRight size={16} />
                    </Link>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {flashSaleProducts.map((product) => (
                      <div key={product.id} className="w-40 md:w-56 shrink-0 snap-start">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recommended For You — top 12 (admin-controlled) */}
        <section className="py-8 md:py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('Recommended For You')}</h2>
              <Link to="/shop" className="text-sm font-bold text-gray-400 hover:text-orange-500">{t('View More')}</Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 animate-pulse">
                      <div className="aspect-square bg-gray-200 dark:bg-neutral-800" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                : featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
              }
            </div>

            {/* Extra products loaded via Load More */}
            {extraProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 mt-3 md:mt-8"
              >
                {extraProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}

            {/* Load More button */}
            {!isLoading && hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t('Loading...')}
                    </>
                  ) : (
                    t('Load More')
                  )}
                </button>
              </div>
            )}

            {/* End of products message */}
            {!isLoading && !hasMore && extraProducts.length > 0 && (
              <div className="flex flex-col items-center mt-10 gap-3">
                <p className="text-sm text-gray-400 dark:text-gray-500">{t("You've seen all products")}</p>
                <Link to="/shop" className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                  {t('Browse Shop')} <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
