// Remembers, per browser, which sensitive categories the user has chosen to
// unblur. Used by Shop.tsx and ProductDetail.tsx so the choice persists
// across refreshes and carries over when navigating into a product page.

const STORAGE_KEY = 'zantro_unblurred_categories';

function readList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isCategoryUnblurred(categoryName: string): boolean {
  if (!categoryName) return false;
  return readList().includes(categoryName);
}

export function setCategoryUnblurred(categoryName: string, unblurred: boolean): void {
  if (!categoryName) return;
  try {
    const list = readList();
    const next = unblurred
      ? Array.from(new Set([...list, categoryName]))
      : list.filter(name => name !== categoryName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (e.g. private browsing) — fail silently, blur just resets each visit
  }
}
