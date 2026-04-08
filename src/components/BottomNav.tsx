import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { cn } from '../lib/utils';
import { useLanguage } from '../LanguageContext';

export default function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { t } = useLanguage();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: Grid },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: totalItems },
    { name: 'My Zantro', path: '/my?tab=history', icon: Heart, badge: 0 },
  ];

  const isProductPage = location.pathname.startsWith('/product/');
  if (isProductPage) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 border-t border-gray-100 dark:border-neutral-800 z-50 px-6 py-3 flex justify-between items-center">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path.split('?')[0];
        return (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 relative",
              isActive ? "text-orange-500" : "text-gray-400"
            )}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} fill={item.path === '/my' && (isActive || wishlist.length > 0) ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-medium">{t(item.name)}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
