import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Product, CartItem } from './types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product & { selectedSize?: string; selectedColor?: string }, quantity?: number) => void;
  removeFromCart: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('zantro_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('zantro_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product & { selectedSize?: string; selectedColor?: string }, quantity: number = 1) => {
    // Block mixing preorder and regular items
    const cartHasPreorder = cart.some((item) => (item as any).isPreorder);
    const cartHasRegular = cart.some((item) => !(item as any).isPreorder);
    const addingPreorder = !!(product as any).isPreorder;

    if (addingPreorder && cartHasRegular) {
      toast.error('Cannot mix Pre-Order & regular items. Please checkout or clear your cart first.', { duration: 4000 });
      return;
    }
    if (!addingPreorder && cartHasPreorder) {
      toast.error('Cannot mix regular & Pre-Order items. Please checkout or clear your cart first.', { duration: 4000 });
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) =>
        item.id === product.id &&
        (item as any).selectedSize === (product as any).selectedSize &&
        (item as any).selectedColor === (product as any).selectedColor
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id &&
          (item as any).selectedSize === (product as any).selectedSize &&
          (item as any).selectedColor === (product as any).selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity, preorderMinQty: (product as any).preorderMinQty || 1 }];
    });
    toast.success('Added to cart', {
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart')
      }
    });
  };

  const removeFromCart = (productId: string, selectedSize?: string, selectedColor?: string) => {
    setCart((prevCart) => prevCart.filter((item) =>
      !(item.id === productId &&
        (selectedSize === undefined || (item as any).selectedSize === selectedSize) &&
        (selectedColor === undefined || (item as any).selectedColor === selectedColor))
    ));
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
    const newQuantity = Math.max(1, Math.min(20, quantity));
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId &&
        (selectedSize === undefined || (item as any).selectedSize === selectedSize) &&
        (selectedColor === undefined || (item as any).selectedColor === selectedColor)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
