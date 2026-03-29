import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, MoreHorizontal, Sun, Moon } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useCart } from '../CartContext';
import { useTheme } from '../ThemeContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Categories', path: '/shop' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-neutral-950 border-b border-gray-100 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center py-3 md:h-20 gap-4">
          {/* Logo & Search Bar */}
          <div className="flex items-center w-full md:w-auto gap-4">
            <Link to="/" className="flex items-center shrink-0">
              <span className="text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-400">ZANTRO</span>
            </Link>
            
            {/* Search Bar - Prominent like Alibaba/Taobao */}
            <form onSubmit={handleSearch} className="flex-1 md:w-[400px] relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-2 border-transparent focus:border-orange-500 rounded-full py-1.5 md:py-2.5 px-8 md:px-12 text-xs md:text-sm outline-none transition-all"
              />
              <Search size={14} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 md:block" />
              <button 
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-bold text-gray-600 hover:text-orange-600 dark:text-orange-400 transition-all"
              >
                {link.name}
              </Link>
            ))}
            <button onClick={toggleTheme} className="text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/cart" className="relative group flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 px-4 py-2 rounded-full border border-gray-100 dark:border-neutral-800 hover:border-orange-200 transition-all">
              <ShoppingCart size={18} className="text-gray-600 group-hover:text-orange-600 dark:text-gray-400 dark:group-hover:text-orange-400" />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Cart
              </span>
              <span className="bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/cart" className="relative p-1.5 text-gray-600 dark:text-gray-400">
              <ShoppingCart size={20} />
              <span className="absolute top-0.5 right-0.5 bg-orange-500 text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <MoreHorizontal size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-neutral-950 border-t border-gray-100 dark:border-neutral-800 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-bold text-gray-800 hover:text-orange-600 dark:text-orange-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
