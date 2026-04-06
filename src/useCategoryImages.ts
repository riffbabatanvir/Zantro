import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES } from './constants';

export type Category = { id: string; name: string; image: string };

// Returns live category list from DB (falls back to constants) + image overrides
export function useCategoryImages() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([...CATEGORIES]);

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
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, [fetchImages, fetchCategories]);

  return { images, categories, refetch: fetchImages };
}
