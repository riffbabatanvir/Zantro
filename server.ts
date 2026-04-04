import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import { PRODUCTS } from './src/constants.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'di4byoc2w',
  api_key: process.env.CLOUDINARY_API_KEY || '783818254271344',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'aln4avRCPy61woO7Acj5Up7ogIw',
});

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Zantro:aSmjatd84Z61NY4k@cluster0.vphqqr7.mongodb.net/?appName=Cluster0';
const client = new MongoClient(MONGO_URI);
let db: any;

async function connectDB() {
  await client.connect();
  db = client.db('zantro');
  console.log('Connected to MongoDB');
  const productsCol = db.collection('products');
  const count = await productsCol.countDocuments();
  if (count === 0) {
    await productsCol.insertMany(PRODUCTS.map(p => ({ ...p, _id: undefined })));
    console.log('Seeded initial products');
  }
}

// 50 MB limit for videos
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  // Detect resource type by extension
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const isVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'wmv', 'flv', 'm4v'].includes(ext);
  const resourceType = isVideo ? 'video' : 'image';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'zantro',
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

const isAdmin = (req: any) => req.headers.authorization === 'Bearer admin-secret-token';

function getIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return (forwarded as string).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// Upload
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  try {
    const files = req.files as Express.Multer.File[];
    const urls = await Promise.all(files.map(file => uploadToCloudinary(file.buffer, file.originalname)));
    res.json({ urls });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  const products = await db.collection('products').find({}).toArray();
  res.json(products.map((p: any) => ({ ...p, id: p._id.toString() })));
});

app.post('/api/products', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const product = req.body;
  const result = await db.collection('products').insertOne(product);
  res.status(201).json({ ...product, id: result.insertedId.toString() });
});

app.patch('/api/products/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const updates = req.body;
  try {
    await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: updates });
    const updated = await db.collection('products').findOne({ _id: new ObjectId(id) });
    res.json({ ...updated, id: updated._id.toString() });
  } catch {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  try {
    await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Product not found' });
  }
});

// ─── Customer Reviews ─────────────────────────────────────────────────────────

// Submit a review for a product
app.post('/api/products/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { name, rating, comment } = req.body;
  if (!name || !rating || !comment) {
    return res.status(400).json({ error: 'Name, rating, and comment are required' });
  }
  try {
    const newReview = {
      id: new ObjectId().toString(),
      name,
      rating: Number(rating),
      comment,
      date: new Date().toISOString(),
    };
    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $push: { customerReviews: newReview } as any }
    );
    res.status(201).json(newReview);
  } catch {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Delete a review (admin only)
app.delete('/api/products/:id/reviews/:reviewId', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id, reviewId } = req.params;
  try {
    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $pull: { customerReviews: { id: reviewId } } as any }
    );
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const order = { ...req.body, createdAt: new Date().toISOString(), status: 'pending' };
  const result = await db.collection('orders').insertOne(order);
  res.status(201).json({ ...order, id: result.insertedId.toString() });
});

app.get('/api/orders', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const orders = await db.collection('orders').find({}).toArray();
  res.json(orders.map((o: any) => ({ ...o, id: o._id.toString() })));
});

app.patch('/api/orders/:id/status', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { status, remark } = req.body;
  try {
    const update: any = {};
    if (status !== undefined) update.status = status;
    if (remark !== undefined) update.remark = remark;
    await db.collection('orders').updateOne({ _id: new ObjectId(id) }, { $set: update });
    const updated = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    res.json({ ...updated, id: updated._id.toString() });
  } catch {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  try {
    await db.collection('orders').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Messages
app.post('/api/messages', async (req, res) => {
  const message = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('messages').insertOne(message);
  res.status(201).json({ ...message, id: result.insertedId.toString() });
});

app.get('/api/messages', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const messages = await db.collection('messages').find({}).toArray();
  res.json(messages.map((m: any) => ({ ...m, id: m._id.toString() })));
});

app.delete('/api/messages/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  try {
    await db.collection('messages').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Message not found' });
  }
});

// Category images
app.get('/api/categories', async (req, res) => {
  const doc = await db.collection('settings').findOne({ key: 'categoryImages' });
  res.json(doc ? doc.images : {});
});

app.patch('/api/categories/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { image } = req.body;
  await db.collection('settings').updateOne(
    { key: 'categoryImages' },
    { $set: { [`images.${id}`]: image } },
    { upsert: true }
  );
  res.json({ id, image });
});

// Flash Sale settings
app.get('/api/settings/flashsale', async (req, res) => {
  const setting = await db.collection('settings').findOne({ key: 'flashsale' });
  res.json({ enabled: setting ? setting.enabled : true });
});

app.post('/api/settings/flashsale', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { enabled } = req.body;
  await db.collection('settings').updateOne(
    { key: 'flashsale' },
    { $set: { key: 'flashsale', enabled } },
    { upsert: true }
  );
  res.json({ enabled });
});

// ─── Payment Settings ────────────────────────────────────────────────────────

app.get('/api/settings/payment', async (req, res) => {
  const setting = await db.collection('settings').findOne({ key: 'paymentSettings' });
  if (setting) {
    const { _id, key, ...rest } = setting;
    res.json(rest);
  } else {
    res.json({
      bkashNumber: '01922929033', nagadNumber: '01922929033',
      bkashQr: 'https://res.cloudinary.com/di4byoc2w/image/upload/v1774930027/Image_20260331100303_170_72_ixlgcn.jpg',
      binancePayQr: '', binancePayId: 'riffbaba',
      codEnabled: true, codDisabledForPreorder: true,
      cryptoAddresses: [
        { name: 'BTC (Bitcoin)', address: '147hzwvR68sxcJUfkMEpSRxTwd9hqNpeq7' },
        { name: 'ETH (Ethereum)', address: '0x26c8d840e121e49d9657b1e4ec04cfffe1fb2b8c' },
        { name: 'USDT (TRC20)', address: 'TXNYecJoTbgj6QeUGU8Vyjmb6y8u2Cc2rP' },
        { name: 'SOL (Solana)', address: '72ucZBSshMHfAyHXKGdUyxuoTtLGRerwDJSjupZuMVpX' }
      ]
    });
  }
});

app.post('/api/settings/payment', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { bkashNumber, nagadNumber, bkashQr, binancePayQr, binancePayId, codEnabled, codDisabledForPreorder, cryptoAddresses } = req.body;
  const update = { bkashNumber, nagadNumber, bkashQr, binancePayQr, binancePayId, codEnabled, codDisabledForPreorder, cryptoAddresses };
  await db.collection('settings').updateOne(
    { key: 'paymentSettings' },
    { $set: { key: 'paymentSettings', ...update } },
    { upsert: true }
  );
  res.json(update);
});

// ─── Coupons ─────────────────────────────────────────────────────────────────

app.get('/api/coupons', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const coupons = await db.collection('coupons').find({}).toArray();
  res.json(coupons.map((c: any) => ({ ...c, id: c._id.toString() })));
});

app.post('/api/coupons', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { code, discount } = req.body;
  if (!code || !discount) return res.status(400).json({ error: 'Code and discount required' });
  const existing = await db.collection('coupons').findOne({ code: code.toUpperCase() });
  if (existing) return res.status(400).json({ error: 'Coupon code already exists' });
  const coupon = { code: code.toUpperCase(), discount: Number(discount), isActive: true, usageCount: 0 };
  const result = await db.collection('coupons').insertOne(coupon);
  res.status(201).json({ ...coupon, id: result.insertedId.toString() });
});

app.patch('/api/coupons/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const updates = req.body;
  try {
    await db.collection('coupons').updateOne({ _id: new ObjectId(id) }, { $set: updates });
    const updated = await db.collection('coupons').findOne({ _id: new ObjectId(id) });
    res.json({ ...updated, id: updated._id.toString() });
  } catch {
    res.status(404).json({ error: 'Coupon not found' });
  }
});

app.delete('/api/coupons/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  try {
    await db.collection('coupons').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Coupon not found' });
  }
});

// Validate coupon (public)
app.post('/api/coupons/validate', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });
  const coupon = await db.collection('coupons').findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ error: 'Invalid or inactive coupon' });
  // Increment usage count
  await db.collection('coupons').updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } });
  res.json({ code: coupon.code, discount: coupon.discount });
});

// ─── Visitor Tracking ─────────────────────────────────────────────────────────

app.post('/api/visitors/track', async (req, res) => {
  try {
    const ip = getIP(req);
    const { userAgent, page } = req.body;
    const ua = userAgent || '';
    let device = 'Desktop';
    if (/mobile/i.test(ua)) device = 'Mobile';
    else if (/tablet|ipad/i.test(ua)) device = 'Tablet';
    let browser = 'Unknown';
    if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';
    let country = 'Unknown';
    let city = 'Unknown';
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`);
      const geoData = await geoRes.json() as any;
      if (geoData.status === 'success') { country = geoData.country || 'Unknown'; city = geoData.city || 'Unknown'; }
    } catch {}
    const now = new Date().toISOString();
    const existing = await db.collection('visitors').findOne({ ip });
    if (existing) {
      await db.collection('visitors').updateOne({ ip }, {
        $set: { lastSeen: now, device, browser, country, city, lastPage: page || '/' },
        $inc: { visitCount: 1 }
      });
    } else {
      await db.collection('visitors').insertOne({ ip, device, browser, country, city, lastPage: page || '/', firstSeen: now, lastSeen: now, visitCount: 1 });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    res.json({ success: false });
  }
});

app.get('/api/visitors', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const visitors = await db.collection('visitors').find({}).sort({ lastSeen: -1 }).toArray();
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  res.json(visitors.map((v: any) => ({ ...v, id: v._id.toString(), isOnline: v.lastSeen > fiveMinAgo })));
});

app.delete('/api/visitors/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  try {
    await db.collection('visitors').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Visitor not found' });
  }
});


// ─── Announcement Banner ──────────────────────────────────────────────────────
app.get('/api/announcement', async (req, res) => {
  const doc = await db.collection('settings').findOne({ key: 'announcement' });
  res.json(doc ? { text: doc.text, enabled: doc.enabled, bgColor: doc.bgColor } : { text: '', enabled: false, bgColor: '#ea580c' });
});

app.post('/api/announcement', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { text, enabled, bgColor } = req.body;
  await db.collection('settings').updateOne(
    { key: 'announcement' },
    { $set: { key: 'announcement', text, enabled, bgColor: bgColor || '#ea580c' } },
    { upsert: true }
  );
  res.json({ text, enabled, bgColor });
});

// ─── Hero Slides ──────────────────────────────────────────────────────────────
app.get('/api/hero-slides', async (req, res) => {
  const doc = await db.collection('settings').findOne({ key: 'heroSlides' });
  res.json(doc ? doc.slides : []);
});

app.post('/api/hero-slides', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { slides } = req.body;
  await db.collection('settings').updateOne(
    { key: 'heroSlides' },
    { $set: { key: 'heroSlides', slides } },
    { upsert: true }
  );
  res.json({ slides });
});

// ─── Order Tracking (public — by ID) ─────────────────────────────────────────
app.get('/api/orders/track/:id', async (req, res) => {
  const id: string = (req.params.id || '').trim();
  try {
    // Support short 6-char ID (as shown in admin panel) or full MongoDB ObjectId
    let order: any = null;
    if (ObjectId.isValid(id) && id.length === 24) {
      order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    } else {
      // Search all orders and match by last 6 chars of _id
      const all = await db.collection('orders').find({}).toArray();
      order = all.find((o: any) => o._id.toString().slice(-6).toLowerCase() === id.toLowerCase()) || null;
    }
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // Return safe subset only
    res.json({
      id: order._id.toString(),
      status: order.status || 'pending',
      createdAt: order.createdAt,
      finalTotal: order.finalTotal,
      remark: order.remark || '',
      items: order.items?.map((i: any) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
      customerInfo: {
        fullName: order.customerInfo?.fullName,
        phone: order.customerInfo?.phone,
        email: order.customerInfo?.email,
        address: order.customerInfo?.address,
      },
    });
  } catch {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'moumitanvir' && password === 'riffbabatanvir69420@') {
    res.json({ token: 'admin-secret-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ─── Robots.txt ───────────────────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /cart\nSitemap: https://zantrobd.com/sitemap.xml');
});

// ─── Sitemap ──────────────────────────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await db.collection('products').find({}).toArray();
    const staticUrls = [
      { loc: 'https://zantrobd.com', priority: '1.0', changefreq: 'daily' },
      { loc: 'https://zantrobd.com/shop', priority: '0.9', changefreq: 'daily' },
      { loc: 'https://zantrobd.com/about', priority: '0.6', changefreq: 'monthly' },
      { loc: 'https://zantrobd.com/contact', priority: '0.6', changefreq: 'monthly' },
      { loc: 'https://zantrobd.com/faq', priority: '0.5', changefreq: 'monthly' },
    ];
    const productUrls = products.map((p: any) => ({
      loc: `https://zantrobd.com/product/${p._id}`,
      priority: '0.8',
      changefreq: 'weekly',
    }));
    const allUrls = [...staticUrls, ...productUrls];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch {
    res.status(500).send('Error generating sitemap');
  }
});


async function startServer() {
  await connectDB();
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
  }
  app.listen(PORT, '0.0.0.0', () => { console.log(`Server running on http://localhost:${PORT}`); });
}

startServer();
