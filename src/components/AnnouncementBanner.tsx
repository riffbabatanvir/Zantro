import { useState } from 'react';
import { X } from 'lucide-react';
import { useAnnouncement } from '../useAnnouncement';
import { motion, AnimatePresence } from 'motion/react';

export default function AnnouncementBanner() {
  const announcement = useAnnouncement();
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        style={{ backgroundColor: announcement.bgColor || '#ea580c' }}
        className="w-full z-[60] relative"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
          <p className="text-white text-xs font-bold text-center tracking-wide">
            {announcement.text}
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-white/70 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
