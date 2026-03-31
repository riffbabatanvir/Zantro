import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, CATEGORY_GROUPS } from '../constants';
import { useProducts } from '../ProductContext';
import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Shop() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('q') || '';
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ 'Clothing & Apparel': true });

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [products, categoryFilter, searchQuery]);

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams);
  };

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

  const setCategory = (name: string) =>
    setSearchParams(name === 'All' ? {} : { category: name });

  return (
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
                >All</button>
                {CATEGORIES.map(cat => (
                  <button key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={cn('snap-start shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                      categoryFilter === cat.name ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-orange-100/50 text-orange-700 dark:text-orange-300 hover:bg-orange-100')}
                  >{cat.name}</button>
                ))}
              </div>

              {/* Desktop: grouped collapsible list */}
              <div className="hidden md:flex flex-col gap-1">
                <button
                  onClick={() => setCategory('All')}
                  className={cn('px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left',
                    categoryFilter === 'All' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600')}
                >All Products</button>

                {CATEGORY_GROUPS.map(group => {
                  const isSingleCat = group.categories.length === 1;
                  const isOpen = openGroups[group.label] ?? false;

                  if (isSingleCat) {
                    const catName = group.categories[0];
                    const isActive = categoryFilter === catName;
                    return (
                      <button key={group.label}
                        onClick={() => setCategory(catName)}
                        className={cn('px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left',
                          isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600')}
                      >{group.label}</button>
                    );
                  }

                  // Group with sub-categories (Clothing & Apparel)
                  const anyActive = group.categories.includes(categoryFilter);
                  return (
                    <div key={group.label}>
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className={cn('w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left',
                          anyActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600')}
                      >
                        <span>{group.label}</span>
                        <ChevronDown size={14} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 flex flex-col gap-0.5 pb-1">
                              {group.categories.map(catName => (
                                <button key={catName}
                                  onClick={() => setCategory(catName)}
                                  className={cn('px-4 py-2 rounded-lg text-xs font-bold transition-all text-left',
                                    categoryFilter === catName ? 'bg-orange-600 text-white shadow-md shadow-orange-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600')}
                                >{catName}</button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 hidden md:block">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-lg p-2 text-xs outline-none focus:border-orange-500" />
                    <input type="number" placeholder="Max" className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-lg p-2 text-xs outline-none focus:border-orange-500" />
                  </div>
                  <button className="w-full bg-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors">Apply</button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <main className="flex-1 p-4 md:p-8">
            <div className="flex flex-col mb-6 gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {categoryFilter === 'All' ? 'Everything' : categoryFilter}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sort:</span>
                  <select className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer">
                    <option>Popularity</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {searchQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Showing results for "<span className="font-bold text-gray-900">{searchQuery}</span>"
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
                <p className="text-sm text-gray-400 font-bold italic uppercase tracking-widest">No products found</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
