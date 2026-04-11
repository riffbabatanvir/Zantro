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

  const slide = slides[current] || DEFAULT_SLIDES[0];
  const imgOpacity = slide.imageOpacity ?? 0.3;
  const hideText = slide.hideText === true || slide.hideText === 'true';

  // Resolve gradient to actual CSS colors for inline style
  const gradientMap: Record<string, string> = {
    'from-orange-500 to-red-600':   'linear-gradient(to right, #f97316, #dc2626)',
    'from-blue-500 to-indigo-600':  'linear-gradient(to right, #3b82f6, #4f46e5)',
    'from-purple-500 to-pink-600':  'linear-gradient(to right, #a855f7, #db2777)',
    'from-green-500 to-teal-600':   'linear-gradient(to right, #22c55e, #0d9488)',
    'from-rose-500 to-orange-500':  'linear-gradient(to right, #f43f5e, #f97316)',
    'from-indigo-500 to-purple-600':'linear-gradient(to right, #6366f1, #9333ea)',
  };
  const bgGradient = gradientMap[slide.color] || gradientMap['from-orange-500 to-red-600'];

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#e5e7eb' }}
      className="h-[40vh] md:h-[60vh]">

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}
          style={{ position: 'absolute', inset: 0 }}>

          {/* Layer 0 — gradient background */}
          <div style={{ position: 'absolute', inset: 0, background: bgGradient, zIndex: 0 }} />

          {/* Layer 1 — product image at chosen opacity */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: imgOpacity }}>
            <img src={slide.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} referrerPolicy="no-referrer" />
          </div>

          {/* Layer 2 — dark scrim so text is always readable (only when text is shown) */}
          {!hideText && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(0,0,0,0.45)' }} />
          )}

          {/* Layer 3 — text content, always on top */}
          {!hideText && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'center' }}>
              <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
                <div style={{ maxWidth: '36rem', color: 'white' }}>
                  <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    {t(slide.subtitle || '')}
                  </motion.span>
                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-0.03em' }}>
                    {t(slide.title || '')}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontWeight: 500, lineHeight: 1.6 }}>
                    {slide.description}
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Link to={slide.productId ? `/product/${slide.productId}` : '/shop'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#ea580c', padding: '12px 32px', borderRadius: '999px', fontSize: '14px', fontWeight: 900, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                      {t('Shop Now')} <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next arrows — always on top */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Indicators — always on top */}
      <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '8px' }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ height: '6px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: 'white', opacity: current === i ? 1 : 0.4, width: current === i ? '32px' : '8px', transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  );
}
