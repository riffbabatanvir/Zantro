import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES } from './constants';
import type { Category } from './types';

export type { Category };

// Returns categories filtered for the public storefront: categories marked
// isHidden are removed entirely, and isSensitive categories are pushed to
// the bottom of the list (but still shown, unless also hidden).
export function getStorefrontCategories(categories: Category[]): Category[] {
  const visible = categories.filter(c => !c.isHidden);
  const normal = visible.filter(c => !c.isSensitive);
  const sensitive = visible.filter(c => c.isSensitive);
  return [...normal, ...sensitive];
}

// Returns live category list from DB (falls back to constants) + image overrides
export function useCategoryImages() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setImages(await res.json());
    } catch {}
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/category-list');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
        else setCategories([...CATEGORIES]); // fallback if null
      } else {
        setCategories([...CATEGORIES]);
      }
    } catch {
      setCategories([...CATEGORIES]);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchImages(), fetchCategories()]).finally(() => setIsLoading(false));
  }, [fetchImages, fetchCategories]);

  return { images, categories, isLoading, refetch: fetchImages };
}
