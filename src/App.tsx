import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import { CartProvider } from './CartContext';
import { ProductProvider } from './ProductContext';
import { ThemeProvider } from './ThemeContext';
import { Toaster } from 'sonner';

import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import FAQ from './pages/FAQ';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ProductProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen font-sans selection:bg-orange-100 dark:selection:bg-orange-900/40 selection:text-orange-600 dark:selection:text-orange-400 bg-orange-50/30 dark:bg-neutral-950 text-black dark:text-white transition-colors duration-300">
              <Toaster position="bottom-center" duration={2000} theme="system" />
              <Navbar />
            <main className="flex-grow pt-32 md:pt-24 pb-20 md:pb-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminDashboard />} />
				<Route path="/about" element={<About />} />
				<Route path="/faq" element={<FAQ />} />
              </Routes>
            </main>
            <Footer />
            <BottomNav />
            <FloatingCart />
          </div>
          </CartProvider>
        </ProductProvider>
      </Router>
    </ThemeProvider>
  );
}
