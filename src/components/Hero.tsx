import { useLanguage } from '../LanguageContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_SLIDES = [
  { id: '1', title: 'MEGA SALE', subtitle: 'Up to 69% Off', description: 'Notebook Calculator', image: 'https://i.imgur.com/bXJQgag.jpg', color: 'from-orange-500 to-red-600' },
  { id: '2', title: 'NEW ARRIVALS', subtitle: 'Spring 2026', description: 'Jeep Spirit Waterproof Jacket - Discover the latest urban style essentials.', image: 'https://i.imgur.com/ANUDasq.jpg', color: 'from-blue-500 to-indigo-600' },
  { id: '3', title: 'TECH ESSENTIALS', subtitle: 'Innovation Week', description: '720° Adjustable Metal Stand - Transform your workspace with Zantro.', image: 'https://i.imgur.com/0DCfwPt.jpg', color: 'from-purple-500 to-pink-600' },
];

export const GRADIENT_OPTIONS = [
  { label: 'Orange → Red',    value: 'from-orange-500 to-red-600' },
  { label: 'Blue → Indigo',   value: 'from-blue-500 to-indigo-600' },
  { label: 'Purple → Pink',   value: 'from-purple-500 to-pink-600' },
  { label: 'Green → Teal',    value: 'from-green-500 to-teal-600' },
  { label: 'Rose → Orange',   value: 'from-rose-500 to-orange-500' },
  { label: 'Indigo → Purple', value: 'from-indigo-500 to-purple-600' },
];

export default function Hero() {
  const { t } = useLanguage();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/hero-slides')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setSlides(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrent(p => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent(p => (p + 1) % slides.length);

  return (
    <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="absolute inset-0">
          <div className={`w-full h-full bg-gradient-to-r ${slides[current]?.color || DEFAULT_SLIDES[0].color} flex items-center relative`}>
            <div className="absolute inset-0 opacity-30">
              <img src={slides[current]?.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full z-10">
              <div className="max-w-xl text-white">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
                  {t(slides[current]?.subtitle || '')}
                </motion.span>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-4xl md:text-7xl font-black leading-tight mb-4 tracking-tighter">
                  {t(slides[current]?.title || '')}
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-sm md:text-lg text-white/90 mb-8 font-medium">
                  {slides[current]?.description}
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Link to={slides[current]?.productId ? `/product/${slides[current].productId}` : '/shop'}
                    className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-full text-sm font-black hover:bg-orange-50 transition-all shadow-lg shadow-black/10">
                    {t('Shop Now')} <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${current === i ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}
