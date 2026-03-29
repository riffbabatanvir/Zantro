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
}

export interface Category {
  id: string;
  name: string;
  image: string;
}
