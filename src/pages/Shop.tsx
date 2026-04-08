import { useState, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../ProductContext';
import { useCategoryImages } from '../useCategoryImages';
import { X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Shop() {
  const { products } = useProducts();
  const { t } = useLanguage();
  const { categories } = useCategoryImages();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('q') || '';

  // Price range state
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');
  const [appliedMin, setAppliedMin] = useState<number | null>(null);
  const [appliedMax, setAppliedMax] = useState<number | null>(null);

  // Sort state
  const [sortBy, setSortBy] = useState('Popularity');

  const applyPriceFilter = () => {
    setAppliedMin(minInput !== '' ? Number(minInput) : null);
    setAppliedMax(maxInput !== '' ? Number(maxInput) : null);
  };

  const clearPriceFilter = () => {
    setMinInput('');
    setMaxInput('');
    setAppliedMin(null);
    setAppliedMax(null);
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMin = appliedMin === null || product.price >= appliedMin;
      const matchesMax = appliedMax === null || product.price <= appliedMax;
      return matchesCategory && matchesSearch && matchesMin && matchesMax;
    });

    // Sort
    switch (sortBy) {
      case 'Price: Low to High':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'Top Rated':
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Newest':
        result = [...result].reverse();
        break;
      default:
        // Popularity — sort by soldCount descending
        result = [...result].sort((a, b) => ((b as any).soldCount || 0) - ((a as any).soldCount || 0));
    }

    return result;
  }, [products, categoryFilter, searchQuery, appliedMin, appliedMax, sortBy]);

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams);
  };


  const setCategory = (name: string) =>
    setSearchParams(name === 'All' ? {} : { category: name });

  const priceFilterActive = appliedMin !== null || appliedMax !== null;

  return (
    <>
    <Helmet>
      <title>Shop All Products — Zantro</title>
      <meta name="description" content="Browse all products at Zantro. Find the best deals on a wide range of items with fast delivery across Bangladesh." />
      <meta property="og:title" content="Shop All Products — Zantro" />
      <meta property="og:url" content="https://zantrobd.com/shop" />
    </Helmet>
    <div className="bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row min-h-screen">

          {/* ── Sidebar ── */}
          <aside className="w-full md:w-64 bg-white dark:bg-neutral-950 border-b md:border-r border-gray-100 dark:border-neutral-800 shrink-0">
            <div className="sticky top-16 md:top-32 p-4 md:p-6">
              <h3 className="hidden md:block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Categories</h3>

              {/* Mobile: horizontal scroll flat list */}
              <div className="flex md:hidden gap-2 overflow-x-auto pb-3 scrollbar-hide snap-x">
                <button
                  onClick={() => setCategory('All')}
                  className={cn('snap-start shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                    categoryFilter === 'All' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-orange-100/50 text-orange-700 dark:text-orange-300 hover:bg-orange-100')}
                >{ t('All')}</button>/button>
                {categories.map(cat => (
                  <button key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={cn('snap-start shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                      categoryFilter === cat.name ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-orange-100/50 text-orange-700 dark:text-orange-300 hover:bg-orange-100')}
                  >{cat.name}</button>
                ))}
              </div>

              {/* Desktop: flat dynamic list from DB */}
              <div className="hidden md:flex flex-col gap-1">
                <button
                  onClick={() => setCategory('All')}
                  className={cn('px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left',
                    categoryFilter === 'All' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600')}
                >{ t('All Products')}</button>
                {categories.map(cat => (
                  <button key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={cn('px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left',
                      categoryFilter === cat.name ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600')}
                  >{cat.name}</button>
                ))}
              </div>

              {/* Price Range — desktop only */}
              <div className="mt-8 hidden md:block">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{ t('Price Range') } (৳)</h3>
                  {priceFilterActive && (
                    <button onClick={clearPriceFilter} className="text-[10px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                      <X size={10} /> {t('Clear')}
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="Min" min="0" value={minInput}
                      onChange={e => setMinInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyPriceFilter()}
                      className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-lg p-2 text-xs outline-none focus:border-orange-500 transition-colors"
                    />
                    <input
                      type="number" placeholder="Max" min="0" value={maxInput}
                      onChange={e => setMaxInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyPriceFilter()}
                      className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-lg p-2 text-xs outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  {priceFilterActive && (
                    <p className="text-[10px] text-orange-500 font-bold">
                      Filtering: {appliedMin !== null ? `৳${appliedMin}` : '৳0'} — {appliedMax !== null ? `৳${appliedMax}` : 'any'}
                    </p>
                  )}
                  <button
                    onClick={applyPriceFilter}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-2 rounded-lg text-xs font-bold hover:bg-black dark:hover:bg-gray-100 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <main className="flex-1 p-4 md:p-8">
            <div className="flex flex-col mb-6 gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {categoryFilter === 'All' ? t('Everything') : categoryFilter}
                  <span className="ml-2 text-sm font-medium text-gray-400">({filteredProducts.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option>Popularity</option>
                    <option>Newest</option>
                    <option>{t('Top Rated')}</option>
                    <option>{t('Price: Low to High')}</option>
                    <option>{t('Price: High to Low')}</option>
                  </select>
                </div>
              </div>

              {searchQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    { t('Showing results for') } "<span className="font-bold text-gray-900">{searchQuery}</span>"
                  </span>
                  <button onClick={clearSearch} className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
                    <X size={12} /> Clear
                  </button>
                </div>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-white dark:bg-neutral-950 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-700">
                <p className="text-sm text-gray-400 font-bold italic uppercase tracking-widest">{ t('No products found')}</p>
                {priceFilterActive && (
                  <button onClick={clearPriceFilter} className="mt-4 text-xs font-bold text-orange-500 hover:underline">
                    Clear price filter
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    </>
  );
}
