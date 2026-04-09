import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'bn';

export const DEFAULT_TRANSLATIONS: Record<string, string> = {
  // Navbar
  'Shop All': 'সব পণ্য',
  'Categories': 'ক্যাটাগরি',
  'Pre-Order': 'প্রি-অর্ডার',
  'Search products...': 'পণ্য খুঁজুন...',
  'Recently Viewed': 'সম্প্রতি দেখা',
  'My Zantro': 'আমার জান্ট্রো',
  'Order History': 'অর্ডার ইতিহাস',
  'Wishlist': 'উইশলিস্ট',
  'Track Order': 'অর্ডার ট্র্যাক করুন',

  // Footer
  'Curated essentials for the modern lifestyle. Quality, simplicity, and purpose in every detail.':
    'আধুনিক জীবনযাত্রার জন্য বাছাই করা প্রয়োজনীয় পণ্য। প্রতিটি বিস্তারিত তথ্যে গুণমান, সরলতা এবং উদ্দেশ্য।',
  'Explore': 'অন্বেষণ করুন',
  'Contact': 'যোগাযোগ',
  'About': 'আমাদের সম্পর্কে',
  'FAQ': 'সাধারণ প্রশ্নোত্তর',
  'Social': 'সোশ্যাল',
  'All rights reserved.': 'সর্বস্বত্ব সংরক্ষিত।',
  'Privacy': 'গোপনীয়তা',
  'Terms': 'শর্তাবলী',

  // Home page
  'Recommended For You': 'আপনার জন্য প্রস্তাবিত',
  'View More': 'আরো দেখুন',
  'FLASH SALE': 'ফ্ল্যাশ সেল',
  'View All': 'সব দেখুন',
  'Shop by Category': 'ক্যাটাগরি অনুযায়ী কিনুন',
  'See All': 'সব দেখুন',

  // Hero slides
  'MEGA SALE': 'মেগা সেল',
  'NEW ARRIVALS': 'নতুন আগমন',
  'TECH ESSENTIALS': 'টেক এসেনশিয়ালস',
  'Shop Now': 'এখনই কিনুন',

  // Product Card
  'Add to Cart': 'কার্টে যোগ করুন',
  'Pre-Order Now': 'প্রি-অর্ডার করুন',
  'Out of Stock': 'স্টক নেই',
  'In Stock': 'স্টকে আছে',
  'Flash Sale': 'ফ্ল্যাশ সেল',
  'Pre-Owned': 'পূর্ব-ব্যবহৃত',
  'Off': 'ছাড়',
  'Review': 'রিভিউ',
  'Reviews': 'রিভিউ',
  'Sold': 'বিক্রিত',

  // Bottom Nav
  'Home': 'হোম',
  'Shop': 'শপ',
  'Cart': 'কার্ট',

  // Cart
  'Your Cart': 'আপনার কার্ট',
  'Your cart is empty': 'আপনার কার্ট খালি',
  'Continue Shopping': 'কেনাকাটা চালিয়ে যান',
  'Subtotal': 'সাবটোটাল',
  'Checkout': 'চেকআউট',
  'Remove': 'সরান',
  'Quantity': 'পরিমাণ',
  'Total': 'মোট',

  // Contact
  'Get in Touch': 'যোগাযোগ করুন',
  'Send Message': 'বার্তা পাঠান',
  'Name': 'নাম',
  'Email': 'ইমেইল',
  'Phone': 'ফোন',
  'Message': 'বার্তা',
  'Submit': 'জমা দিন',

  // About
  'About Us': 'আমাদের সম্পর্কে',
  'Our Story': 'আমাদের গল্প',
  'Our Mission': 'আমাদের লক্ষ্য',

  // FAQ
  'Frequently Asked Questions': 'সাধারণ জিজ্ঞাসা',

  // Order Tracking
  'Track Your Order': 'আপনার অর্ডার ট্র্যাক করুন',
  'Order ID': 'অর্ডার আইডি',
  'Track': 'ট্র্যাক করুন',
  'Order Status': 'অর্ডার স্ট্যাটাস',
  'Pending': 'অপেক্ষমান',
  'Processing': 'প্রক্রিয়াধীন',
  'Shipped': 'শিপড',
  'Delivered': 'ডেলিভারি হয়েছে',
  'Cancelled': 'বাতিল',

  // Checkout
  'Place Order': 'অর্ডার করুন',
  'Delivery Address': 'ডেলিভারি ঠিকানা',
  'Payment Method': 'পেমেন্ট পদ্ধতি',
  'Full Name': 'পুরো নাম',
  'Address': 'ঠিকানা',
  'City': 'শহর',
  'Apply Coupon': 'কুপন প্রয়োগ করুন',
  'Coupon Code': 'কুপন কোড',
  'Apply': 'প্রয়োগ করুন',
  'Order Summary': 'অর্ডার সারসংক্ষেপ',
  'Delivery Fee': 'ডেলিভারি চার্জ',
  'Discount': 'ছাড়',
  'Free': 'বিনামূল্যে',

  // Product Detail
  'Description': 'বিবরণ',
  'Size': 'সাইজ',
  'Color': 'রঙ',
  'Share': 'শেয়ার করুন',
  'Add to Wishlist': 'উইশলিস্টে যোগ করুন',
  'Related Products': 'সম্পর্কিত পণ্য',
  'Customer Reviews': 'গ্রাহক রিভিউ',
  'Write a Review': 'রিভিউ লিখুন',

  // My Zantro
  'My Orders': 'আমার অর্ডার',
  'My Wishlist': 'আমার উইশলিস্ট',
  'No orders yet': 'এখনো কোনো অর্ডার নেই',
  'No items in wishlist': 'উইশলিস্টে কোনো পণ্য নেই',

  // Pre-Order
  'Pre-Order Item': 'প্রি-অর্ডার পণ্য',
  'Expected Delivery': 'প্রত্যাশিত ডেলিভারি',

  // General
  'Loading...': 'লোড হচ্ছে...',
  'Error': 'ত্রুটি',
  'Success': 'সফল',
  'Cancel': 'বাতিল',
  'Save': 'সংরক্ষণ করুন',
  'Edit': 'সম্পাদনা করুন',
  'Delete': 'মুছুন',
  'Close': 'বন্ধ করুন',
  'Back': 'পিছনে',
  'Next': 'পরবর্তী',
  'Previous': 'আগের',
  'Search': 'খুঁজুন',
  'Filter': 'ফিল্টার',
  'Sort': 'সাজান',
  'Price': 'মূল্য',
  'Category': 'ক্যাটাগরি',
  'Brand': 'ব্র্যান্ড',
  'Rating': 'রেটিং',
  'Stock': 'স্টক',
  'Yes': 'হ্যাঁ',
  'No': 'না',
  'or': 'অথবা',
  'and': 'এবং',
  'item': 'টি পণ্য',
  'items': 'টি পণ্য',
  'Spring 2026': 'বসন্ত ২০২৬',
  'Up to 69% Off': 'সর্বোচ্চ ৬৯% ছাড়',
  'Innovation Week': 'উদ্ভাবন সপ্তাহ',


  // ProductCard misc
  'In Cart': 'কার্টে আছে',
  'sold': 'বিক্রিত',
  'Hot': 'জনপ্রিয়',
  'new': 'নতুন',

  // New translations added for full Bangla support

  // Buy / CTA buttons (new)
  'Buy Now': 'এখনই কিনুন',
  'Complete Purchase': 'অর্ডার সম্পন্ন করুন',
  'Processing...': 'প্রক্রিয়া চলছে...',
  'View Full Cart': 'পুরো কার্ট দেখুন',
  'Update Cart': 'কার্ট আপডেট করুন',
  'Add Pre-order to Cart': 'প্রি-অর্ডার কার্টে যোগ করুন',
  'Pre-Order & Checkout': 'প্রি-অর্ডার ও চেকআউট',
  'Pre-Order & Buy': 'প্রি-অর্ডার ও কিনুন',
  'Add Pre-order': 'প্রি-অর্ডার যোগ করুন',
  'Update': 'আপডেট',

  // Cart page (new)
  'Shopping Cart': 'শপিং কার্ট',
  'Your Selection': 'আপনার বাছাই',
  'Summary': 'সারসংক্ষেপ',
  'Calculated at next step': 'পরবর্তী ধাপে হিসাব হবে',
  'Taxes and shipping calculated at checkout': 'চেকআউটে কর ও শিপিং হিসাব হবে',
  'Pre-Order Notice': 'প্রি-অর্ডার নোটিশ',
  'Your cart contains pre-order item(s). These may take 1–2 months to deliver after your order is confirmed.': 'আপনার কার্টে প্রি-অর্ডার পণ্য আছে। অর্ডার নিশ্চিত হওয়ার পর ডেলিভারি ১–২ মাস সময় নিতে পারে।',

  // Checkout page (new)
  'Save your Order ID': 'আপনার অর্ডার আইডি সংরক্ষণ করুন',
  'Pay in Full': 'সম্পূর্ণ পরিশোধ',
  '100% now': '১০০% এখনই',
  'No balance due at delivery': 'ডেলিভারিতে কোনো বাকি নেই',
  '50% Advance': '৫০% অগ্রিম',
  'Pay half now': 'অর্ধেক এখনই দিন',
  'Pay Now': 'এখনই পরিশোধ করুন',
  'Order Total': 'অর্ডার মোট',
  'Enter coupon code': 'কুপন কোড লিখুন',
  'Copy Order ID': 'অর্ডার আইডি কপি করুন',
  'Order ID copied!': 'অর্ডার আইডি কপি হয়েছে!',

  // Shop page (new)
  'All Products': 'সব পণ্য',
  'All': 'সব',
  'Everything': 'সকল পণ্য',
  'Price Range': 'মূল্য পরিসর',
  'Top Rated': 'শীর্ষ রেটেড',
  'Price: Low to High': 'মূল্য: কম থেকে বেশি',
  'Price: High to Low': 'মূল্য: বেশি থেকে কম',
  'No products found': 'কোনো পণ্য পাওয়া যায়নি',
  'Clear price filter': 'মূল্য ফিল্টার সরান',
  'Clear': 'সরান',
  'Filtering': 'ফিল্টার করা হচ্ছে',
  'Showing results for': 'ফলাফল দেখানো হচ্ছে',
  'any': 'যেকোনো',

  // ProductDetail (new)
  'Share your experience with this product...': 'এই পণ্যটি নিয়ে আপনার অভিজ্ঞতা শেয়ার করুন...',


  'Select Quantity Tier': 'পরিমাণ টিয়ার বাছুন',

  // Order success screen
  'Order Placed!': 'অর্ডার সম্পন্ন হয়েছে!',
  'Thank you for your purchase': 'আপনার ক্রয়ের জন্য ধন্যবাদ',
  'Your Order ID': 'আপনার অর্ডার আইডি',
  'Use this ID to track your order': 'এই আইডি দিয়ে আপনার অর্ডার ট্র্যাক করুন',

  // Checkout form
  'Shipping Information': 'শিপিং তথ্য',
  'Back to Cart': 'কার্টে ফিরুন',
  // Language toggle
  'Switch to English': 'ইংরেজিতে পরিবর্তন করুন',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Record<string, string>;
  overrides: Record<string, string>;
  updateTranslation: (key: string, value: string) => void;
  resetTranslation: (key: string) => void;
  resetAllTranslations: () => void;
  isSyncing: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try { return (localStorage.getItem('zantro_language') as Language) || 'en'; } catch { return 'en'; }
  });

  // Server-side overrides — shared across all users
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch server overrides on mount
  useEffect(() => {
    fetch('/api/translations')
      .then(r => r.json())
      .then(data => { if (data && typeof data === 'object') setOverrides(data); })
      .catch(() => {});
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem('zantro_language', lang); } catch {}
  };

  // Merged: defaults + server overrides
  const translations: Record<string, string> = { ...DEFAULT_TRANSLATIONS, ...overrides };

  const t = (key: string): string => {
    if (language === 'en') return key;
    return translations[key] || key;
  };

  // Save the full overrides object to the server
  const saveToServer = async (newOverrides: Record<string, string>) => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ overrides: newOverrides }),
      });
    } catch (e) {
      console.error('Failed to save translations', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateTranslation = (key: string, value: string) => {
    const newOverrides = { ...overrides, [key]: value };
    setOverrides(newOverrides);
    saveToServer(newOverrides);
  };

  const resetTranslation = (key: string) => {
    const newOverrides = { ...overrides };
    delete newOverrides[key];
    setOverrides(newOverrides);
    saveToServer(newOverrides);
  };

  const resetAllTranslations = () => {
    setOverrides({});
    saveToServer({});
  };

  return (
    <LanguageContext.Provider value={{
      language, setLanguage, t, translations, overrides,
      updateTranslation, resetTranslation, resetAllTranslations, isSyncing,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
