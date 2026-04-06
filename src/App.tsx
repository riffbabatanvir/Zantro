import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import FloatingCart from './components/FloatingCart';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import PreOrder from './pages/PreOrder';
import { CartProvider } from './CartContext';
import { ProductProvider } from './ProductContext';
import { ThemeProvider } from './ThemeContext';
import { WishlistProvider } from './WishlistContext';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';

import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import FAQ from './pages/FAQ';
import OrderTracking from './pages/OrderTracking';
import MyZantro from './pages/MyZantro';
import CartDrawer from './components/CartDrawer';
import AnnouncementBanner from './components/AnnouncementBanner';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <HelmetProvider>
    <ThemeProvider>
      <Router>
        <ProductProvider>
          <WishlistProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen font-sans selection:bg-orange-100 dark:selection:bg-orange-900/40 selection:text-orange-600 dark:selection:text-orange-400 bg-orange-50/30 dark:bg-neutral-950 text-black dark:text-white transition-colors duration-300">
              <Toaster position="bottom-center" duration={2000} theme="system" />
              <AnnouncementBanner />
              <Navbar onCartClick={() => setCartOpen(true)} />
            <main className="flex-grow pt-16 md:pt-24 pb-20 md:pb-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/preorder" element={<PreOrder />} />
                <Route path="/admin" element={<AdminDashboard />} />
				<Route path="/about" element={<About />} />
				<Route path="/faq" element={<FAQ />} />
				<Route path="/order-tracking" element={<OrderTracking />} />
				<Route path="/my" element={<MyZantro />} />
              </Routes>
            </main>
            <Footer />
            <BottomNav />
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
            <FloatingCart onCartClick={() => setCartOpen(true)} />
          </div>
          </CartProvider>
          </WishlistProvider>
        </ProductProvider>
      </Router>
    </ThemeProvider>
    </HelmetProvider>
  );
}
