import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Lock, LogOut, Package, CreditCard, MapPin, Phone, Mail, User, ShoppingCart, Clock, TrendingUp, CheckCircle, Banknote, XCircle, Trash2, MessageSquare, PlusCircle, Image as ImageIcon, Tag, FileText, DollarSign, Percent, Video, Upload, Edit2, Save, Zap, Users, Globe, Monitor, Smartphone, Tablet, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '../ProductContext';
import { useCategoryImages } from '../useCategoryImages';
import { CATEGORIES } from '../constants';
import { GRADIENT_OPTIONS } from '../components/Hero';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'messages' | 'products' | 'visitors' | 'categories' | 'coupons' | 'hero' | 'announcement' | 'preorders' | 'preowned' | 'payment'>('orders');
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editProductData, setEditProductData] = useState<any>({});
  const [flashSaleEnabled, setFlashSaleEnabled] = useState(true);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<any>({
    cardEnabled: true,
    bkashNumber: '', nagadNumber: '', bkashQr: '',
    binancePayQr: '', binancePayId: '',
    codEnabled: true, codDisabledForPreorder: true,
    cryptoAddresses: [
      { name: 'BTC (Bitcoin)', address: '' },
      { name: 'ETH (Ethereum)', address: '' },
      { name: 'USDT (TRC20)', address: '' },
      { name: 'SOL (Solana)', address: '' },
    ]
  });
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  useEffect(() => {
    fetch('/api/settings/payment')
      .then(r => r.json())
      .then(data => { if (data && !data.error) setPaymentSettings((prev: any) => ({ ...prev, ...data })); })
      .catch(() => {});
  }, []);

  const handleSavePaymentSettings = async () => {
    setIsSavingPayment(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(paymentSettings),
      });
      if (res.ok) toast.success('Payment settings saved!'); else toast.error('Failed to save');
    } catch {}
    finally { setIsSavingPayment(false); }
  };


  useEffect(() => {
    fetch('/api/settings/flashsale')
      .then(r => r.json())
      .then(data => setFlashSaleEnabled(data.enabled))
      .catch(() => {});
  }, []);

  const toggleFlashSale = async () => {
    const token = localStorage.getItem('adminToken');
    const newVal = !flashSaleEnabled;
    await fetch('/api/settings/flashsale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ enabled: newVal })
    });
    setFlashSaleEnabled(newVal);
    toast.success(`Flash Sale ${newVal ? 'enabled' : 'disabled'}`);
  };

  const toggleFlashSaleProduct = async (product: any) => {
    try {
      await updateProduct(product.id, { isFlashSale: !product.isFlashSale });
      toast.success(`${product.name} ${!product.isFlashSale ? 'added to' : 'removed from'} Flash Sale`);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', discount: '', description: '',
    category: CATEGORIES[0]?.name || 'Fashion',
    image: '', rating: '', soldCount: '', reviewCount: '', stock: '',
    sizes: '', colors: '', isPreorder: false, isPreowned: false, yearsUsed: '', percentNew: ''
  });
  const [newProductPriceTiers, setNewProductPriceTiers] = useState<Array<{minQty: string; maxQty: string; label: string; price: string}>>([
    { minQty: '1', maxQty: '1', label: '1 piece', price: '' },
  ]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);


  // Pre-Owned product form state
  const [newPreowned, setNewPreowned] = useState({
    name: '', price: '', discount: '', description: '',
    category: 'Pre-Owned', image: '', rating: '', soldCount: '',
    reviewCount: '', stock: '', sizes: '', colors: '',
    yearsUsed: '', percentNew: ''
  });
  const [preownedImageFiles, setPreownedImageFiles] = useState<File[]>([]);
  const [isAddingPreowned, setIsAddingPreowned] = useState(false);
  const preownedImageInputRef = useRef<HTMLInputElement>(null);
  // Category images
  const { images: categoryImages, refetch: refetchCategoryImages } = useCategoryImages();
  // Coupons
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '' });
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);

  const fetchCoupons = async (token: string) => {
    try {
      const res = await fetch('/api/coupons', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCoupons(await res.json());
    } catch { toast.error('Failed to fetch coupons'); }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || !newCoupon.discount) return;
    setIsAddingCoupon(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: newCoupon.code.trim(), discount: Number(newCoupon.discount) }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(prev => [...prev, data]);
        setNewCoupon({ code: '', discount: '' });
        toast.success('Coupon created!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create coupon');
      }
    } catch { toast.error('Failed to create coupon'); }
    finally { setIsAddingCoupon(false); }
  };

  const handleToggleCoupon = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c));
        toast.success(`Coupon ${!isActive ? 'activated' : 'deactivated'}`);
      }
    } catch { toast.error('Failed to update coupon'); }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setCoupons(prev => prev.filter(c => c.id !== id)); toast.success('Coupon deleted'); }
    } catch { toast.error('Failed to delete coupon'); }
  };

  const [catEditId, setCatEditId] = useState<string | null>(null);
  const [manageSearch, setManageSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  // Hero Slides
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [isSavingHero, setIsSavingHero] = useState(false);

  useEffect(() => {
    fetch('/api/hero-slides').then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setHeroSlides(data); }).catch(() => {});
  }, []);

  const handleSaveHeroSlides = async () => {
    setIsSavingHero(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/hero-slides', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ slides: heroSlides }) });
      toast.success('Hero slides saved!');
    } catch { toast.error('Failed to save slides'); }
    finally { setIsSavingHero(false); }
  };

  const addHeroSlide = () => setHeroSlides(prev => [...prev, { id: Date.now().toString(), title: 'NEW SLIDE', subtitle: 'Subtitle', description: 'Description here', image: '', color: 'from-orange-500 to-red-600' }]);
  const removeHeroSlide = (id: string) => setHeroSlides(prev => prev.filter(s => s.id !== id));
  const updateHeroSlide = (id: string, field: string, value: string) => setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  // Announcement
  const [announcement, setAnnouncement] = useState({ text: '', enabled: false, bgColor: '#ea580c' });
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

  useEffect(() => {
    fetch('/api/announcement').then(r => r.json()).then(data => setAnnouncement({ text: data.text || '', enabled: !!data.enabled, bgColor: data.bgColor || '#ea580c' })).catch(() => {});
  }, []);

  const handleSaveAnnouncement = async () => {
    setIsSavingAnnouncement(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/announcement', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(announcement) });
      toast.success('Announcement saved!');
    } catch { toast.error('Failed to save'); }
    finally { setIsSavingAnnouncement(false); }
  };


  const [catUrlInput, setCatUrlInput] = useState('');
  const [catUploadFile, setCatUploadFile] = useState<File | null>(null);
  const [isSavingCat, setIsSavingCat] = useState(false);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveCategoryImage = async (categoryId: string) => {
    setIsSavingCat(true);
    try {
      const token = localStorage.getItem('adminToken');
      let finalUrl = catUrlInput;
      if (catUploadFile) {
        const formData = new FormData();
        formData.append('files', catUploadFile);
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (!res.ok) { toast.error('Upload failed'); setIsSavingCat(false); return; }
        const data = await res.json();
        finalUrl = data.urls[0];
      }
      if (!finalUrl) { toast.error('Please enter a URL or upload a file'); setIsSavingCat(false); return; }
      await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image: finalUrl }),
      });
      await refetchCategoryImages();
      toast.success('Category image updated!');
      setCatEditId(null);
      setCatUrlInput('');
      setCatUploadFile(null);
      if (catFileInputRef.current) catFileInputRef.current.value = '';
    } catch { toast.error('Failed to save'); }
    finally { setIsSavingCat(false); }
  };

  // Edit mode upload state
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const editVideoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchOrders(token);
      fetchMessages(token);
      fetchVisitors(token);
      fetchCoupons(token);
    }
  }, []);

  const fetchOrders = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setOrders(data.reverse()); }
      else handleLogout();
    } catch { toast.error('Failed to fetch orders'); }
    finally { setIsLoading(false); }
  };

  const fetchMessages = async (token: string) => {
    try {
      const res = await fetch('/api/messages', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setMessages(data.reverse()); }
    } catch { toast.error('Failed to fetch messages'); }
  };

  const fetchVisitors = async (token: string) => {
    try {
      const res = await fetch('/api/visitors', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setVisitors(data); }
    } catch { toast.error('Failed to fetch visitors'); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem('adminToken', token);
        setIsAuthenticated(true);
        fetchOrders(token);
        fetchMessages(token);
        fetchVisitors(token);
        fetchCoupons(token);
        toast.success('Logged in successfully');
      } else toast.error('Invalid credentials');
    } catch { toast.error('Login failed'); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setOrders([]); setMessages([]); setVisitors([]);
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'confirmed' })
      });
      if (res.ok) { setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o)); toast.success('Order confirmed successfully'); }
      else toast.error('Failed to confirm order');
    } catch { toast.error('An error occurred'); }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) { setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)); toast.success('Order cancelled successfully'); }
      else toast.error('Failed to cancel order');
    } catch { toast.error('An error occurred'); }
  };

  const handleSaveRemark = async (orderId: string) => {
    const remark = remarkInputs[orderId] ?? '';
    setSavingRemark(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ remark })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, remark } : o));
        toast.success('Remark saved');
      } else toast.error('Failed to save remark');
    } catch { toast.error('An error occurred'); }
    finally { setSavingRemark(null); }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) { setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o)); toast.success(`Order marked as ${status}`); }
      else toast.error('Failed to update order status');
    } catch { toast.error('An error occurred'); }
  };

  const handleMarkFullyPaid = async (orderId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fullPaid: true })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, fullPaid: true } : o));
        toast.success('Order marked as fully paid');
      } else toast.error('Failed to update order');
    } catch { toast.error('An error occurred'); }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order completely?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { setOrders(orders.filter(o => o.id !== orderId)); toast.success('Order deleted successfully'); }
      else toast.error('Failed to delete order');
    } catch { toast.error('An error occurred'); }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/messages/${messageId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { setMessages(messages.filter(m => m.id !== messageId)); toast.success('Message deleted successfully'); }
      else toast.error('Failed to delete message');
    } catch { toast.error('An error occurred'); }
  };

  const handleDeleteVisitor = async (visitorId: string) => {
    if (!window.confirm('Delete this visitor record?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/visitors/${visitorId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { setVisitors(visitors.filter(v => v.id !== visitorId)); toast.success('Visitor deleted'); }
      else toast.error('Failed to delete visitor');
    } catch { toast.error('An error occurred'); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProduct(true);
    try {
      const token = localStorage.getItem('adminToken');
      let uploadedImages: string[] = [];
      let uploadedVideo: string | undefined = undefined;

      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => formData.append('files', file));
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (res.ok) { const data = await res.json(); uploadedImages = data.urls; }
      }

      if (videoFile) {
        const formData = new FormData();
        formData.append('files', videoFile);
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (res.ok) { const data = await res.json(); uploadedVideo = data.urls[0]; }
      }

      const primaryImage = newProduct.image || uploadedImages[0] || 'https://via.placeholder.com/400';

      await addProduct({
        name: newProduct.name,
        price: Number(newProduct.price),
        discount: newProduct.discount ? Number(newProduct.discount) : undefined,
        description: newProduct.description,
        category: newProduct.category,
        image: primaryImage,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        video: uploadedVideo,
        rating: newProduct.rating ? Number(newProduct.rating) : 5,
        soldCount: newProduct.soldCount ? Number(newProduct.soldCount) : 0,
        reviewCount: newProduct.reviewCount ? Number(newProduct.reviewCount) : 0,
        stock: newProduct.stock !== '' ? Number(newProduct.stock) : undefined,
        isPreorder: newProduct.isPreorder,
        isPreowned: newProduct.isPreowned,
        yearsUsed: newProduct.isPreowned && newProduct.yearsUsed !== '' ? Number(newProduct.yearsUsed) : undefined,
        percentNew: newProduct.isPreowned && newProduct.percentNew !== '' ? Number(newProduct.percentNew) : undefined,
        preorderPriceTiers: newProduct.isPreorder
          ? newProductPriceTiers
              .filter(t => t.price && t.label)
              .map(t => ({
                minQty: Number(t.minQty) || 1,
                maxQty: t.maxQty ? Number(t.maxQty) : undefined,
                label: t.label,
                price: Number(t.price),
              }))
          : undefined,
        variants: [
          ...(newProduct.sizes.trim() ? [{ type: 'size', options: newProduct.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) }] : []),
          ...(newProduct.colors.trim() ? [{ type: 'color', options: newProduct.colors.split(',').map((s: string) => s.trim()).filter(Boolean) }] : []),
        ] as any,
      });
      toast.success('Product added successfully!');
      setNewProduct({ name: '', price: '', discount: '', description: '', category: CATEGORIES[0]?.name || 'Fashion', image: '', rating: '', soldCount: '', reviewCount: '', stock: '', sizes: '', colors: '', isPreorder: false, isPreowned: false, yearsUsed: '', percentNew: '' });
      setNewProductPriceTiers([{ minQty: '1', maxQty: '1', label: '1 piece', price: '' }]);
      setImageFiles([]); setVideoFile(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    } catch { toast.error('Failed to add product'); }
    finally { setIsAddingProduct(false); }
  };

  const handleAddPreowned = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPreowned(true);
    try {
      const token = localStorage.getItem('adminToken');
      let uploadedImages: string[] = [];
      if (preownedImageFiles.length > 0) {
        const formData = new FormData();
        preownedImageFiles.forEach(file => formData.append('files', file));
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (res.ok) { const data = await res.json(); uploadedImages = data.urls; }
      }
      const primaryImage = newPreowned.image || uploadedImages[0] || 'https://via.placeholder.com/400';
      await addProduct({
        name: newPreowned.name,
        price: Number(newPreowned.price),
        discount: newPreowned.discount ? Number(newPreowned.discount) : undefined,
        description: newPreowned.description,
        category: 'Pre-Owned',
        image: primaryImage,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        rating: newPreowned.rating ? Number(newPreowned.rating) : 5,
        soldCount: newPreowned.soldCount ? Number(newPreowned.soldCount) : 0,
        reviewCount: newPreowned.reviewCount ? Number(newPreowned.reviewCount) : 0,
        stock: newPreowned.stock !== '' ? Number(newPreowned.stock) : undefined,
        isPreowned: true,
        yearsUsed: newPreowned.yearsUsed !== '' ? Number(newPreowned.yearsUsed) : undefined,
        percentNew: newPreowned.percentNew !== '' ? Number(newPreowned.percentNew) : undefined,
        variants: [
          ...(newPreowned.sizes.trim() ? [{ type: 'size', options: newPreowned.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) }] : []),
          ...(newPreowned.colors.trim() ? [{ type: 'color', options: newPreowned.colors.split(',').map((s: string) => s.trim()).filter(Boolean) }] : []),
        ] as any,
      });
      toast.success('Pre-owned product added!');
      setNewPreowned({ name: '', price: '', discount: '', description: '', category: 'Pre-Owned', image: '', rating: '', soldCount: '', reviewCount: '', stock: '', sizes: '', colors: '', yearsUsed: '', percentNew: '' });
      setPreownedImageFiles([]);
      if (preownedImageInputRef.current) preownedImageInputRef.current.value = '';
    } catch { toast.error('Failed to add pre-owned product'); }
    finally { setIsAddingPreowned(false); }
  };

  const handleUpdateProduct = async (id: string) => {
    setIsUploadingEdit(true);
    try {
      const token = localStorage.getItem('adminToken');
      let newImageUrls: string[] = [];
      let newVideoUrl: string | undefined = undefined;

      // Upload new images if any selected
      if (editImageFiles.length > 0) {
        const formData = new FormData();
        editImageFiles.forEach(file => formData.append('files', file));
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (res.ok) { const data = await res.json(); newImageUrls = data.urls; }
        else { toast.error('Image upload failed'); setIsUploadingEdit(false); return; }
      }

      // Upload new video if selected
      if (editVideoFile) {
        const formData = new FormData();
        formData.append('files', editVideoFile);
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (res.ok) { const data = await res.json(); newVideoUrl = data.urls[0]; }
        else { toast.error('Video upload failed'); setIsUploadingEdit(false); return; }
      }

      // Merge new images with existing ones
      const mergedImages = [...(editProductData.images || []), ...newImageUrls];
      const primaryImage = mergedImages[0] || editProductData.image || '';

      await updateProduct(id, {
        name: editProductData.name,
        price: Number(editProductData.price),
        discount: editProductData.discount ? Number(editProductData.discount) : undefined,
        description: editProductData.description,
        category: editProductData.category,
        image: primaryImage,
        images: mergedImages,
        video: newVideoUrl !== undefined ? newVideoUrl : editProductData.video,
        rating: editProductData.rating ? Number(editProductData.rating) : undefined,
        soldCount: editProductData.soldCount ? Number(editProductData.soldCount) : undefined,
        reviewCount: editProductData.reviewCount ? Number(editProductData.reviewCount) : undefined,
        stock: editProductData.stock !== '' && editProductData.stock !== undefined ? Number(editProductData.stock) : undefined,
        isPreorder: editProductData.isPreorder || false,
        isPreowned: editProductData.isPreowned || false,
        yearsUsed: editProductData.isPreowned && editProductData.yearsUsed != null ? editProductData.yearsUsed : undefined,
        percentNew: editProductData.isPreowned && editProductData.percentNew != null ? editProductData.percentNew : undefined,
        preorderPriceTiers: editProductData.isPreorder
          ? (editProductData.preorderPriceTiers || [])
              .filter((t: any) => t.price && t.label)
              .map((t: any) => ({
                minQty: Number(t.minQty) || 1,
                maxQty: t.maxQty ? Number(t.maxQty) : undefined,
                label: t.label,
                price: Number(t.price),
              }))
          : undefined,
        variants: [
          ...(editProductData.sizes && editProductData.sizes.trim() ? [{ type: 'size', options: editProductData.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) }] : []),
          ...(editProductData.colors && editProductData.colors.trim() ? [{ type: 'color', options: editProductData.colors.split(',').map((s: string) => s.trim()).filter(Boolean) }] : []),
        ] as any,
      });
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      setEditImageFiles([]);
      setEditVideoFile(null);
      if (editImageInputRef.current) editImageInputRef.current.value = '';
      if (editVideoInputRef.current) editVideoInputRef.current.value = '';
    } catch { toast.error('Failed to update product'); }
    finally { setIsUploadingEdit(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try { await deleteProduct(id); toast.success('Product deleted successfully'); }
      catch { toast.error('Failed to delete product'); }
    }
  };

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});
  const [savingRemark, setSavingRemark] = useState<string | null>(null);

  const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const filteredOrders = orders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      if (dateFrom && orderDate < new Date(dateFrom)) return false;
      if (dateTo && orderDate > new Date(dateTo + 'T23:59:59')) return false;
      if (statusFilter !== 'all') {
        const s = o.status || 'pending';
        return s === statusFilter;
      }
      return true;
    })
    .sort((a, b) => {
      const ai = STATUS_ORDER.indexOf(a.status || 'pending');
      const bi = STATUS_ORDER.indexOf(b.status || 'pending');
      return ai - bi;
    });

  const exportOrdersToCSV = () => {
    const rows = [
      ['Order ID', 'Date', 'Status', 'Customer', 'Email', 'Phone', 'Address', 'Region', 'Payment', 'Items', 'Total']
    ];
    filteredOrders.forEach(o => {
      const items = o.items?.map((i: any) => `${i.name} x${i.quantity}`).join(' | ') || '';
      rows.push([
        o.id.slice(-6),
        new Date(o.createdAt).toLocaleDateString(),
        o.status || 'pending',
        o.customerInfo?.fullName || '',
        o.customerInfo?.email || '',
        o.customerInfo?.phone || '',
        o.customerInfo?.address || '',
        o.customerInfo?.region === 'patuakhali' ? 'Inside Patuakhali' : 'Outside Patuakhali',
        o.paymentMethod || '',
        items,
        o.finalTotal?.toFixed(2) || '0'
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported!');
  };

  const exportVisitorsToCSV = () => {
    const rows = [
      ['IP', 'Country', 'City', 'Device', 'Browser', 'Visits', 'First Seen', 'Last Seen', 'Last Page', 'Status']
    ];
    visitors.forEach(v => {
      rows.push([
        v.ip, v.country, v.city, v.device, v.browser,
        v.visitCount,
        new Date(v.firstSeen).toLocaleDateString(),
        new Date(v.lastSeen).toLocaleDateString(),
        v.lastPage,
        v.isOnline ? 'Online' : 'Offline'
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `visitors_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Visitors exported!');
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || !o.status).length;
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
  const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const onlineVisitors = visitors.filter(v => v.isOnline).length;
  const totalVisitors = visitors.length;

  const getDeviceIcon = (device: string) => {
    if (device === 'Mobile') return <Smartphone size={14} />;
    if (device === 'Tablet') return <Tablet size={14} />;
    return <Monitor size={14} />;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-xl border border-black/5 dark:border-white/5"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
              <Lock size={24} />
            </div>
          </div>
          <h1 className="text-2xl font-light text-center mb-8 text-black dark:text-white">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-black dark:border-white outline-none transition-colors text-sm bg-transparent" />
            </div>
            <button disabled={isLoading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 mt-6 text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50">
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 lg:px-12 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-black/10 dark:border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-black dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-black/40 dark:text-white/40 mt-1">Manage your store and messages</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg flex-wrap gap-1">
              {(['orders', 'messages', 'products', 'preowned', 'preorders', 'categories', 'coupons', 'hero', 'announcement', 'visitors', 'payment'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-[11px] font-medium uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
                  }`}>
                  {tab === 'visitors' ? `Visitors ${onlineVisitors > 0 ? `(${onlineVisitors} 🟢)` : ''}` : tab === 'categories' ? 'Categories' : tab === 'coupons' ? 'Coupons' : tab === 'hero' ? 'Hero Slides' : tab === 'announcement' ? 'Banner' : tab === 'preorders' ? '🕐 Pre-Orders' : tab === 'preowned' ? '♻️ Pre-Owned' : tab === 'payment' ? '💳 Payment' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors px-4 py-2 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50 dark:bg-red-900/10">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-black/40 dark:text-white/40"><ShoppingCart size={18} /><span className="text-[10px] uppercase tracking-widest font-medium">Total Orders</span></div>
                <p className="text-3xl font-light text-black dark:text-white">{totalOrders}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-orange-500/60 dark:text-orange-400/60"><Clock size={18} /><span className="text-[10px] uppercase tracking-widest font-medium">Pending Orders</span></div>
                <p className="text-3xl font-light text-black dark:text-white">{pendingOrders}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-green-500/60 dark:text-green-400/60"><Banknote size={18} /><span className="text-[10px] uppercase tracking-widest font-medium">Total Revenue</span></div>
                <p className="text-3xl font-light text-black dark:text-white">৳{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-blue-500/60 dark:text-blue-400/60"><TrendingUp size={18} /><span className="text-[10px] uppercase tracking-widest font-medium">Avg Order Value</span></div>
                <p className="text-3xl font-light text-black dark:text-white">৳{averageOrderValue.toFixed(2)}</p>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border ${
                    statusFilter === s
                      ? s === 'all' ? 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                      : s === 'pending' ? 'bg-orange-500 text-white border-transparent'
                      : s === 'confirmed' ? 'bg-blue-500 text-white border-transparent'
                      : s === 'shipped' ? 'bg-purple-500 text-white border-transparent'
                      : s === 'delivered' ? 'bg-green-500 text-white border-transparent'
                      : 'bg-red-500 text-white border-transparent'
                      : 'bg-white dark:bg-neutral-900 text-black/50 dark:text-white/50 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                  }`}>
                  {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => (o.status || 'pending') === s).length})`}
                </button>
              ))}
            </div>

            {/* Date Filter + Export */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 shrink-0">From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 shrink-0">To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" />
              </div>
              <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-3 py-2 text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 rounded-lg transition-colors">
                Clear
              </button>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">{filteredOrders.length} orders</span>
                <button onClick={exportOrdersToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors">
                  📥 Export Excel
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-black/40 dark:text-white/40">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20"><Package size={48} className="mx-auto text-black/20 dark:text-white/20 mb-4" /><p className="text-black/40 dark:text-white/40">{orders.length === 0 ? 'No orders found yet.' : 'No orders match the selected date range.'}</p></div>
            ) : (
              <div className="grid gap-6">
                {filteredOrders.map((order) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={order.id}
                    className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/10 px-2 py-1 rounded">Order #{order.id.slice(-6)}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                                order.status === 'confirmed' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' :
                                order.status === 'shipped' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' :
                                order.status === 'delivered' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                                order.status === 'cancelled' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' :
                                'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'}`}>
                                {order.status || 'pending'}
                              </span>
                            </div>
                            <p className="text-xs text-black/40 dark:text-white/40 mt-2">{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Total Amount</p>
                            <p className="text-lg font-medium text-black dark:text-white">৳{order.finalTotal?.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="space-y-3">
                            <h3 className="text-[11px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Customer Details</h3>
                            <div className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"><User size={16} className="mt-0.5 shrink-0 text-black/40 dark:text-white/40" /><span>{order.customerInfo?.fullName}</span></div>
                            <div className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"><Mail size={16} className="mt-0.5 shrink-0 text-black/40 dark:text-white/40" /><span>{order.customerInfo?.email}</span></div>
                            <div className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"><Phone size={16} className="mt-0.5 shrink-0 text-black/40 dark:text-white/40" /><span>{order.customerInfo?.phone}</span></div>
                            <div className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"><MapPin size={16} className="mt-0.5 shrink-0 text-black/40 dark:text-white/40" /><span>{order.customerInfo?.address}, {order.customerInfo?.region === 'patuakhali' ? 'Inside Patuakhali' : 'Outside Patuakhali'}</span></div>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-[11px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Payment Info</h3>
                            <div className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"><CreditCard size={16} className="mt-0.5 shrink-0 text-black/40 dark:text-white/40" /><span className="capitalize">{order.paymentMethod}</span></div>
                            {order.paymentMethod === 'card' && order.cardInfo && (
                              <div className="mt-2 p-3 bg-gray-50 dark:bg-neutral-950 rounded-lg border border-black/5 dark:border-white/5 text-xs font-mono space-y-1">
                                <p className="text-black/60 dark:text-white/60">Card: {order.cardInfo.cardNumber || 'N/A'}</p>
                                <p className="text-black/60 dark:text-white/60">Name: {order.cardInfo.nameOnCard}</p>
                                <p className="text-black/60 dark:text-white/60">Exp: {order.cardInfo.expiry}</p>
                              </div>
                            )}
                            {/* Remark */}
                            <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Admin Remark</p>
                              <textarea
                                rows={2}
                                placeholder="Write a note for the customer..."
                                value={remarkInputs[order.id] !== undefined ? remarkInputs[order.id] : (order.remark || '')}
                                onChange={e => setRemarkInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-black dark:text-white resize-none outline-none focus:border-orange-500 transition-colors"
                              />
                              <button
                                onClick={() => handleSaveRemark(order.id)}
                                disabled={savingRemark === order.id}
                                className="mt-1.5 w-full flex items-center justify-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 py-2 rounded-lg text-[11px] font-medium uppercase tracking-widest hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors disabled:opacity-50"
                              >
                                <Save size={12} /> {savingRemark === order.id ? 'Saving...' : 'Save Remark'}
                              </button>
                            </div>

                            {/* Status Controls */}
                            <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 space-y-2">
                              {(!order.status || order.status === 'pending') && (
                                <button onClick={() => handleConfirmOrder(order.id)}
                                  className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg text-[11px] font-medium uppercase tracking-widest hover:bg-black/80 dark:hover:bg-white/80 transition-colors">
                                  <CheckCircle size={14} /> Confirm Order
                                </button>
                              )}
                              {order.status === 'confirmed' && (
                                <button onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                  className="w-full flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 py-2.5 rounded-lg text-[11px] font-medium uppercase tracking-widest hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                                  <Truck size={14} /> Mark as Shipped
                                </button>
                              )}
                              {order.status === 'shipped' && (
                                <button onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                  className="w-full flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2.5 rounded-lg text-[11px] font-medium uppercase tracking-widest hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                  <CheckCircle size={14} /> Mark as Delivered
                                </button>
                              )}
                              {(order.status !== 'delivered' && order.status !== 'cancelled') && (
                                <button onClick={() => handleCancelOrder(order.id)}
                                  className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-2.5 rounded-lg text-[11px] font-medium uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                                  <XCircle size={14} /> Cancel Order
                                </button>
                              )}
                              <button onClick={() => handleDeleteOrder(order.id)}
                                className="w-full flex items-center justify-center gap-2 text-black/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 py-2.5 rounded-lg text-[11px] font-medium uppercase tracking-widest transition-colors">
                                <Trash2 size={14} /> Delete Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-72 bg-gray-50 dark:bg-neutral-950 p-4 rounded-xl border border-black/5 dark:border-white/5">
                        <h3 className="text-[11px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 mb-4">Ordered Items</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <div className="w-12 h-12 bg-white dark:bg-neutral-900 shrink-0 rounded overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-black dark:text-white truncate">{item.name}</p>
                                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">{item.quantity} × ৳{item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'messages' ? (
          <>
            {isLoading ? (
              <div className="text-center py-20 text-black/40 dark:text-white/40">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20"><MessageSquare size={48} className="mx-auto text-black/20 dark:text-white/20 mb-4" /><p className="text-black/40 dark:text-white/40">No messages found yet.</p></div>
            ) : (
              <div className="grid gap-6">
                {messages.map((message) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={message.id}
                    className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                          <div>
                            <h3 className="text-lg font-medium text-black dark:text-white">{message.subject || 'No Subject'}</h3>
                            <p className="text-xs text-black/40 dark:text-white/40 mt-1">{new Date(message.createdAt).toLocaleString()}</p>
                          </div>
                          <button onClick={() => handleDeleteMessage(message.id)}
                            className="flex items-center gap-2 text-black/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="space-y-3">
                            <h3 className="text-[11px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Sender Details</h3>
                            <div className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"><User size={16} className="mt-0.5 shrink-0 text-black/40 dark:text-white/40" /><span>{message.name}</span></div>
                            <div className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"><Mail size={16} className="mt-0.5 shrink-0 text-black/40 dark:text-white/40" /><a href={`mailto:${message.email}`} className="hover:underline">{message.email}</a></div>
                            <div className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"><Phone size={16} className="mt-0.5 shrink-0 text-black/40 dark:text-white/40" /><span>{message.phone || 'Not provided'}</span></div>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-[11px] font-medium uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Message Content</h3>
                            <div className="p-4 bg-gray-50 dark:bg-neutral-950 rounded-lg border border-black/5 dark:border-white/5">
                              <p className="text-sm text-black/80 dark:text-white/80 whitespace-pre-wrap">{message.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        
        ) : activeTab === 'categories' ? (
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center"><ImageIcon size={20} /></div>
                <div>
                  <h2 className="text-xl font-medium text-black dark:text-white">Category Images</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-1">Change the icon pictures shown on the home page</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map(cat => {
                  const currentImg = categoryImages[cat.id] || cat.image;
                  const isEditing = catEditId === cat.id;
                  return (
                    <div key={cat.id} className="bg-gray-50 dark:bg-neutral-950 rounded-xl border border-black/5 dark:border-white/5 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 dark:bg-orange-950/30 shrink-0">
                          <img src={currentImg} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-black dark:text-white truncate">{cat.name}</p>
                          {categoryImages[cat.id] && (
                            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Custom image</span>
                          )}
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="url"
                            placeholder="Paste image URL..."
                            value={catUrlInput}
                            onChange={e => setCatUrlInput(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500 outline-none"
                          />
                          <p className="text-[10px] text-black/30 dark:text-white/30 text-center">— or —</p>
                          <input
                            type="file" accept="image/*" ref={catEditId === cat.id ? catFileInputRef : undefined}
                            onChange={e => { if (e.target.files?.[0]) { setCatUploadFile(e.target.files[0]); setCatUrlInput(''); } }}
                            className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                          />
                          {catUploadFile && <p className="text-[10px] text-orange-500 truncate">{catUploadFile.name}</p>}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleSaveCategoryImage(cat.id)}
                              disabled={isSavingCat}
                              className="flex-1 flex items-center justify-center gap-1 bg-orange-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors disabled:opacity-50"
                            >
                              <Save size={12} /> {isSavingCat ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setCatEditId(null); setCatUrlInput(''); setCatUploadFile(null); }}
                              className="flex-1 flex items-center justify-center gap-1 bg-gray-200 dark:bg-neutral-800 text-black dark:text-white py-1.5 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors"
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setCatEditId(cat.id); setCatUrlInput(categoryImages[cat.id] || ''); setCatUploadFile(null); }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-black/40 dark:text-white/40 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border border-dashed border-black/10 dark:border-white/10"
                        >
                          <Edit2 size={12} /> Change Image
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        
        
        ) : activeTab === 'hero' ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center"><ImageIcon size={20} /></div>
                  <div>
                    <h2 className="text-lg font-medium text-black dark:text-white">Hero Slides</h2>
                    <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Edit the homepage banner slides</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addHeroSlide} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
                    <PlusCircle size={14} /> Add Slide
                  </button>
                  <button onClick={handleSaveHeroSlides} disabled={isSavingHero} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors disabled:opacity-50">
                    <Save size={14} /> {isSavingHero ? 'Saving...' : 'Save All'}
                  </button>
                </div>
              </div>
              {heroSlides.length === 0 && (
                <div className="py-12 text-center text-black/30 dark:text-white/30 text-sm">No slides yet. Click "Add Slide" to create one.</div>
              )}
              <div className="space-y-6">
                {heroSlides.map((slide, idx) => (
                  <div key={slide.id} className="p-5 bg-gray-50 dark:bg-neutral-950 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Slide {idx + 1}</span>
                      <button onClick={() => removeHeroSlide(slide.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded"><Trash2 size={14} /></button>
                    </div>
                    {/* Preview */}
                    <div className={`h-20 rounded-xl bg-gradient-to-r ${slide.color} flex items-center px-5 relative overflow-hidden`}>
                      {slide.image && <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" referrerPolicy="no-referrer" />}
                      <div className="relative z-10">
                        <p className="text-white/70 text-[9px] uppercase tracking-widest font-bold">{slide.subtitle}</p>
                        <p className="text-white font-black text-lg tracking-tight">{slide.title}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-1 block">Title</label>
                        <input value={slide.title} onChange={e => updateHeroSlide(slide.id, 'title', e.target.value)} className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none" /></div>
                      <div><label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-1 block">Subtitle</label>
                        <input value={slide.subtitle} onChange={e => updateHeroSlide(slide.id, 'subtitle', e.target.value)} className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none" /></div>
                      <div className="md:col-span-2"><label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-1 block">Description</label>
                        <input value={slide.description} onChange={e => updateHeroSlide(slide.id, 'description', e.target.value)} className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none" /></div>
                      <div className="md:col-span-2"><label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-1 block">Background Image URL</label>
                        <input value={slide.image} onChange={e => updateHeroSlide(slide.id, 'image', e.target.value)} placeholder="https://..." className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none" /></div>
                      <div className="md:col-span-2"><label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-1 block">Gradient Color</label>
                        <div className="flex flex-wrap gap-2">
                          {GRADIENT_OPTIONS.map(g => (
                            <button key={g.value} onClick={() => updateHeroSlide(slide.id, 'color', g.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all bg-gradient-to-r ${g.value} text-white ${slide.color === g.value ? 'border-black dark:border-white scale-105' : 'border-transparent'}`}>
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        ) : activeTab === 'announcement' ? (
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-black/5 dark:border-white/5">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center"><Zap size={20} /></div>
                <div>
                  <h2 className="text-lg font-medium text-black dark:text-white">Announcement Banner</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Show a dismissible banner at the top of your site</p>
                </div>
              </div>
              {/* Live preview */}
              {announcement.text && (
                <div className="rounded-xl overflow-hidden">
                  <div style={{ backgroundColor: announcement.bgColor }} className="py-2 px-4 flex items-center justify-center gap-3">
                    <p className="text-white text-xs font-bold">{announcement.text}</p>
                    <span className="text-white/60 text-xs">✕</span>
                  </div>
                  <p className="text-[10px] text-black/30 dark:text-white/30 text-center mt-1">Preview</p>
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-950 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-black dark:text-white">Show Banner</p>
                    <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Toggle the banner on/off without deleting the text</p>
                  </div>
                  <button onClick={() => setAnnouncement(a => ({ ...a, enabled: !a.enabled }))}
                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${announcement.enabled ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 dark:bg-neutral-800 text-black/40 dark:text-white/40'}`}>
                    {announcement.enabled ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Banner Text</label>
                  <input value={announcement.text} onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))}
                    placeholder="e.g. 🎉 Free shipping on all orders this weekend!"
                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Background Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={announcement.bgColor} onChange={e => setAnnouncement(a => ({ ...a, bgColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-black/10 cursor-pointer" />
                    <input value={announcement.bgColor} onChange={e => setAnnouncement(a => ({ ...a, bgColor: e.target.value }))}
                      className="flex-1 bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-orange-500 outline-none" />
                  </div>
                </div>
                <button onClick={handleSaveAnnouncement} disabled={isSavingAnnouncement}
                  className="w-full py-3 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save size={14} /> {isSavingAnnouncement ? 'Saving...' : 'Save Announcement'}
                </button>
              </div>
            </motion.div>
          </div>
        ) : activeTab === 'coupons' ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Add Coupon */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center"><Tag size={20} /></div>
                <div>
                  <h2 className="text-lg font-medium text-black dark:text-white">Create Coupon</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Add discount codes for your customers</p>
                </div>
              </div>
              <form onSubmit={handleAddCoupon} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text" required placeholder="Coupon code e.g. SAVE20"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="flex-1 bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono font-bold uppercase focus:border-orange-500 outline-none tracking-widest"
                />
                <div className="relative">
                  <input
                    type="number" required min="1" max="100" placeholder="% off"
                    value={newCoupon.discount}
                    onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    className="w-full sm:w-32 bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black/30 dark:text-white/30">%</span>
                </div>
                <button type="submit" disabled={isAddingCoupon}
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 justify-center">
                  <PlusCircle size={14} /> {isAddingCoupon ? 'Creating...' : 'Create'}
                </button>
              </form>
            </motion.div>

            {/* Coupon List */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
              {coupons.length === 0 ? (
                <div className="py-16 text-center">
                  <Tag size={36} className="mx-auto text-black/20 dark:text-white/20 mb-3" />
                  <p className="text-sm text-black/40 dark:text-white/40">No coupons yet. Create one above.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-950">
                      <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Code</th>
                      <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Discount</th>
                      <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Used</th>
                      <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(coupon => (
                      <tr key={coupon.id} className="border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-neutral-950/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-black text-sm tracking-widest text-black dark:text-white">{coupon.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-black rounded-full">
                            {coupon.discount}% OFF
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-black/50 dark:text-white/50">
                          {coupon.usageCount || 0}x
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                              coupon.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200'
                                : 'bg-gray-100 dark:bg-neutral-800 text-black/40 dark:text-white/40 hover:bg-gray-200'
                            }`}
                          >
                            {coupon.isActive ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteCoupon(coupon.id)}
                            className="p-1.5 text-black/30 dark:text-white/30 hover:text-red-500 transition-colors rounded">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </div>
        ) : activeTab === 'visitors' ? (
          <>
            {/* Visitor Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-green-500/60"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-[10px] uppercase tracking-widest font-medium">Online Now</span></div>
                <p className="text-3xl font-light text-black dark:text-white">{onlineVisitors}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-black/40 dark:text-white/40"><Users size={18} /><span className="text-[10px] uppercase tracking-widest font-medium">Total Visitors</span></div>
                <p className="text-3xl font-light text-black dark:text-white">{totalVisitors}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-blue-500/60"><Globe size={18} /><span className="text-[10px] uppercase tracking-widest font-medium">Total Visits</span></div>
                <p className="text-3xl font-light text-black dark:text-white">{visitors.reduce((sum, v) => sum + (v.visitCount || 0), 0)}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-purple-500/60"><Smartphone size={18} /><span className="text-[10px] uppercase tracking-widest font-medium">Mobile Users</span></div>
                <p className="text-3xl font-light text-black dark:text-white">{visitors.filter(v => v.device === 'Mobile').length}</p>
              </div>
            </div>

            {/* Refresh + Export buttons */}
            <div className="flex justify-end gap-3 mb-4">
              <button
                onClick={() => { const token = localStorage.getItem('adminToken'); if (token) fetchVisitors(token); }}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 rounded-lg text-xs font-medium uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                🔄 Refresh
              </button>
              <button onClick={exportVisitorsToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors">
                📥 Export Excel
              </button>
            </div>

            {visitors.length === 0 ? (
              <div className="text-center py-20">
                <Users size={48} className="mx-auto text-black/20 dark:text-white/20 mb-4" />
                <p className="text-black/40 dark:text-white/40">No visitors tracked yet. Visitors will appear here once someone visits your site.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-950">
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Status</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">IP Address</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Location</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Device</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Browser</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Visits</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Last Seen</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Last Page</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.map((visitor) => (
                        <tr key={visitor.id} className="border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-neutral-950/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${visitor.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-neutral-600'}`}></div>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${visitor.isOnline ? 'text-green-600 dark:text-green-400' : 'text-black/30 dark:text-white/30'}`}>
                                {visitor.isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-black/60 dark:text-white/60">{visitor.ip}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-black/80 dark:text-white/80">
                              <Globe size={12} className="text-black/30 dark:text-white/30" />
                              <span>{visitor.city !== 'Unknown' ? `${visitor.city}, ` : ''}{visitor.country}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-black/60 dark:text-white/60">
                              {getDeviceIcon(visitor.device)}
                              <span>{visitor.device}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-black/60 dark:text-white/60">{visitor.browser}</td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded">
                              {visitor.visitCount}x
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-black/40 dark:text-white/40">{new Date(visitor.lastSeen).toLocaleString()}</td>
                          <td className="px-4 py-3 text-xs text-black/40 dark:text-white/40 font-mono">{visitor.lastPage}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDeleteVisitor(visitor.id)}
                              className="p-1.5 text-black/30 dark:text-white/30 hover:text-red-500 transition-colors rounded">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'preowned' ? (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Pre-Owned Products List */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-lg">♻️</div>
                <div>
                  <h2 className="text-xl font-medium text-black dark:text-white">Pre-Owned Products</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Manage your used / second-hand listings</p>
                </div>
              </div>
              {products.filter((p: any) => p.isPreowned || p.category === 'Pre-Owned').length === 0 ? (
                <div className="text-center py-12 text-black/30 dark:text-white/30">
                  <div className="text-4xl mb-3">♻️</div>
                  <p className="text-sm">No pre-owned products yet. Add one below.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.filter((p: any) => p.isPreowned || p.category === 'Pre-Owned').map((product: any) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border border-black/5 dark:border-white/5 rounded-xl hover:border-amber-200 dark:hover:border-amber-800/40 transition-colors">
                      <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-lg shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black dark:text-white truncate">{product.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-black/40 dark:text-white/40">৳{product.price}</span>
                          {product.yearsUsed != null && <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Used {product.yearsUsed} {product.yearsUsed === 1 ? 'yr' : 'yrs'}</span>}
                          {product.percentNew != null && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">{product.percentNew}% new</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteProduct(product.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Add Pre-Owned Product Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-medium text-black dark:text-white mb-1">Add Pre-Owned Product</h2>
              <p className="text-xs text-black/40 dark:text-white/40 mb-6">These will appear under the Pre-Owned category and won't show in Recommended For You.</p>
              <form onSubmit={handleAddPreowned} className="space-y-6">
                {/* Name & Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Product Name</label>
                    <input type="text" required value={newPreowned.name} onChange={(e) => setNewPreowned({...newPreowned, name: e.target.value})}
                      placeholder="e.g., iPhone 13 Pro (Used)"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Price (৳)</label>
                    <input type="number" required min="0" value={newPreowned.price} onChange={(e) => setNewPreowned({...newPreowned, price: e.target.value})}
                      placeholder="e.g., 45000"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                </div>

                {/* Pre-Owned Specific Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400">⏱ Years Used <span className="normal-case text-amber-500/60">(optional — leave blank to hide)</span></label>
                    <input type="number" min="0" step="0.5" value={newPreowned.yearsUsed} onChange={(e) => setNewPreowned({...newPreowned, yearsUsed: e.target.value})}
                      placeholder="e.g., 2"
                      className="w-full bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400">✨ % New / Condition <span className="normal-case text-amber-500/60">(optional — leave blank to hide)</span></label>
                    <input type="number" min="0" max="100" value={newPreowned.percentNew} onChange={(e) => setNewPreowned({...newPreowned, percentNew: e.target.value})}
                      placeholder="e.g., 80"
                      className="w-full bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                </div>

                {/* Discount, Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Discount %</label>
                    <input type="number" min="0" max="100" value={newPreowned.discount} onChange={(e) => setNewPreowned({...newPreowned, discount: e.target.value})}
                      placeholder="e.g., 10"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Stock Quantity</label>
                    <input type="number" min="0" value={newPreowned.stock} onChange={(e) => setNewPreowned({...newPreowned, stock: e.target.value})}
                      placeholder="Leave blank = unlimited"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Rating (0–5)</label>
                    <input type="number" min="0" max="5" step="0.1" value={newPreowned.rating} onChange={(e) => setNewPreowned({...newPreowned, rating: e.target.value})}
                      placeholder="e.g., 4.2"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                </div>

                {/* Sizes & Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Sizes (comma separated)</label>
                    <input type="text" value={newPreowned.sizes} onChange={(e) => setNewPreowned({...newPreowned, sizes: e.target.value})}
                      placeholder="e.g., S, M, L"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Colors (comma separated)</label>
                    <input type="text" value={newPreowned.colors} onChange={(e) => setNewPreowned({...newPreowned, colors: e.target.value})}
                      placeholder="e.g., Black, Silver"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><ImageIcon size={12} className="inline mr-1" />Product Images</label>
                  <input type="url" value={newPreowned.image} onChange={(e) => setNewPreowned({...newPreowned, image: e.target.value})}
                    placeholder="https://example.com/image.jpg (or upload below)"
                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors mb-2" />
                  <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-amber-400 transition-colors"
                    onClick={() => preownedImageInputRef.current?.click()}>
                    <Upload size={20} className="mx-auto mb-2 text-black/20 dark:text-white/20" />
                    <p className="text-xs text-black/40 dark:text-white/40">Click to upload images</p>
                    {preownedImageFiles.length > 0 && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{preownedImageFiles.length} file(s) selected</p>}
                  </div>
                  <input ref={preownedImageInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => setPreownedImageFiles(Array.from(e.target.files || []))} />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><FileText size={12} className="inline mr-1" />Description</label>
                  <textarea required rows={4} value={newPreowned.description} onChange={(e) => setNewPreowned({...newPreowned, description: e.target.value})}
                    placeholder="Describe the item's condition, what's included, any scratches or wear, etc."
                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors resize-none" />
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                  <button type="submit" disabled={isAddingPreowned}
                    className="w-full md:w-auto px-8 py-3 bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isAddingPreowned ? 'Adding...' : '♻️ Add Pre-Owned Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : activeTab === 'preorders' ? (() => {
          const preorderOrders = orders.filter((o: any) =>
            o.items?.some((item: any) => item.isPreorder)
          );
          const pendingCount = preorderOrders.filter((o: any) => o.status === 'pending').length;
          const confirmedCount = preorderOrders.filter((o: any) => o.status === 'confirmed').length;
          const shippedCount = preorderOrders.filter((o: any) => ['shipped', 'delivered'].includes(o.status)).length;

          return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-light tracking-tight text-black dark:text-white">Pre-Order Orders</h2>
              <p className="text-sm text-black/40 dark:text-white/40 mt-1">Orders that contain at least one pre-order item — persists even after pre-order status is removed from the product</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5">
                <p className="text-[10px] uppercase tracking-widest text-orange-500 font-medium mb-1">Total Pre-Orders</p>
                <p className="text-3xl font-light text-black dark:text-white">{preorderOrders.length}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl p-5">
                <p className="text-[10px] uppercase tracking-widest text-yellow-600 dark:text-yellow-400 font-medium mb-1">Pending</p>
                <p className="text-3xl font-light text-black dark:text-white">{pendingCount}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5">
                <p className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 font-medium mb-1">Confirmed</p>
                <p className="text-3xl font-light text-black dark:text-white">{confirmedCount}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl p-5">
                <p className="text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400 font-medium mb-1">Shipped / Delivered</p>
                <p className="text-3xl font-light text-black dark:text-white">{shippedCount}</p>
              </div>
            </div>

            {/* Orders List */}
            {preorderOrders.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-16 text-center">
                <p className="text-4xl mb-4">🕐</p>
                <p className="text-sm font-medium text-black dark:text-white mb-1">No pre-order orders yet</p>
                <p className="text-xs text-black/40 dark:text-white/40">When customers order a pre-order product, it will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {preorderOrders.map((order: any) => {
                  const preorderItems = order.items?.filter((i: any) => i.isPreorder) || [];
                  const regularItems = order.items?.filter((i: any) => !i.isPreorder) || [];
                  const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                  };
                  return (
                    <div key={order.id} className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-5 space-y-4">
                      {/* Order Header */}
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-black dark:text-white uppercase tracking-widest">#{order.id?.slice(-6).toUpperCase()}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${statusColors[order.status] || statusColors.pending}`}>
                              {order.status || 'pending'}
                            </span>
                            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">🕐 Pre-Order</span>
                          </div>
                          <p className="text-xs text-black/40 dark:text-white/40">{order.customerInfo?.fullName} · {order.customerInfo?.phone}</p>
                          <p className="text-[10px] text-black/30 dark:text-white/30">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-black text-orange-600 dark:text-orange-400">৳{order.finalTotal?.toFixed(2)}</p>
                          <p className="text-[10px] text-black/30 dark:text-white/30 uppercase tracking-widest">{order.paymentMethod}</p>
                          {order.preorderPayOption === '50' && (
                            order.fullPaid ? (
                              <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">✓ Fully Paid</span>
                            ) : (
                              <div>
                                <p className="text-[10px] font-bold text-red-500">Due: ৳{order.preorderRemainingAmount?.toFixed(2)}</p>
                                <p className="text-[9px] text-black/30 dark:text-white/30">50% advance paid</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Pre-Order Items */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-2">Pre-Order Items ({preorderItems.length})</p>
                        <div className="space-y-2">
                          {preorderItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg shrink-0" referrerPolicy="no-referrer" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-black dark:text-white truncate">{item.name}</p>
                                <p className="text-[10px] text-black/40 dark:text-white/40">Qty: {item.quantity} · ৳{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Regular Items (if any) */}
                      {regularItems.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-bold mb-2">Regular Items ({regularItems.length})</p>
                          <div className="space-y-2">
                            {regularItems.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                                <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg shrink-0" referrerPolicy="no-referrer" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-black dark:text-white truncate">{item.name}</p>
                                  <p className="text-[10px] text-black/40 dark:text-white/40">Qty: {item.quantity} · ৳{item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Actions */}
                      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-black/5 dark:border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-black/30 dark:text-white/30 mr-2">Update Status:</p>
                        {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map(s => (
                          <button key={s} onClick={() => handleUpdateStatus(order.id, s)}
                            disabled={order.status === s}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${order.status === s ? 'bg-black/10 dark:bg-white/10 text-black/30 dark:text-white/30 cursor-not-allowed' : 'bg-gray-100 dark:bg-neutral-800 text-black/60 dark:text-white/60 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400'}`}>
                            {s}
                          </button>
                        ))}
                        {order.preorderPayOption === '50' && !order.fullPaid && (
                          <button onClick={() => handleMarkFullyPaid(order.id)}
                            className="ml-auto px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1.5">
                            <CheckCircle size={12} /> Mark as Fully Paid
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          );
        })() : activeTab === 'payment' ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center"><CreditCard size={20} /></div>
                <div>
                  <h2 className="text-xl font-medium text-black dark:text-white">Payment Settings</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-1">Manage payment methods shown at checkout</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Card Settings */}
                <div className="border border-black/5 dark:border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/60 dark:text-white/60">Card Payment</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Enable Card Payment</p>
                      <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Show credit/debit card option at checkout</p>
                    </div>
                    <button onClick={() => setPaymentSettings((p: any) => ({ ...p, cardEnabled: !p.cardEnabled }))}
                      className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${paymentSettings.cardEnabled ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 dark:bg-neutral-800 text-black/40 dark:text-white/40 hover:bg-gray-300'}`}>
                      {paymentSettings.cardEnabled ? '✓ Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* COD Settings */}
                <div className="border border-black/5 dark:border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/60 dark:text-white/60">Cash on Delivery (COD)</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Enable COD globally</p>
                      <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Show COD option at checkout for all orders</p>
                    </div>
                    <button onClick={() => setPaymentSettings((p: any) => ({ ...p, codEnabled: !p.codEnabled }))}
                      className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${paymentSettings.codEnabled ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 dark:bg-neutral-800 text-black/40 dark:text-white/40 hover:bg-gray-300'}`}>
                      {paymentSettings.codEnabled ? '✓ Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Disable COD for Pre-Orders</p>
                      <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Hide COD option when cart contains pre-order items</p>
                    </div>
                    <button onClick={() => setPaymentSettings((p: any) => ({ ...p, codDisabledForPreorder: !p.codDisabledForPreorder }))}
                      className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${paymentSettings.codDisabledForPreorder ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 dark:bg-neutral-800 text-black/40 dark:text-white/40 hover:bg-gray-300'}`}>
                      {paymentSettings.codDisabledForPreorder ? '✓ Disabled for Pre-Order' : 'Allowed for Pre-Order'}
                    </button>
                  </div>
                </div>

                {/* bKash Settings */}
                <div className="border border-black/5 dark:border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/60 dark:text-white/60">bKash</h3>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">bKash Number</label>
                    <input type="text" value={paymentSettings.bkashNumber}
                      onChange={e => setPaymentSettings((p: any) => ({ ...p, bkashNumber: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-orange-500 outline-none transition-colors text-sm bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">bKash QR Image URL</label>
                    <input type="text" value={paymentSettings.bkashQr}
                      onChange={e => setPaymentSettings((p: any) => ({ ...p, bkashQr: e.target.value }))}
                      placeholder="https://... (Cloudinary or direct image URL)"
                      className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-orange-500 outline-none transition-colors text-sm bg-transparent" />
                    {paymentSettings.bkashQr && (
                      <div className="mt-3 w-24 h-24 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
                        <img src={paymentSettings.bkashQr} alt="bKash QR Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Nagad Settings */}
                <div className="border border-black/5 dark:border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/60 dark:text-white/60">Nagad</h3>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Nagad Number</label>
                    <input type="text" value={paymentSettings.nagadNumber}
                      onChange={e => setPaymentSettings((p: any) => ({ ...p, nagadNumber: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-orange-500 outline-none transition-colors text-sm bg-transparent" />
                  </div>
                </div>

                {/* Crypto Settings */}
                <div className="border border-black/5 dark:border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/60 dark:text-white/60">Crypto Addresses</h3>

                  {/* Binance Pay */}
                  <div className="border border-yellow-400/30 bg-yellow-50/40 dark:bg-yellow-900/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-black text-black">B</span>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-black/60 dark:text-white/60">Binance Pay</p>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Pay ID / Username</label>
                      <input type="text" value={paymentSettings.binancePayId}
                        onChange={e => setPaymentSettings((p: any) => ({ ...p, binancePayId: e.target.value }))}
                        placeholder="e.g. riffbaba"
                        className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-yellow-500 outline-none transition-colors text-sm bg-transparent" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">Binance Pay QR Image URL</label>
                      <input type="text" value={paymentSettings.binancePayQr}
                        onChange={e => setPaymentSettings((p: any) => ({ ...p, binancePayQr: e.target.value }))}
                        placeholder="https://... (upload to Cloudinary and paste URL)"
                        className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-yellow-500 outline-none transition-colors text-sm bg-transparent" />
                      {paymentSettings.binancePayQr && (
                        <div className="mt-3 w-24 h-24 border border-yellow-400/30 rounded-lg overflow-hidden">
                          <img src={paymentSettings.binancePayQr} alt="Binance QR Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  {paymentSettings.cryptoAddresses?.map((crypto: any, idx: number) => (
                    <div key={idx}>
                      <label className="block text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">{crypto.name}</label>
                      <input type="text" value={crypto.address}
                        onChange={e => {
                          const updated = [...paymentSettings.cryptoAddresses];
                          updated[idx] = { ...updated[idx], address: e.target.value };
                          setPaymentSettings((p: any) => ({ ...p, cryptoAddresses: updated }));
                        }}
                        placeholder={`${crypto.name} wallet address`}
                        className="w-full border-b border-black/10 dark:border-white/10 py-2 focus:border-orange-500 outline-none transition-colors text-sm font-mono bg-transparent" />
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button onClick={handleSavePaymentSettings} disabled={isSavingPayment}
                    className="px-8 py-3 bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {isSavingPayment ? 'Saving...' : 'Save Payment Settings'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Flash Sale Toggle */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center"><Zap size={20} /></div>
                  <div>
                    <h2 className="text-lg font-medium text-black dark:text-white">Flash Sale Section</h2>
                    <p className="text-xs text-black/40 dark:text-white/40 mt-1">Show or hide the Flash Sale section on the homepage</p>
                  </div>
                </div>
                <button onClick={toggleFlashSale}
                  className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${flashSaleEnabled ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 dark:bg-neutral-800 text-black/40 dark:text-white/40 hover:bg-gray-300'}`}>
                  {flashSaleEnabled ? '🔥 Enabled' : 'Disabled'}
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center"><Package size={20} /></div>
                <div>
                  <h2 className="text-xl font-medium text-black dark:text-white">Manage Products</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-1">Edit, delete, or add products to Flash Sale</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={manageSearch}
                    onChange={e => setManageSearch(e.target.value)}
                    placeholder="Search products by name..."
                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 pl-9 text-sm focus:border-orange-500 outline-none transition-colors"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                  {manageSearch && (
                    <button onClick={() => setManageSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors text-lg leading-none">×</button>
                  )}
                </div>

                {/* Grouped by category */}
                {(() => {
                  const filtered = products.filter((p: any) =>
                    !manageSearch || p.name.toLowerCase().includes(manageSearch.toLowerCase())
                  );
                  const grouped = CATEGORIES.reduce((acc: Record<string, any[]>, cat) => {
                    const catProducts = filtered.filter((p: any) => p.category === cat.name);
                    if (catProducts.length > 0) acc[cat.name] = catProducts;
                    return acc;
                  }, {});
                  // Products with unrecognized / missing categories
                  const knownCatNames = CATEGORIES.map(c => c.name);
                  const uncategorized = filtered.filter((p: any) => !knownCatNames.includes(p.category));
                  if (uncategorized.length > 0) grouped['Other'] = uncategorized;

                  if (filtered.length === 0) return (
                    <div className="text-center py-8 text-black/40 dark:text-white/40 text-sm">No products match "{manageSearch}"</div>
                  );

                  return Object.entries(grouped).map(([catName, catProducts]) => {
                    const isCollapsed = collapsedCategories[catName];
                    return (
                      <div key={catName} className="border border-black/5 dark:border-white/5 rounded-xl overflow-hidden">
                        {/* Category header */}
                        <button
                          type="button"
                          onClick={() => setCollapsedCategories(prev => ({ ...prev, [catName]: !prev[catName] }))}
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-neutral-950 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">{catName}</span>
                            <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">{catProducts.length}</span>
                          </div>
                          <svg className={`w-4 h-4 text-black/40 dark:text-white/40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {/* Products in this category */}
                        {!isCollapsed && (
                          <div className="divide-y divide-black/5 dark:divide-white/5">
                            {catProducts.map((product: any) => (
                              <div key={product.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-white dark:bg-neutral-900">
                                {editingProduct === product.id ? (
                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" value={editProductData.name} onChange={(e) => setEditProductData({...editProductData, name: e.target.value})}
                          className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" placeholder="Name" />
                        <div className="flex gap-2">
                          <input type="number" value={editProductData.price} onChange={(e) => setEditProductData({...editProductData, price: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" placeholder="Price" />
                          <input type="number" value={editProductData.discount || ''} onChange={(e) => setEditProductData({...editProductData, discount: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" placeholder="Discount %" />
                        </div>
                        <select value={editProductData.category} onChange={(e) => setEditProductData({...editProductData, category: e.target.value})}
                          className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none">
                          {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                        <input type="text" value={editProductData.image} onChange={(e) => setEditProductData({...editProductData, image: e.target.value})}
                          className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" placeholder="Image URL" />
                        <div className="flex gap-2">
                          <input type="number" min="0" max="5" step="0.1" value={editProductData.rating || ''} onChange={(e) => setEditProductData({...editProductData, rating: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" placeholder="Rating (0-5)" />
                          <input type="number" min="0" value={editProductData.soldCount || ''} onChange={(e) => setEditProductData({...editProductData, soldCount: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" placeholder="Sold Count" />
                          <input type="number" min="0" value={editProductData.reviewCount || ''} onChange={(e) => setEditProductData({...editProductData, reviewCount: e.target.value})}
                            className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none" placeholder="Review Count" />
                        </div>
                        <textarea value={editProductData.description} onChange={(e) => setEditProductData({...editProductData, description: e.target.value})}
                          className="w-full md:col-span-2 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:border-orange-500 outline-none resize-none" placeholder="Description" rows={2} />
                        {/* Stock & Variants */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">📦 Stock</p>
                            <input type="number" min="0" placeholder="Unlimited if blank" value={editProductData.stock ?? ''}
                              onChange={e => setEditProductData({...editProductData, stock: e.target.value})}
                              className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">📐 Sizes</p>
                            <input type="text" placeholder="S, M, L, XL" value={editProductData.sizes || ''}
                              onChange={e => setEditProductData({...editProductData, sizes: e.target.value})}
                              className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">🎨 Colors</p>
                            <input type="text" placeholder="Red, Blue, Black" value={editProductData.colors || ''}
                              onChange={e => setEditProductData({...editProductData, colors: e.target.value})}
                              className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none" />
                          </div>
                        </div>

                        {/* Pre-Order Section (Edit) */}
                        <div className="md:col-span-2 border border-orange-200 dark:border-orange-900/40 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 px-4 py-3">
                            <div>
                              <p className="text-xs font-bold text-black dark:text-white">🕐 Pre-Order Product</p>
                              <p className="text-[10px] text-black/40 dark:text-white/40 mt-0.5">Enables bulk pricing tiers for this product</p>
                            </div>
                            <button type="button" onClick={() => setEditProductData({...editProductData, isPreorder: !editProductData.isPreorder})}
                              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-colors shrink-0 ${editProductData.isPreorder ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 dark:bg-neutral-800 text-black/40 dark:text-white/40 hover:bg-gray-300 dark:hover:bg-neutral-700'}`}>
                              {editProductData.isPreorder ? '✓ Enabled' : 'Disabled'}
                            </button>
                          </div>
                          {editProductData.isPreorder && (
                            <div className="bg-white dark:bg-neutral-900 px-4 py-4 space-y-3">
                              <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Bulk Pricing Tiers</p>
                              <div className="space-y-2">
                                {(editProductData.preorderPriceTiers || []).map((tier: any, idx: number) => (
                                  <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                                    <div className="col-span-4">
                                      {idx === 0 && <label className="block text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Label</label>}
                                      <input type="text" value={tier.label} placeholder="e.g. 1 piece"
                                        onChange={e => { const tiers = [...(editProductData.preorderPriceTiers || [])]; tiers[idx] = {...tiers[idx], label: e.target.value}; setEditProductData({...editProductData, preorderPriceTiers: tiers}); }}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs focus:border-orange-500 outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                      {idx === 0 && <label className="block text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Min</label>}
                                      <input type="number" min="1" value={tier.minQty}
                                        onChange={e => { const tiers = [...(editProductData.preorderPriceTiers || [])]; tiers[idx] = {...tiers[idx], minQty: e.target.value}; setEditProductData({...editProductData, preorderPriceTiers: tiers}); }}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs focus:border-orange-500 outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                      {idx === 0 && <label className="block text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Max</label>}
                                      <input type="number" min="1" value={tier.maxQty || ''} placeholder="∞"
                                        onChange={e => { const tiers = [...(editProductData.preorderPriceTiers || [])]; tiers[idx] = {...tiers[idx], maxQty: e.target.value}; setEditProductData({...editProductData, preorderPriceTiers: tiers}); }}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs focus:border-orange-500 outline-none" />
                                    </div>
                                    <div className="col-span-3">
                                      {idx === 0 && <label className="block text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">৳ / unit</label>}
                                      <input type="number" min="0" value={tier.price} placeholder="0"
                                        onChange={e => { const tiers = [...(editProductData.preorderPriceTiers || [])]; tiers[idx] = {...tiers[idx], price: e.target.value}; setEditProductData({...editProductData, preorderPriceTiers: tiers}); }}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs focus:border-orange-500 outline-none" />
                                    </div>
                                    <div className="col-span-1 flex items-end">
                                      <button type="button" onClick={() => { const tiers = (editProductData.preorderPriceTiers || []).filter((_: any, i: number) => i !== idx); setEditProductData({...editProductData, preorderPriceTiers: tiers}); }}
                                        className={`w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors ${idx === 0 ? 'mt-5' : ''}`}>
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button type="button"
                                onClick={() => setEditProductData({...editProductData, preorderPriceTiers: [...(editProductData.preorderPriceTiers || []), { minQty: '', maxQty: '', label: '', price: '' }]})}
                                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors">
                                <PlusCircle size={14} /> Add Tier
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Image Gallery Manager */}
                        {editProductData.images && editProductData.images.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">
                              Product Images — hover &amp; click <strong>✕</strong> to delete
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {editProductData.images.map((url: string, idx: number) => (
                                <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border-2 border-black/10 dark:border-white/10"
                                  style={{ borderColor: editProductData.image === url ? '#f97316' : undefined }}>
                                  <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedImages = editProductData.images.filter((_: string, i: number) => i !== idx);
                                      const newPrimary = editProductData.image === url ? (updatedImages[0] || '') : editProductData.image;
                                      setEditProductData({ ...editProductData, images: updatedImages, image: newPrimary });
                                    }}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                    title="Delete this image"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                  {editProductData.image === url && (
                                    <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[7px] text-center font-bold uppercase py-0.5">Main</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="text-[9px] text-black/30 dark:text-white/30 mt-1">
                              The image with an orange border is the main/thumbnail. Deleting it auto-sets the next one as main.
                            </p>
                          </div>
                        )}

                        {/* Add new images */}
                        <div className="md:col-span-2 space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 flex items-center gap-1">
                            <Upload size={11} /> Add More Images
                          </p>
                          <input
                            type="file" multiple accept="image/*" ref={editImageInputRef}
                            onChange={(e) => { if (e.target.files) setEditImageFiles(Array.from(e.target.files)); }}
                            className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                          />
                          {editImageFiles.length > 0 && (
                            <p className="text-[10px] text-orange-500 font-medium">{editImageFiles.length} new image(s) will be uploaded on Save</p>
                          )}
                        </div>

                        {/* Video manager */}
                        <div className="md:col-span-2 space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 flex items-center gap-1">
                            <Video size={11} /> {editProductData.video ? 'Replace Video' : 'Add Video'}
                          </p>
                          {editProductData.video && !editVideoFile && (
                            <div className="flex items-center gap-3 p-2 bg-white dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10">
                              <video src={editProductData.video} className="w-16 h-12 object-cover rounded" muted />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-black/60 dark:text-white/60 truncate">Current video</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditProductData({ ...editProductData, video: undefined })}
                                className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded"
                                title="Remove video"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                          <input
                            type="file" accept="video/*" ref={editVideoInputRef}
                            onChange={(e) => { if (e.target.files && e.target.files[0]) setEditVideoFile(e.target.files[0]); }}
                            className="w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                          />
                          {editVideoFile && (
                            <p className="text-[10px] text-orange-500 font-medium">{editVideoFile.name} — will be uploaded on Save</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-16 h-16 bg-white dark:bg-neutral-900 rounded-lg overflow-hidden shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-black dark:text-white truncate">{product.name}</h3>
                          <p className="text-xs text-black/60 dark:text-white/60 mt-1">{product.category} • ৳{product.price}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {product.discount && <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded">{product.discount}% OFF</span>}
                            {product.isFlashSale && <span className="inline-block px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded">🔥 Flash Sale</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end mt-4 md:mt-0">
                      {editingProduct === product.id ? (
                        <>
                          <button onClick={() => handleUpdateProduct(product.id)} disabled={isUploadingEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50">
                            <Save size={14} /> {isUploadingEdit ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => { setEditingProduct(null); setEditImageFiles([]); setEditVideoFile(null); if (editImageInputRef.current) editImageInputRef.current.value = ''; if (editVideoInputRef.current) editVideoInputRef.current.value = ''; }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-neutral-800 text-black dark:text-white rounded-lg text-xs font-medium hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors">
                            <XCircle size={14} /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => toggleFlashSaleProduct(product)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${product.isFlashSale ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-100 dark:bg-neutral-800 text-black/40 dark:text-white/40 hover:bg-orange-100 hover:text-orange-600'}`}
                            title="Toggle Flash Sale">
                            <Zap size={10} /> Flash
                          </button>
                          <button onClick={() => { setEditingProduct(product.id); setEditProductData({ name: product.name, price: product.price, discount: product.discount || '', description: product.description, category: product.category, image: product.image, images: (product as any).images || [], video: (product as any).video || undefined, rating: product.rating || '', soldCount: (product as any).soldCount || '', reviewCount: (product as any).reviewCount || '', stock: (product as any).stock ?? '', sizes: ((product as any).variants?.find((v: any) => v.type === 'size')?.options || []).join(', '), colors: ((product as any).variants?.find((v: any) => v.type === 'color')?.options || []).join(', '), isPreorder: (product as any).isPreorder || false, preorderPriceTiers: (product as any).preorderPriceTiers || [] }); setEditImageFiles([]); setEditVideoFile(null); if (editImageInputRef.current) editImageInputRef.current.value = ''; if (editVideoInputRef.current) editVideoInputRef.current.value = ''; }}
                            className="p-2 text-black/40 dark:text-white/40 hover:text-orange-600 dark:hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20" title="Edit Product">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-black/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete Product">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center"><PlusCircle size={20} /></div>
                <div>
                  <h2 className="text-xl font-medium text-black dark:text-white">Add New Product</h2>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-1">Create a new product to display on the store</p>
                </div>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><Package size={14} /> Product Name</label>
                    <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g., Premium Wireless Headphones"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><DollarSign size={14} /> Price (৳)</label>
                    <input type="number" required min="0" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="e.g., 2500"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><Percent size={14} /> Discount (%)</label>
                    <input type="number" min="0" max="100" value={newProduct.discount} onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})} placeholder="e.g., 10"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><Tag size={14} /> Category</label>
                    <select required value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-white focus:border-orange-500 outline-none transition-colors appearance-none">
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><ImageIcon size={14} /> Image URL (Optional if uploading)</label>
                    <input type="url" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://example.com/image.jpg"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><Upload size={14} /> Upload Images</label>
                    <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={(e) => { if (e.target.files) setImageFiles(Array.from(e.target.files)); }}
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
                    {imageFiles.length > 0 && <p className="text-[10px] text-black/60 dark:text-white/60">{imageFiles.length} image(s) selected</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><Video size={14} /> Upload Video</label>
                    <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => { if (e.target.files && e.target.files.length > 0) setVideoFile(e.target.files[0]); }}
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
                    {videoFile && <p className="text-[10px] text-black/60 dark:text-white/60">{videoFile.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">⭐ Rating (0-5)</label>
                    <input type="number" min="0" max="5" step="0.1" value={newProduct.rating} onChange={(e) => setNewProduct({...newProduct, rating: e.target.value})} placeholder="e.g., 4.8"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">🛒 Sold Count</label>
                    <input type="number" min="0" value={newProduct.soldCount} onChange={(e) => setNewProduct({...newProduct, soldCount: e.target.value})} placeholder="e.g., 1200"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">💬 Review Count</label>
                    <input type="number" min="0" value={newProduct.reviewCount} onChange={(e) => setNewProduct({...newProduct, reviewCount: e.target.value})} placeholder="e.g., 120"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">📦 Stock Quantity</label>
                    <input type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} placeholder="e.g., 50 (leave blank = unlimited)"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">📐 Sizes (comma separated)</label>
                    <input type="text" value={newProduct.sizes} onChange={(e) => setNewProduct({...newProduct, sizes: e.target.value})} placeholder="e.g., S, M, L, XL"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">🎨 Colors (comma separated)</label>
                    <input type="text" value={newProduct.colors} onChange={(e) => setNewProduct({...newProduct, colors: e.target.value})} placeholder="e.g., Red, Blue, Black"
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors" />
                  </div>
                </div>

                {/* Pre-Order Section */}
                <div className="border border-orange-200 dark:border-orange-900/40 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 px-5 py-4">
                    <div>
                      <p className="text-sm font-bold text-black dark:text-white">🕐 Pre-Order Product</p>
                      <p className="text-[11px] text-black/40 dark:text-white/40 mt-0.5">Enables bulk pricing tiers — customers pick a quantity bracket at checkout</p>
                    </div>
                    <button type="button" onClick={() => setNewProduct({...newProduct, isPreorder: !newProduct.isPreorder})}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${newProduct.isPreorder ? 'bg-orange-500' : 'bg-gray-200 dark:bg-neutral-700'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${newProduct.isPreorder ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {newProduct.isPreorder && (
                    <div className="bg-white dark:bg-neutral-900 px-5 py-5 space-y-4">
                      <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-medium">Bulk Pricing Tiers</p>
                      <p className="text-[11px] text-black/50 dark:text-white/40 -mt-2">Add tiers like "1 piece", "1–9 pieces", "10+ pieces" with different per-unit prices. Customers will select one tier when ordering.</p>
                      <div className="space-y-3">
                        {newProductPriceTiers.map((tier, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                            <div className="col-span-4">
                              <label className="block text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Label</label>
                              <input type="text" value={tier.label} placeholder="e.g. 1 piece"
                                onChange={e => { const t = [...newProductPriceTiers]; t[idx] = {...t[idx], label: e.target.value}; setNewProductPriceTiers(t); }}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Min Qty</label>
                              <input type="number" min="1" value={tier.minQty}
                                onChange={e => { const t = [...newProductPriceTiers]; t[idx] = {...t[idx], minQty: e.target.value}; setNewProductPriceTiers(t); }}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Max Qty</label>
                              <input type="number" min="1" value={tier.maxQty} placeholder="∞"
                                onChange={e => { const t = [...newProductPriceTiers]; t[idx] = {...t[idx], maxQty: e.target.value}; setNewProductPriceTiers(t); }}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500 outline-none" />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Price / unit (৳)</label>
                              <input type="number" min="0" value={tier.price} placeholder="0"
                                onChange={e => { const t = [...newProductPriceTiers]; t[idx] = {...t[idx], price: e.target.value}; setNewProductPriceTiers(t); }}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500 outline-none" />
                            </div>
                            <div className="col-span-1 flex items-end pb-0.5">
                              <button type="button" onClick={() => setNewProductPriceTiers(newProductPriceTiers.filter((_, i) => i !== idx))}
                                className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors mt-5">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="button"
                        onClick={() => setNewProductPriceTiers([...newProductPriceTiers, { minQty: '', maxQty: '', label: '', price: '' }])}
                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors">
                        <PlusCircle size={14} /> Add Tier
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40"><FileText size={14} /> Description</label>
                  <textarea required rows={4} value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} placeholder="Describe the product features, materials, etc."
                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors resize-none" />
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                  <button type="submit" disabled={isAddingProduct}
                    className="w-full md:w-auto px-8 py-3 bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isAddingProduct ? 'Adding Product...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
