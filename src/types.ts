export interface ProductVariant {
  type: 'size' | 'color';
  options: string[];
}

export interface CustomerReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface PreorderPriceTier {
  minQty: number;
  maxQty?: number;
  label: string;     // e.g. "1 piece", "1–9 pieces", "10+ pieces"
  price: number;     // price per unit at this tier
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  description: string;
  category: string;
  image: string;
  images?: string[];
  video?: string;
  rating: number;
  soldCount?: number;
  reviewCount?: number;
  isFlashSale?: boolean;
  isPreorder?: boolean;
  isPreowned?: boolean;
  yearsUsed?: number;
  percentNew?: number;
  preorderPriceTiers?: PreorderPriceTier[];   // bulk pricing for preorder
  stock?: number;
  variants?: ProductVariant[];
  customerReviews?: CustomerReview[];
  reviews: Review[];
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  isActive: boolean;
  usageCount?: number;
}
