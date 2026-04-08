import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const isBn = language === 'bn';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-20 md:bottom-6 right-4 z-50"
    >
      <button
        onClick={() => setLanguage(isBn ? 'en' : 'bn')}
        title={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
        className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-orange-200 dark:border-orange-800 shadow-lg rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-black dark:text-white hover:border-orange-400 dark:hover:border-orange-500 transition-all hover:shadow-xl active:scale-95"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={language}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            {isBn ? (
              <>
                <span className="text-base leading-none">🇧🇩</span>
                <span>বাংলা</span>
                <span className="text-black/30 dark:text-white/30 font-normal">→ EN</span>
              </>
            ) : (
              <>
                <span className="text-base leading-none">🇧🇩</span>
                <span className="text-black/40 dark:text-white/40 font-normal">বাংলা</span>
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
