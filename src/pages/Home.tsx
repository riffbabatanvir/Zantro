import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../ProductContext';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { products } = useProducts();
  const featuredProducts = products.filter(p => !p.isPreowned && p.category !== 'Pre-Owned').slice(0, 8);
  const flashSaleProducts = products.filter(p => p.isFlashSale);
const [flashSaleEnabled, setFlashSaleEnabled] = useState(true);

useEffect(() => {
  fetch('/api/settings/flashsale')
    .then(r => r.json())
    .then(data => setFlashSaleEnabled(data.enabled))
    .catch(() => {});
}, []);

  // Countdown Logic — persists end time in localStorage so it survives page reloads
  const SALE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

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
        // Reset for another 24h
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
        <title>Zantro — Online Shop Bangladesh</title>
        <meta name="description" content="Shop the best products online at Zantro. Best deals and fast delivery across Bangladesh." />
        <meta property="og:title" content="Zantro — Online Shop Bangladesh" />
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
                  <h2 className="text-xl md:text-3xl font-black text-gray-900 italic tracking-tighter">FLASH SALE</h2>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-bold w-8 text-center">{formatTime(timeLeft.hours)}</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">:</span>
                    <span className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-bold w-8 text-center">{formatTime(timeLeft.minutes)}</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">:</span>
                    <span className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-bold w-8 text-center">{formatTime(timeLeft.seconds)}</span>
                  </div>
                </div>
                <Link to="/shop" className="text-sm font-bold text-orange-500 flex items-center gap-1">
                  View All <ArrowRight size={16} />
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

      {/* Featured Products - 2 Column Mobile Grid */}
      <section className="py-8 md:py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Recommended For You</h2>
            <Link to="/shop" className="text-sm font-bold text-gray-400 hover:text-orange-500">View More</Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
