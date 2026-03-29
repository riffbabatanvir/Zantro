import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-black/5 dark:border-white/5 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="md:col-span-2">
            <Link to="/" className="text-xl font-medium tracking-[0.2em] text-black dark:text-white mb-8 block">
              ZANTRO
            </Link>
            <p className="text-sm text-black/40 dark:text-white/40 max-w-xs leading-relaxed font-light">
              Curated essentials for the modern lifestyle. Quality, simplicity, and purpose in every detail.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-black dark:text-white mb-6">Explore</h4>
            <ul className="space-y-4 text-[11px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40">
              <li><Link to="/shop" className="hover:text-black dark:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/contact" className="hover:text-black dark:text-white transition-colors">Contact</Link></li>
              <li><Link to="/admin" className="hover:text-black dark:text-white transition-colors">Admin Dashboard</Link></li>
              <li><a href="#" className="hover:text-black dark:text-white transition-colors">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-black dark:text-white mb-6">Social</h4>
            <ul className="space-y-4 text-[11px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40">
              <li><a href="#" className="hover:text-black dark:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-black dark:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-black dark:text-white transition-colors">Pinterest</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-black/5 dark:border-white/5">
          <p className="text-[10px] text-black/20 dark:text-white/20 uppercase tracking-widest">
            © 2026 Zantro. All rights reserved.
          </p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <span className="text-[10px] text-black/20 dark:text-white/20 uppercase tracking-widest">Privacy</span>
            <span className="text-[10px] text-black/20 dark:text-white/20 uppercase tracking-widest">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
