import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../constants';
import { useProducts } from '../ProductContext';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Shop() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("q") || "";

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    setSearchParams(newParams);
  };

  return (
    <div className="bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Sidebar Navigation - Mobile Horizontal, Desktop Vertical */}
          <aside className="w-full md:w-64 bg-white dark:bg-neutral-950 border-b md:border-r border-gray-100 dark:border-neutral-800 shrink-0">
            <div className="sticky top-16 md:top-32 p-4 md:p-6">
              <h3 className="hidden md:block text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Categories</h3>
              
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide snap-x">
                {[{ name: "All" }, ...CATEGORIES].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSearchParams(cat.name === "All" ? {} : { category: cat.name })}
                    className={cn(
                      "snap-start shrink-0 px-5 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all text-left whitespace-nowrap",
                      categoryFilter === cat.name 
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none" 
                        : "bg-orange-100/50 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
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

          {/* Product Grid */}
          <main className="flex-1 p-4 md:p-8">
            <div className="flex flex-col mb-6 gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {categoryFilter === "All" ? "Everything" : categoryFilter}
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
                  <button 
                    onClick={clearSearch}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                  >
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
