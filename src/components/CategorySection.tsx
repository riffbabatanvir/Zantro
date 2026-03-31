import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { useCategoryImages } from '../useCategoryImages';
import { motion } from 'motion/react';

export default function CategorySection() {
  const { images } = useCategoryImages();

  return (
    <section className="py-8 md:py-20 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shop by Category</h2>
          <Link to="/shop" className="text-sm font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400">See All</Link>
        </div>

        <div className="flex md:grid md:grid-cols-5 lg:grid-cols-9 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x">
          {CATEGORIES.map((category, index) => {
            const imgSrc = images[category.id] || category.image;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="snap-start shrink-0"
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="group flex flex-col items-center gap-3 w-20 md:w-auto"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-orange-50 dark:bg-orange-950/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors flex items-center justify-center p-2">
                    <img
                      src={imgSrc}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 text-center group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight w-full line-clamp-2">
                    {category.name}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
