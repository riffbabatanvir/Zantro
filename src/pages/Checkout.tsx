import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { CreditCard, Smartphone, Bitcoin, CheckCircle2, ChevronLeft, Lock, Minus, Plus, Trash2, Copy, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'bkash' | 'nagad' | 'crypto' | 'cod';

export default function Checkout() {
  const { cart, totalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [region, setRegion] = useState('patuakhali');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: ''
  });

  const shippingCost = (region === 'outside' && paymentMethod !== 'cod') ? 120 : 0;
  const finalTotal = totalPrice + shippingCost;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard');
  };

  const cryptoAddresses = [
    { name: 'BTC (Bitcoin)', address: '147hzwvR68sxcJUfkMEpSRxTwd9hqNpeq7' },
    { name: 'ETH (Ethereum)', address: '0x26c8d840e121e49d9657b1e4ec04cfffe1fb2b8c' },
    { name: 'USDT (TRC20)', address: 'TXNYecJoTbgj6QeUGU8Vyjmb6y8u2Cc2rP' },
    { name: 'SOL (Solana)', address: '72ucZBSshMHfAyHXKGdUyxuoTtLGRerwDJSjupZuMVpX' }
  ];

  if (cart.length === 0 && !isSuccess) {
    return <Navigate to="/cart" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderData = {
      items: cart,
      totalPrice,
      shippingCost,
      finalTotal,
      paymentMethod,
      customerInfo: {
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        region,
        phone: formData.phone
      },
      cardInfo: paymentMethod === 'card' ? {
        cardNumber: formData.cardNumber,
        expiry: formData.cardExpiry,
        cvc: formData.cardCvc,
        nameOnCard: formData.cardName
      } : undefined
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (res.ok) {
        setIsSuccess(true);
        clearCart();
      } else {
        toast.error('Failed to process order');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
        <h2 className="text-4xl font-light tracking-tight text-black dark:text-white mb-4">Order Confirmed</h2>
        <p className="text-sm text-black/40 dark:text-white/40 uppercase tracking-widest mb-12">Thank you for your purchase</p>
        <Link 
          to="/shop" 
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-black dark:text-white border-b border-black dark:border-white pb-1 hover:text-black/60 dark:text-white/60 transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-20 lg:pt-0">
      {/* Mobile Header */}
      <div className="lg:hidden px-6 pt-8 pb-4">
        <Link to="/cart" className="text-[10px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors flex items-center gap-2 mb-4">
          <ChevronLeft size={12} /> Back to Cart
        </Link>
        <h1 className="text-4xl font-light tracking-tight text-black dark:text-white">Checkout</h1>
      </div>

      <div className="flex flex-col-reverse lg:flex-row">
        {/* Left Pane: Form */}
        <div className="flex-1 px-6 lg:px-24 py-8 lg:py-16">
          <div className="max-w-xl mx-auto lg:mx-0">
            <div className="hidden lg:block mb-12">
              <Link to="/cart" className="text-[10px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors flex items-center gap-2 mb-8">
                <ChevronLeft size={12} /> Back to Cart
              </Link>
              <h1 className="text-4xl font-light tracking-tight text-black dark:text-white">Checkout</h1>
            </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Shipping Section */}
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-6">01. Shipping Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Full Name</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Address</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">City / Region</label>
                  <select 
                    required 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent cursor-pointer"
                  >
                    <option value="patuakhali" className="bg-white dark:bg-neutral-900 text-black dark:text-white">Inside Patuakhali (Free)</option>
                    <option value="outside" className="bg-white dark:bg-neutral-900 text-black dark:text-white">Outside Patuakhali (৳120)</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" />
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-6">02. Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'card', name: 'Card', icon: CreditCard },
                  { id: 'bkash', name: 'bKash', icon: Smartphone },
                  { id: 'nagad', name: 'Nagad', icon: Smartphone },
                  { id: 'crypto', name: 'Crypto', icon: Bitcoin },
                  { id: 'cod', name: 'COD', icon: Banknote }
                ].map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button 
                      key={method.id} 
                      type="button" 
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center gap-2 border py-4 rounded-xl transition-colors ${isSelected ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white'}`}
                    >
                      <Icon size={20} className={method.id === 'bkash' && isSelected ? 'text-[#e2136e]' : method.id === 'nagad' && isSelected ? 'text-[#f37021]' : ''} />
                      <span className="text-[11px] uppercase tracking-widest">{method.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment Details */}
              <div className="mt-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  {paymentMethod === 'card' && (
                    <motion.div 
                      key="card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <input required type="text" placeholder="Card Number" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
                      <div className="grid grid-cols-2 gap-6">
                        <input required type="text" placeholder="MM/YY" value={formData.cardExpiry} onChange={e => setFormData({...formData, cardExpiry: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
                        <input required type="text" placeholder="CVC" value={formData.cardCvc} onChange={e => setFormData({...formData, cardCvc: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
                      </div>
                      <input required type="text" placeholder="Name on Card" value={formData.cardName} onChange={e => setFormData({...formData, cardName: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
                    </motion.div>
                  )}

                  {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                    <motion.div 
                      key="mobile-money"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-900 rounded-xl"
                    >
                      <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-sm mb-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${paymentMethod}_payment_dummy`} alt={`${paymentMethod} QR`} className="w-full h-full" />
                      </div>
                      <p className="text-[11px] uppercase tracking-widest text-black/60 dark:text-white/60 text-center">
                        Scan with {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} App to pay
                      </p>
                      <p className="text-xs font-medium mt-2 text-black dark:text-white">Amount: ৳{finalTotal.toFixed(2)}</p>
                    </motion.div>
                  )}

                  {paymentMethod === 'crypto' && (
                    <motion.div 
                      key="crypto"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      {cryptoAddresses.map(crypto => (
                        <div key={crypto.name} className="flex items-center justify-between p-3 border border-black/10 dark:border-white/10 rounded-lg hover:border-black/20 dark:hover:border-white/20 transition-colors">
                          <div className="overflow-hidden pr-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{crypto.name}</p>
                            <p className="text-xs text-black/60 dark:text-white/60 font-mono mt-1 truncate">{crypto.address}</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => copyToClipboard(crypto.address)} 
                            className="p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors shrink-0"
                            title="Copy address"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      ))}
                      <p className="text-[10px] text-center text-black/40 dark:text-white/40 uppercase tracking-widest mt-4">
                        Send exactly ৳{finalTotal.toFixed(2)} equivalent
                      </p>
                    </motion.div>
                  )}

                  {paymentMethod === 'cod' && (
                    <motion.div 
                      key="cod"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-900 rounded-xl"
                    >
                      <Banknote size={48} className="text-black/20 dark:text-white/20 mb-4" />
                      <p className="text-[11px] uppercase tracking-widest text-black/60 dark:text-white/60 text-center">
                        Pay with cash upon delivery
                      </p>
                      <p className="text-xs font-medium mt-2 text-black dark:text-white">Amount: ৳{finalTotal.toFixed(2)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <button 
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-5 text-[11px] font-medium uppercase tracking-[0.3em] hover:bg-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-100 dark:shadow-none"
            >
              {isProcessing ? 'Processing...' : 'Complete Purchase'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Pane: Summary */}
      <div className="lg:w-[450px] bg-gray-50 dark:bg-neutral-900 px-6 lg:px-12 py-8 lg:py-12 border-b lg:border-b-0 lg:border-l border-black/5 dark:border-white/5">
        <div className="sticky top-24">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-6">Order Summary</h2>
          
          <div className="space-y-3 mb-2 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-20 bg-white dark:bg-neutral-950 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[10px] font-medium uppercase tracking-widest text-black dark:text-white mb-1 pr-4">{item.name}</h3>
                    <button 
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-black/30 dark:text-white/30 hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-black/10 dark:border-white/10 rounded">
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="w-6 text-center text-[10px] font-medium">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <p className="text-[10px] font-medium text-black dark:text-white">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-3 border-t border-black/5 dark:border-white/5">
            <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40">
              <span>Subtotal</span>
              <span className="text-black dark:text-white">৳{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40">
              <span>Shipping</span>
              <span className="text-black dark:text-white">{shippingCost === 0 ? 'Free' : `৳${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-black dark:text-white pt-4">
              <span>Total</span>
              <span>৳{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
