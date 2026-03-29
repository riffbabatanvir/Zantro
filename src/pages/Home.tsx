import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import { useProducts } from '../ProductContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 8);
  const flashSaleProducts = products.slice(4, 8);

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 12
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else {
            if (hours > 0) {
              hours--;
              minutes = 59;
              seconds = 59;
            } else {
              // Reset or stop
              hours = 2;
              minutes = 45;
              seconds = 12;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-transparent">
      <Hero />
      
      <CategorySection />

      {/* Flash Sale Section */}
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

      {/* Newsletter */}
      <section className="py-16 md:py-32 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/60 mb-6">Join the Club</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-10">Get 20% off your first order.</h3>
            
            <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 bg-white/10 dark:bg-neutral-950/10 border-2 border-white/20 rounded-full py-4 px-6 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-white/40"
              />
              <button 
                type="submit" 
                className="bg-white dark:bg-neutral-950 text-orange-600 dark:text-orange-400 px-8 py-4 rounded-full text-sm font-black hover:bg-orange-50 dark:bg-orange-950/30 transition-colors shadow-lg"
              >
                SUBSCRIBE
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <ReviewSection />
    </div>
  );
}
