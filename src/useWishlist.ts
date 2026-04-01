import { useState, useCallback } from 'react';

const KEY = 'zantro_wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });

  const toggle = useCallback((id: string) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isWishlisted = (id: string) => wishlist.includes(id);
  return { wishlist, toggle, isWishlisted };
}
