import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, X, Search, MoreHorizontal, Sun, Moon, Clock, Heart, Package, MapPin } from 'lucide-react';
import { useState, useEffect, FormEvent, useRef } from 'react';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useTheme } from '../ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../ProductContext';
import { useLanguage } from '../LanguageContext';

export default function Navbar({ onCartClick }: { onCartClick?: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [myZantroOpen, setMyZantroOpen] = useState(false);
  const myZantroRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const tracking = language === 'bn' ? 'tracking-normal' : 'tracking-widest';
  const { products } = useProducts();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Load recently viewed from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(stored);
    } catch {}
  }, [showSuggestions]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close My Zantro dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (myZantroRef.current && !myZantroRef.current.contains(e.target as Node)) {
        setMyZantroOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setShowSuggestions(false);
    }
  };

  // Search suggestions - filter products by name
  const suggestions = searchQuery.trim().length >= 1
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const showDropdown = showSuggestions && (suggestions.length > 0 || (searchQuery.trim() === '' && recentlyViewed.length > 0));

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Categories', path: '/shop' },
    { name: 'Pre-Order', path: '/preorder' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-neutral-950 border-b border-gray-100 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">

        {/* ── Mobile layout: single row ── */}
        <div className="md:hidden flex items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-auto">
            <span className="flex items-center gap-1.5 text-xl font-black tracking-tighter text-orange-600 dark:text-orange-400">
              <img src="/favicon.png" alt="Zantro" className="h-7 w-7 object-contain" />ZANTRO
            </span>
          </Link>

          {/* Right-side icons */}
          <div className="flex items-center gap-0.5">
            {/* Search — expands on tap */}
            <div ref={searchRef} className="relative flex items-center">
              <AnimatePresence initial={false}>
                {showSuggestions ? (
                  <motion.div
                    key="search-open"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 160, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={(e) => { handleSearch(e); setShowSuggestions(false); }} className="relative">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-neutral-800 border-2 border-orange-500 rounded-full py-1.5 pl-3 pr-8 text-xs text-black dark:text-white outline-none placeholder:text-gray-400"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Search size={13} className="text-orange-500" />
                      </button>
                    </form>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Search icon button */}
              <button
                onClick={() => setShowSuggestions(v => !v)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {showSuggestions ? <X size={19} /> : <Search size={19} />}
              </button>

              {/* Dropdown results */}
              <AnimatePresence>
                {showSuggestions && (suggestions.length > 0 || (searchQuery.trim() === '' && recentlyViewed.length > 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full right-0 w-72 mt-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden z-50"
                  >
                    {suggestions.length > 0 && (
                      <div>
                        <p className={`text-[10px] uppercase ${tracking} text-gray-400 px-4 pt-3 pb-1 font-bold`}>Suggestions</p>
                        {suggestions.map(product => (
                          <Link key={product.id} to={`/product/${product.id}`}
                            onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                              <p className="text-xs text-orange-500 font-bold">৳{product.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchQuery.trim() === '' && recentlyViewed.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                          <Clock size={11} className="text-gray-400" />
                          <p className={`text-[10px] uppercase ${tracking} text-gray-400 font-bold`}>{t("Recently Viewed")}</p>
                        </div>
                        {recentlyViewed.map((item: any) => (
                          <Link key={item.id} to={`/product/${item.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-xs text-orange-500 font-bold">৳{item.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {suggestions.length === 0 && searchQuery.trim().length > 0 && (
                      <p className="px-4 py-4 text-sm text-gray-400">No products found for "{searchQuery}"</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              {isMenuOpen ? <X size={19} /> : <MoreHorizontal size={19} />}
            </button>
          </div>
        </div>

        {/* ── Desktop layout ── */}
        <div className="hidden md:flex justify-between items-center h-20">
          {/* Logo & Search Bar */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center shrink-0">
              <span className="flex items-center gap-2 text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-400">
                <img src="/favicon.png" alt="Zantro" className="h-8 w-8 object-contain mb-1" />ZANTRO
              </span>
            </Link>

            {/* Search Bar with Suggestions */}
            <div ref={searchRef} className="w-[400px] relative">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-gray-100 dark:bg-white border-2 border-transparent focus:border-orange-500 rounded-full py-2.5 px-12 text-sm text-black dark:text-black outline-none transition-all placeholder:text-gray-400"
                />
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500" />
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-orange-600 transition-colors">
                  Search
                </button>
              </form>

              {/* Desktop Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden z-50"
                  >
                    {suggestions.length > 0 && (
                      <div>
                        <p className={`text-[10px] uppercase ${tracking} text-gray-400 px-4 pt-3 pb-1 font-bold`}>Suggestions</p>
                        {suggestions.map(product => (
                          <Link key={product.id} to={`/product/${product.id}`}
                            onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                              <p className="text-xs text-orange-500 font-bold">৳{product.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchQuery.trim() === '' && recentlyViewed.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                          <Clock size={11} className="text-gray-400" />
                          <p className={`text-[10px] uppercase ${tracking} text-gray-400 font-bold`}>{t("Recently Viewed")}</p>
                        </div>
                        {recentlyViewed.map((item: any) => (
                          <Link key={item.id} to={`/product/${item.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-xs text-orange-500 font-bold">৳{item.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {suggestions.length === 0 && searchQuery.trim().length > 0 && (
                      <p className="px-4 py-4 text-sm text-gray-400">No products found for "{searchQuery}"</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-sm font-bold text-gray-600 hover:text-orange-600 dark:text-orange-400 dark:hover:text-white transition-all whitespace-nowrap">
                {t(link.name)}
              </Link>
            ))}
            <button onClick={toggleTheme} className="text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* My Zantro Dropdown */}
            <div ref={myZantroRef} className="relative">
              <button
                onClick={() => setMyZantroOpen(v => !v)}
                className={`relative group flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 px-4 py-2 rounded-full border transition-all ${myZantroOpen ? 'border-orange-400' : 'border-gray-100 dark:border-neutral-800 hover:border-orange-200'}`}
              >
                <Heart size={18} className={`transition-colors ${wishlist.length > 0 ? 'fill-orange-500 text-orange-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400'}`} />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">{t("My Zantro")}</span>
              </button>

              <AnimatePresence>
                {myZantroOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <Link to="/my" onClick={() => setMyZantroOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group/item">
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center shrink-0">
                          <Heart size={15} className={`text-red-500 ${wishlist.length > 0 ? 'fill-red-500' : ''}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white">{t("Wishlist")}</p>
                          <p className="text-[11px] text-gray-400">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
                        </div>
                      </Link>
                      <Link to="/my?tab=tracking" onClick={() => setMyZantroOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group/item">
                        <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center shrink-0">
                          <Package size={15} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white">{t("Track Order")}</p>
                          <p className="text-[11px] text-gray-400">Check order status</p>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={onCartClick} className="relative group flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 px-4 py-2 rounded-full border border-gray-100 dark:border-neutral-800 hover:border-orange-200 transition-all">
              <ShoppingCart size={18} className="text-gray-600 group-hover:text-orange-600 dark:text-gray-400 dark:group-hover:text-orange-400" />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Cart</span>
              <span className="bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{totalItems}</span>
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
                <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-bold text-gray-800 hover:text-orange-600 dark:text-orange-400 dark:hover:text-white transition-colors">
                  {t(link.name)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
