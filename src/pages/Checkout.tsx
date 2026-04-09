import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Bitcoin, CheckCircle2, ChevronLeft, Lock, Minus, Plus, Trash2, Copy, Banknote, Tag, X, Landmark, Building2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../LanguageContext';

type PaymentMethod = 'card' | 'bkash' | 'nagad' | 'crypto' | 'cod' | 'bank';

export default function Checkout() {
  const { cart, totalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [region, setRegion] = useState('patuakhali');
  const [formData, setFormData] = useState({
    fullName: '', email: '', address: '', phone: '',
    cardNumber: '', cardExpiry: '', cardCvc: '', cardName: ''
  });

  // Preorder detection
  const isPreorderCart = cart.some((item) => (item as any).isPreorder);

  // Preorder payment option: '100' = full, '50' = half advance
  const [preorderPayOption, setPreorderPayOption] = useState<'100' | '50'>('100');
  const [selectedBank, setSelectedBank] = useState<string>('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const shippingCost = (region === 'outside' && paymentMethod !== 'cod') ? 120 : 0;
  const couponDiscount = appliedCoupon ? Math.round(totalPrice * appliedCoupon.discount / 100) : 0;
  const baseTotal = totalPrice + shippingCost - couponDiscount;
  const finalTotal = isPreorderCart && preorderPayOption === '50'
    ? Math.round(baseTotal * 0.5)
    : baseTotal;
  const remainingAmount = isPreorderCart && preorderPayOption === '50'
    ? baseTotal - finalTotal
    : 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon(data);
        toast.success(`Coupon applied! ${data.discount}% off`);
        setCouponInput('');
      } else {
        toast.error('Invalid or inactive coupon code');
      }
    } catch {
      toast.error('Failed to validate coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const [paymentSettings, setPaymentSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings/payment')
      .then(r => r.json())
      .then(data => setPaymentSettings(data))
      .catch(() => {});
  }, []);

  const bkashNumber = paymentSettings?.bkashNumber || '01922929033';
  const nagadNumber = paymentSettings?.nagadNumber || '01922929033';
  const bkashQr = paymentSettings?.bkashQr || 'https://res.cloudinary.com/di4byoc2w/image/upload/v1774930027/Image_20260331100303_170_72_ixlgcn.jpg';
  const codEnabled = paymentSettings?.codEnabled !== false;
  const codDisabledForPreorder = paymentSettings?.codDisabledForPreorder !== false;

  const cardEnabled = paymentSettings?.cardEnabled !== false;
  const binancePayQr = paymentSettings?.binancePayQr || '';
  const binancePayId = paymentSettings?.binancePayId || 'riffbaba';
  const cryptoAddresses = paymentSettings?.cryptoAddresses || [
    { name: 'BTC (Bitcoin)', address: '147hzwvR68sxcJUfkMEpSRxTwd9hqNpeq7' },
    { name: 'ETH (Ethereum)', address: '0x26c8d840e121e49d9657b1e4ec04cfffe1fb2b8c' },
    { name: 'USDT (TRC20)', address: 'TXNYecJoTbgj6QeUGU8Vyjmb6y8u2Cc2rP' },
    { name: 'SOL (Solana)', address: '72ucZBSshMHfAyHXKGdUyxuoTtLGRerwDJSjupZuMVpX' }
  ];

  // Redirect to cart if cart becomes empty (e.g. user removes last item)
  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      navigate('/cart', { replace: true });
    }
  }, [cart.length, isSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'bank' && !selectedBank) {
      toast.error('Please select a bank to proceed.');
      return;
    }
    setIsProcessing(true);
    const orderData = {
      items: cart, totalPrice, shippingCost, couponDiscount,
      couponCode: appliedCoupon?.code,
      finalTotal, paymentMethod, selectedBank: paymentMethod === 'bank' ? selectedBank : undefined,
      isPreorderOrder: isPreorderCart,
      preorderPayOption: isPreorderCart ? preorderPayOption : undefined,
      preorderRemainingAmount: isPreorderCart && preorderPayOption === '50' ? remainingAmount : undefined,
      customerInfo: { fullName: formData.fullName, email: formData.email, address: formData.address, region, phone: formData.phone },
      cardInfo: paymentMethod === 'card' ? { cardNumber: formData.cardNumber, expiry: formData.cardExpiry, cvc: formData.cardCvc, nameOnCard: formData.cardName } : undefined
    };
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) { const data = await res.json(); setPlacedOrderId(data.id || ''); setIsSuccess(true); clearCart(); }
      else toast.error('Failed to process order');
    } catch { toast.error('An error occurred'); }
    finally { setIsProcessing(false); }
  };

  const successRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <>
      <Helmet>
        <title>Checkout — Zantro</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div ref={successRef} className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
        <CheckCircle2 size={48} className="text-green-500 mb-6" />
        <h2 className="text-4xl font-light tracking-tight text-black dark:text-white mb-4">{t('Order Placed!')}</h2>
        <p className="text-sm text-black/40 dark:text-white/40 uppercase tracking-widest mb-6">{t('Thank you for your purchase')}</p>
        {placedOrderId && (
          <div className="mb-8 flex flex-col items-center gap-3">
            <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">{t('Your Order ID')}</p>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-3">
              <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200 select-all">#{placedOrderId.slice(-6).toUpperCase()}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(placedOrderId.slice(-6).toUpperCase()); toast.success('Order ID copied!'); }}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title="Copy Order ID"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="text-[10px] text-black/30 dark:text-white/30 text-center">{t('Use this ID to track your order')}</p>
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 max-w-xs">
              <span className="text-amber-500 text-base leading-none mt-0.5">💾</span>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Save your Order ID</strong> — screenshot or note it down so you can track your order anytime.
              </p>
            </div>
            <Link to={`/order-tracking`} className="text-[11px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 hover:underline">
              Track Order →
            </Link>
          </div>
        )}
        <Link to="/shop" className="text-[11px] font-medium uppercase tracking-[0.2em] text-black dark:text-white border-b border-black dark:border-white pb-1 hover:text-black/60 transition-all">
          Continue Shopping
        </Link>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-20 lg:pt-0">
      <div className="lg:hidden px-6 pt-8 pb-4">
        <Link to="/cart" className="text-[10px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors flex items-center gap-2 mb-4">
          {t('Back to Cart')}
        </Link>
        <h1 className="text-4xl font-light tracking-tight text-black dark:text-white">{t('Checkout')}</h1>
      </div>

      <div className="flex flex-col-reverse lg:flex-row">
        {/* Left Pane: Form */}
        <div className="flex-1 px-6 lg:px-24 py-8 lg:py-16">
          <div className="max-w-xl mx-auto lg:mx-0">
            <div className="hidden lg:block mb-12">
              <Link to="/cart" className="text-[10px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors flex items-center gap-2 mb-8">
                {t('Back to Cart')}
              </Link>
              <h1 className="text-4xl font-light tracking-tight text-black dark:text-white">{t('Checkout')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Shipping Section */}
              <section>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-6">01. {t('Shipping Information')}</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">{ t('Full Name')}</label>
                    <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">{ t('Email')}</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">{ t('Address')}</label>
                    <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">City / Region</label>
                    <select required value={region} onChange={(e) => setRegion(e.target.value)}
                      className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent cursor-pointer">
                      <option value="patuakhali" className="bg-white dark:bg-neutral-900 text-black dark:text-white">Inside Patuakhali (Free)</option>
                      <option value="outside" className="bg-white dark:bg-neutral-900 text-black dark:text-white">Outside Patuakhali (৳120)</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">{ t('Phone')}</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm" />
                  </div>
                </div>
              </section>

              {/* Payment Section */}
              <section>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-6">02. {t('Payment Method')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ...(cardEnabled ? [{ id: 'card', name: 'Card', icon: CreditCard }] : []),
                    { id: 'bkash', name: 'bKash', icon: Smartphone },
                    { id: 'nagad', name: 'Nagad', icon: Smartphone },
                    { id: 'crypto', name: 'Crypto', icon: Bitcoin },
                    ...(!codEnabled || (isPreorderCart && codDisabledForPreorder) ? [] : [{ id: 'cod', name: 'COD', icon: Banknote }]),
                    { id: 'bank', name: 'Bank', icon: Landmark }
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={`flex flex-col items-center justify-center gap-2 border py-4 rounded-xl transition-colors ${isSelected ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white'}`}>
                        <Icon size={20} />
                        <span className="text-[11px] uppercase tracking-widest">{method.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {paymentMethod === 'card' && (
                      <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <input required type="text" placeholder="Card Number" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
                        <div className="grid grid-cols-2 gap-6">
                          <input required type="text" placeholder="MM/YY" value={formData.cardExpiry} onChange={e => setFormData({...formData, cardExpiry: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
                          <input required type="text" placeholder="CVC" value={formData.cardCvc} onChange={e => setFormData({...formData, cardCvc: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
                        </div>
                        <input required type="text" placeholder="Name on Card" value={formData.cardName} onChange={e => setFormData({...formData, cardName: e.target.value})} className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
                      </motion.div>
                    )}

                    {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                      <motion.div key="mobile-money" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center justify-center p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-900 rounded-xl">
                        {paymentMethod === 'bkash' ? (
                          <>
                            <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm mb-4">
                              <img src={bkashQr} alt="bKash QR" className="w-full h-full object-contain" />
                            </div>
                            <p className="text-[11px] uppercase tracking-widest text-black/60 dark:text-white/60 text-center mb-3">Scan with bKash App to pay</p>
                            <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2">
                              <span className="text-sm font-bold text-black dark:text-white">{bkashNumber}</span>
                              <button type="button" onClick={() => copyToClipboard(bkashNumber)}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-pink-500 hover:text-pink-600 transition-colors">
                                <Copy size={12} /> Copy
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-black/60 dark:text-white/60 text-center mb-3">Send money to</p>
                            <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2">
                              <span className="text-sm font-bold text-black dark:text-white">{nagadNumber}</span>
                              <button type="button" onClick={() => copyToClipboard(nagadNumber)}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors">
                                <Copy size={12} /> Copy
                              </button>
                            </div>
                            <p className="text-[11px] uppercase tracking-widest text-black/60 dark:text-white/60 text-center mt-3">via Nagad App</p>
                          </>
                        )}
                        <p className="text-xs font-medium mt-4 text-black dark:text-white">Amount: ৳{finalTotal.toFixed(2)}</p>
                      </motion.div>
                    )}

                    {paymentMethod === 'crypto' && (
                      <motion.div key="crypto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        {cryptoAddresses.map(crypto => (
                          <div key={crypto.name} className="flex items-center justify-between p-3 border border-black/10 dark:border-white/10 rounded-lg hover:border-black/20 dark:hover:border-white/20 transition-colors">
                            <div className="overflow-hidden pr-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{crypto.name}</p>
                              <p className="text-xs text-black/60 dark:text-white/60 font-mono mt-1 truncate">{crypto.address}</p>
                            </div>
                            <button type="button" onClick={() => copyToClipboard(crypto.address)}
                              className="p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors shrink-0">
                              <Copy size={16} />
                            </button>
                          </div>
                        ))}
                        <p className="text-[10px] text-center text-black/40 dark:text-white/40 uppercase tracking-widest mt-4">
                          Send exactly ৳{finalTotal.toFixed(2)} equivalent
                        </p>

                        {/* Binance Pay */}
                        {(binancePayQr || binancePayId) && (
                          <div className="mt-4 border-t border-black/5 dark:border-white/5 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                                <span className="text-[8px] font-black text-black">B</span>
                              </div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Binance Pay</p>
                            </div>
                            {binancePayQr && (
                              <div className="flex justify-center mb-3">
                                <div className="w-40 h-40 bg-white p-2 rounded-lg shadow-sm border border-black/5">
                                  <img src={binancePayQr} alt="Binance Pay QR" className="w-full h-full object-contain" />
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between p-3 border border-yellow-400/30 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-lg">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Pay ID</p>
                                <p className="text-xs text-black/60 dark:text-white/60 font-mono mt-0.5">{binancePayId}</p>
                              </div>
                              <button type="button" onClick={() => copyToClipboard(binancePayId)}
                                className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-md transition-colors shrink-0">
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {paymentMethod === 'cod' && (
                      <motion.div key="cod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center justify-center p-8 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-900 rounded-xl">
                        <Banknote size={48} className="text-black/20 dark:text-white/20 mb-4" />
                        <p className="text-[11px] uppercase tracking-widest text-black/60 dark:text-white/60 text-center">Pay with cash upon delivery</p>
                        <p className="text-xs font-medium mt-2 text-black dark:text-white">Amount: ৳{finalTotal.toFixed(2)}</p>
                      </motion.div>
                    )}

                    {paymentMethod === 'bank' && (
                      <motion.div key="bank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="p-6 border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-900 rounded-xl space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 size={20} className="text-black/40 dark:text-white/40" />
                          <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">Select Your Bank</p>
                        </div>
                        {[
                          { id: 'pubali', name: 'Pubali Bank', sub: 'Pubali Bank Limited' },
                          { id: 'mtb', name: 'Mutual Trust Bank', sub: 'MTB Limited' },
                          { id: 'npsb', name: 'NPSB', sub: 'Any Bank via NPSB' },
                        ].map(bank => (
                          <button key={bank.id} type="button" onClick={() => setSelectedBank(bank.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left ${selectedBank === bank.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'}`}>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedBank === bank.id ? 'border-orange-500' : 'border-black/30 dark:border-white/30'}`}>
                              {selectedBank === bank.id && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${selectedBank === bank.id ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'}`}>{bank.name}</p>
                              <p className="text-[10px] text-black/40 dark:text-white/40 mt-0.5">{bank.sub}</p>
                            </div>
                          </button>
                        ))}
                        {selectedBank && (
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-1">Next Steps</p>
                            <p className="text-xs text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                              Once your order is placed, our team will reach out to you via SMS or email with the complete bank transfer details. Please ensure your payment is completed within 24 hours to confirm your order.
                            </p>
                          </motion.div>
                        )}
                        {!selectedBank && (
                          <p className="text-[10px] text-center text-black/30 dark:text-white/30 uppercase tracking-widest pt-1">Please select a bank to proceed</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Pre-Order Payment Option */}
              {isPreorderCart && (
                <section>
                  <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-2">03. Pre-Order Payment</h2>
                  <p className="text-[11px] text-black/40 dark:text-white/40 mb-4">Since this is a pre-order, choose how much you'd like to pay now. The remaining balance is due before shipment.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      { id: '100', label: 'Pay in Full', sub: '100% now', desc: 'No balance due at delivery' },
                      { id: '50',  label: '50% Advance', sub: 'Pay half now', desc: `Remaining ৳${(baseTotal - Math.round(baseTotal * 0.5)).toFixed(2)} before shipment` },
                    ] as const).map(opt => (
                      <button key={opt.id} type="button" onClick={() => setPreorderPayOption(opt.id)}
                        className={`flex flex-col items-start gap-1 border rounded-xl px-4 py-4 transition-all text-left ${preorderPayOption === opt.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${preorderPayOption === opt.id ? 'border-orange-500' : 'border-black/30 dark:border-white/30'}`}>
                            {preorderPayOption === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-widest ${preorderPayOption === opt.id ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'}`}>{opt.label}</span>
                        </div>
                        <p className="text-[10px] text-black/40 dark:text-white/40 pl-5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  {preorderPayOption === '50' && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3">
                      <span className="text-amber-500 text-sm">⚠️</span>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">You are paying <strong>50% (৳{finalTotal.toFixed(2)})</strong> now as an advance. The remaining <strong>৳{remainingAmount.toFixed(2)}</strong> must be paid before your order is shipped.</p>
                    </motion.div>
                  )}
                </section>
              )}

              {/* Coupon Section */}
              <section>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-6">{isPreorderCart ? '04' : '03'}. Coupon Code</h2>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Tag size={16} className="text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm font-black text-green-700 dark:text-green-400">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600 dark:text-green-500">{appliedCoupon.discount}% discount applied — saving ৳{couponDiscount}</p>
                      </div>
                    </div>
                    <button type="button" onClick={removeCoupon} className="p-1.5 text-green-600 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input type="text" placeholder="Enter coupon code" value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                      className="flex-1 border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent uppercase tracking-widest" />
                    <button type="button" onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 rounded-lg">
                      {isValidatingCoupon ? '...' : t('Apply')}
                    </button>
                  </div>
                )}
              </section>

              <button disabled={isProcessing}
                className="w-full bg-orange-600 text-white py-5 text-[11px] font-medium uppercase tracking-[0.3em] hover:bg-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-100 dark:shadow-none">
                {isProcessing ? t('Processing...') : t('Complete Purchase')}
              </button>
            </form>
          </div>
        </div>

        {/* Right Pane: Summary */}
        <div className="lg:w-[450px] bg-gray-50 dark:bg-neutral-900 px-6 lg:px-12 py-8 lg:py-12 border-b lg:border-b-0 lg:border-l border-black/5 dark:border-white/5">
          <div className="sticky top-24">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-black dark:text-white mb-6">{ t('Order Summary')}</h2>

            <div className="space-y-3 mb-2 max-h-[400px] overflow-y-auto pr-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-white dark:bg-neutral-950 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[10px] font-medium uppercase tracking-widest text-black dark:text-white mb-1 pr-4">{item.name}</h3>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="text-black/30 dark:text-white/30 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Show selected variants */}
                    {((item as any).selectedSize || (item as any).selectedColor) && (
                      <div className="flex gap-2 mb-1">
                        {(item as any).selectedSize && <span className="text-[9px] bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-black/60 dark:text-white/60">{(item as any).selectedSize}</span>}
                        {(item as any).selectedColor && <span className="text-[9px] bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-black/60 dark:text-white/60">{(item as any).selectedColor}</span>}
                      </div>
                    )}
                    {(item as any).selectedTierLabel && (
                      <p className="text-[9px] uppercase tracking-widest text-orange-500 font-bold mt-1">📦 {(item as any).selectedTierLabel}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-black/10 dark:border-white/10 rounded">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-[10px] font-medium">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors">
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
                <span>{t('Subtotal')}</span>
                <span className="text-black dark:text-white">৳{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40">
                <span>{t('Shipping')}</span>
                <span className="text-black dark:text-white">{shippingCost === 0 ? t('Free') : `৳${shippingCost.toFixed(2)}`}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-green-600 dark:text-green-400">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-৳{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {isPreorderCart && preorderPayOption === '50' && (
                <>
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40">
                    <span>Order Total</span>
                    <span className="text-black dark:text-white">৳{baseTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-orange-600 dark:text-orange-400">
                    <span>50% Advance Due Now</span>
                    <span>৳{finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/30 dark:text-white/30">
                    <span>Remaining (before shipment)</span>
                    <span>৳{remainingAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-black dark:text-white pt-4 border-t border-black/5 dark:border-white/5">
                <span>{isPreorderCart && preorderPayOption === '50' ? t('Pay Now') : t('Total')}</span>
                <span>৳{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
