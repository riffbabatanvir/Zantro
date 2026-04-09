import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';

// Inline toggle — meant to be placed inside a layout element (e.g. Footer), not fixed/floating
export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const isBn = language === 'bn';

  return (
    <div className="flex items-center gap-3">
      {/* Show Bangla hint when in English, English hint when in Bangla */}
      <span className="text-[13px] text-black/50 dark:text-white/50 leading-snug text-right">
        {isBn ? 'Switch to English' : 'ভাষা পরিবর্তন করুন'}
      </span>
      <span className="text-black/20 dark:text-white/20">›</span>
      <button
        onClick={() => setLanguage(isBn ? 'en' : 'bn')}
        title={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
        className="flex items-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-black/10 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-700 rounded-full px-4 py-2 text-sm font-bold text-black/60 dark:text-white/60 hover:text-orange-600 dark:hover:text-orange-400 transition-all active:scale-95"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={language}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <span className="text-base leading-none">🇧🇩</span>
            {isBn ? (
              <>
                <span>বাংলা</span>
                <span className="opacity-40 font-normal">→ EN</span>
              </>
            ) : (
              <span>বাংলা</span>
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
