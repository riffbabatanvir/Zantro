import { useState, useEffect, useCallback } from 'react';

// Returns { categoryId: imageUrl } overrides from the DB
export function useCategoryImages() {
  const [images, setImages] = useState<Record<string, string>>({});

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setImages(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  return { images, refetch: fetchImages };
}
