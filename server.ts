import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
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

// ─── IP Blocklist (loaded into memory, refreshed per request from DB) ──────────
let blockedIPs = new Set<string>();

// ─── In-memory rate limiter for login brute-force protection ──────────────────
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// ─── In-memory rate limiter for order spam protection ─────────────────────────
const orderAttempts = new Map<string, { count: number; firstAttempt: number }>();
const ORDER_MAX_ATTEMPTS = 10;
const ORDER_WINDOW_MS = 60 * 60 * 1000; // 1 hour

async function loadBlockedIPs() {
  try {
    const docs = await db.collection('blockedIPs').find({}).toArray();
    blockedIPs = new Set(docs.map((d: any) => d.ip));
  } catch {}
}

app.use(async (req, res, next) => {
  // Skip the block check for the admin login endpoint itself
  if (req.path === '/api/admin/login') return next();
  const ip = getIP(req);
  if (blockedIPs.has(ip)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

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
  await loadBlockedIPs();
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

// ─── Resend Email ─────────────────────────────────────────────────────────────
async function sendOrderConfirmationEmail(order: any, orderId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !order.customerInfo?.email) return; // skip if no key or no email

  const shortId = orderId.slice(-6).toUpperCase();
  const items = order.items || [];
  const isPreorder = order.isPreorderOrder || false;

  const itemRows = items.map((item: any) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" width="48" height="48" style="border-radius:8px;object-fit:cover;"/>` : ''}
          <div>
            <p style="margin:0;font-size:14px;font-weight:600;color:#111;">${item.name}</p>
            ${item.selectedSize ? `<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">Size: ${item.selectedSize}</p>` : ''}
            ${item.selectedColor ? `<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">Color: ${item.selectedColor}</p>` : ''}
            <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px;font-weight:700;color:#ea580c;">
        ৳${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#ea580c;padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">ZANTRO</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;text-transform:uppercase;letter-spacing:2px;">
        ${isPreorder ? 'Pre-Order Confirmed' : 'Order Confirmed'}
      </p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <p style="margin:0 0 8px;font-size:16px;color:#111;">Hi <strong>${order.customerInfo.fullName}</strong>,</p>
      <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.6;">
        ${isPreorder
          ? 'Your pre-order has been received! We\'ll contact you once it\'s ready.'
          : 'Thank you for your order! We\'re preparing it and will deliver it soon.'}
      </p>

      <!-- Order ID -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:32px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;">Your Order ID</p>
        <p style="margin:0;font-size:28px;font-weight:900;color:#ea580c;font-family:monospace;letter-spacing:2px;">#${shortId}</p>
        <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">Save this to track your order</p>
      </div>

      <!-- Items -->
      <h3 style="margin:0 0 16px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;">Order Summary</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${itemRows}
      </table>

      <!-- Totals -->
      <div style="margin-top:24px;padding-top:16px;">
        ${order.shippingCost > 0 ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#6b7280;">Shipping</span>
          <span style="font-size:13px;color:#111;">৳${order.shippingCost}</span>
        </div>` : ''}
        ${order.couponDiscount > 0 ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#6b7280;">Coupon Discount</span>
          <span style="font-size:13px;color:#16a34a;">-৳${order.couponDiscount}</span>
        </div>` : ''}
        ${isPreorder && order.preorderRemainingAmount > 0 ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#6b7280;">Remaining (on delivery)</span>
          <span style="font-size:13px;color:#111;">৳${order.preorderRemainingAmount}</span>
        </div>` : ''}
        <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:2px solid #f3f4f6;margin-top:8px;">
          <span style="font-size:15px;font-weight:700;color:#111;">${isPreorder && order.preorderRemainingAmount > 0 ? 'Advance Paid' : 'Total'}</span>
          <span style="font-size:15px;font-weight:900;color:#ea580c;">৳${order.finalTotal?.toLocaleString()}</span>
        </div>
      </div>

      <!-- Delivery Info -->
      <div style="margin-top:32px;background:#f9fafb;border-radius:12px;padding:20px;">
        <h3 style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;">Delivery Info</h3>
        <p style="margin:0 0 4px;font-size:14px;color:#111;font-weight:600;">${order.customerInfo.fullName}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">${order.customerInfo.address}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;">${order.customerInfo.phone}</p>
      </div>

      <!-- Track Order -->
      <div style="margin-top:32px;text-align:center;">
        <a href="https://zantrobd.com/order-tracking" style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">
          Track Your Order
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;background:#f9fafb;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">Questions? Contact us at</p>
      <a href="mailto:store@zantrobd.com" style="font-size:12px;color:#ea580c;text-decoration:none;">store@zantrobd.com</a>
      <p style="margin:12px 0 0;font-size:11px;color:#d1d5db;">© ${new Date().getFullYear()} Zantro. Bangladesh.</p>
    </div>

  </div>
</body>
</html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Zantro <orders@zantrobd.com>',
        to: order.customerInfo.email,
        subject: `Order Confirmed #${shortId} — Zantro`,
        html,
      }),
    });
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
  }
}

// ─── Admin New Order Alert ────────────────────────────────────────────────────
async function sendAdminNewOrderAlert(order: any, orderId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const shortId = orderId.slice(-6).toUpperCase();
  const items = order.items || [];
  const itemList = items.map((i: any) => `${i.name} x${i.quantity} — ৳${i.price * i.quantity}`).join('<br/>');
  const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 4px;color:#ea580c;">🛍 New Order #${shortId}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:13px;">${new Date().toLocaleString()}</p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>Customer:</strong> ${order.customerInfo?.fullName}</p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>Phone:</strong> ${order.customerInfo?.phone}</p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>Address:</strong> ${order.customerInfo?.address}</p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>Payment:</strong> ${order.paymentMethod}</p>
    <hr style="margin:16px 0;border:none;border-top:1px solid #f3f4f6;"/>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">${itemList}</p>
    <hr style="margin:16px 0;border:none;border-top:1px solid #f3f4f6;"/>
    <p style="margin:0;font-size:16px;font-weight:900;color:#ea580c;">Total: ৳${order.finalTotal?.toLocaleString()}</p>
  </div>
</body></html>`;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Zantro Orders <orders@zantrobd.com>',
        to: process.env.ADMIN_EMAIL || 'store@zantrobd.com',
        subject: `New Order #${shortId} — ৳${order.finalTotal?.toLocaleString()}`,
        html,
      }),
    });
  } catch (err) { console.error('Failed to send admin order alert:', err); }
}

// ─── Customer Status Email (cancelled / delivered) ────────────────────────────
async function sendStatusEmail(order: any, orderId: string, status: 'cancelled' | 'delivered') {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !order.customerInfo?.email) return;
  const shortId = orderId.slice(-6).toUpperCase();
  const isCancelled = status === 'cancelled';
  const subject = isCancelled
    ? `Your Order #${shortId} Has Been Cancelled — Zantro`
    : `Your Order #${shortId} Has Been Delivered — Zantro`;
  const headerColor = isCancelled ? '#dc2626' : '#16a34a';
  const headerText = isCancelled ? 'Order Cancelled' : 'Order Delivered!';
  const bodyText = isCancelled
    ? 'Unfortunately your order has been cancelled. If you paid, a refund will be processed shortly. Contact us at store@zantrobd.com for any questions.'
    : 'Great news! Your order has been delivered. We hope you love your purchase! If you have any issues, please contact us at store@zantrobd.com.';
  const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:${headerColor};padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;">ZANTRO</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;text-transform:uppercase;letter-spacing:2px;">${headerText}</p>
    </div>
    <div style="padding:40px;">
      <p style="margin:0 0 8px;font-size:16px;color:#111;">Hi <strong>${order.customerInfo.fullName}</strong>,</p>
      <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.6;">${bodyText}</p>
      <div style="background:#f9fafb;border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;">Order ID</p>
        <p style="margin:0;font-size:28px;font-weight:900;color:${headerColor};font-family:monospace;letter-spacing:2px;">#${shortId}</p>
      </div>
    </div>
    <div style="padding:24px 40px;background:#f9fafb;text-align:center;border-top:1px solid #f3f4f6;">
      <a href="mailto:store@zantrobd.com" style="font-size:12px;color:#ea580c;text-decoration:none;">store@zantrobd.com</a>
      <p style="margin:12px 0 0;font-size:11px;color:#d1d5db;">© ${new Date().getFullYear()} Zantro. Bangladesh.</p>
    </div>
  </div>
</body></html>`;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Zantro <orders@zantrobd.com>',
        to: order.customerInfo.email,
        subject,
        html,
      }),
    });
  } catch (err) { console.error(`Failed to send ${status} email:`, err); }
}

// Orders
app.post('/api/orders', async (req, res) => {
  const ip = getIP(req);

  // Rate limit: max 10 orders per IP per hour
  const now = Date.now();
  const attempt = orderAttempts.get(ip);
  if (attempt) {
    if (now - attempt.firstAttempt < ORDER_WINDOW_MS) {
      if (attempt.count >= ORDER_MAX_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many orders placed. Please try again later.' });
      }
      attempt.count++;
    } else {
      orderAttempts.set(ip, { count: 1, firstAttempt: now });
    }
  } else {
    orderAttempts.set(ip, { count: 1, firstAttempt: now });
  }

  // Input validation
  const { items, customerInfo, paymentMethod, finalTotal } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }
  if (!customerInfo?.fullName?.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  if (!customerInfo?.phone?.trim()) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  if (!customerInfo?.address?.trim()) {
    return res.status(400).json({ error: 'Delivery address is required.' });
  }
  if (!paymentMethod) {
    return res.status(400).json({ error: 'Payment method is required.' });
  }
  if (typeof finalTotal !== 'number' || finalTotal <= 0) {
    return res.status(400).json({ error: 'Invalid order total.' });
  }

  const order = { ...req.body, customerIp: ip, createdAt: new Date().toISOString(), status: 'pending' };
  const result = await db.collection('orders').insertOne(order);
  const orderId = result.insertedId.toString();

  // Send confirmation email to customer + alert to admin (non-blocking)
  sendOrderConfirmationEmail(order, orderId).catch(() => {});
  sendAdminNewOrderAlert(order, orderId).catch(() => {});

  res.status(201).json({ ...order, id: orderId });
});

app.get('/api/orders', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const orders = await db.collection('orders').find({}).toArray();
  res.json(orders.map((o: any) => ({ ...o, id: o._id.toString() })));
});

app.patch('/api/orders/:id/status', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { status, remark, fullPaid, refunded, sendEmail } = req.body;
  try {
    const update: any = {};
    if (status !== undefined) update.status = status;
    if (remark !== undefined) update.remark = remark;
    if (fullPaid !== undefined) update.fullPaid = fullPaid;
    if (refunded !== undefined) update.refunded = refunded;
    await db.collection('orders').updateOne({ _id: new ObjectId(id) }, { $set: update });
    const updated = await db.collection('orders').findOne({ _id: new ObjectId(id) });

    // Optionally send customer email for cancelled/delivered
    if (sendEmail && (status === 'cancelled' || status === 'delivered') && updated) {
      sendStatusEmail(updated, id, status).catch(() => {});
    }

    res.json({ ...updated, id: updated._id.toString() });
  } catch {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Cancel request (public — customer submits)
app.post('/api/orders/:id/cancel-request', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['delivered', 'cancelled'].includes(order.status)) return res.status(400).json({ error: 'Cannot request cancellation for this order' });
    await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { cancelRequest: { reason, requestedAt: new Date().toISOString() } } }
    );

    // Alert admin
    const apiKey = process.env.RESEND_API_KEY;
    const shortId = id.slice(-6).toUpperCase();
    if (apiKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Zantro Orders <orders@zantrobd.com>',
          to: process.env.ADMIN_EMAIL || 'store@zantrobd.com',
          subject: `⚠ Cancel Request — Order #${shortId}`,
          html: `<div style="font-family:sans-serif;padding:32px;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
            <h2 style="color:#dc2626;margin:0 0 16px;">⚠ Cancellation Request</h2>
            <p style="margin:0 0 8px;font-size:14px;"><strong>Order:</strong> #${shortId}</p>
            <p style="margin:0 0 8px;font-size:14px;"><strong>Customer:</strong> ${order.customerInfo?.fullName}</p>
            <p style="margin:0 0 8px;font-size:14px;"><strong>Phone:</strong> ${order.customerInfo?.phone}</p>
            <p style="margin:0 0 8px;font-size:14px;"><strong>Reason:</strong> ${reason}</p>
            <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">Go to your admin dashboard to review and take action.</p>
          </div>`,
        }),
      }).catch(() => {});
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to submit cancellation request' });
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

// Category name management (add / rename / delete)
app.get('/api/category-list', async (req, res) => {
  const doc = await db.collection('settings').findOne({ key: 'categoryList' });
  res.json(doc ? doc.categories : null); // null = use defaults
});

app.post('/api/category-list', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { categories } = req.body;
  if (!Array.isArray(categories)) return res.status(400).json({ error: 'categories must be an array' });
  await db.collection('settings').updateOne(
    { key: 'categoryList' },
    { $set: { key: 'categoryList', categories } },
    { upsert: true }
  );
  res.json({ ok: true, categories });
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

// ─── Translations ─────────────────────────────────────────────────────────────

app.get('/api/translations', async (req, res) => {
  const doc = await db.collection('settings').findOne({ key: 'translations' });
  res.json(doc ? doc.overrides : {});
});

app.post('/api/translations', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { overrides } = req.body;
  if (!overrides || typeof overrides !== 'object') return res.status(400).json({ error: 'Invalid payload' });
  await db.collection('settings').updateOne(
    { key: 'translations' },
    { $set: { key: 'translations', overrides } },
    { upsert: true }
  );
  res.json({ ok: true });
});

// ─── Payment Settings ────────────────────────────────────────────────────────

app.get('/api/settings/payment', async (req, res) => {
  const setting = await db.collection('settings').findOne({ key: 'paymentSettings' });
  if (setting) {
    const { _id, key, ...rest } = setting;
    res.json(rest);
  } else {
    res.json({
      cardEnabled: true, bkashEnabled: true, nagadEnabled: true, cryptoEnabled: true, bankEnabled: true, bkashNumber: '01922929033', nagadNumber: '01922929033',
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
  const { cardEnabled, bkashEnabled, nagadEnabled, cryptoEnabled, bankEnabled, bkashNumber, nagadNumber, bkashQr, binancePayQr, binancePayId, codEnabled, codDisabledForPreorder, cryptoAddresses } = req.body;
  const update = {
    cardEnabled: cardEnabled === true,
    bkashEnabled: bkashEnabled === true,
    nagadEnabled: nagadEnabled === true,
    cryptoEnabled: cryptoEnabled === true,
    bankEnabled: bankEnabled === true,
    codEnabled: codEnabled === true,
    codDisabledForPreorder: codDisabledForPreorder === true,
    bkashNumber: bkashNumber || '',
    nagadNumber: nagadNumber || '',
    bkashQr: bkashQr || '',
    binancePayQr: binancePayQr || '',
    binancePayId: binancePayId || '',
    cryptoAddresses: Array.isArray(cryptoAddresses) ? cryptoAddresses : [],
  };
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

// ─── Blocked IPs ───────────────────────────────────────────────────────────────

app.get('/api/blocked-ips', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const docs = await db.collection('blockedIPs').find({}).sort({ blockedAt: -1 }).toArray();
  res.json(docs.map((d: any) => ({ ...d, id: d._id.toString() })));
});

app.post('/api/blocked-ips', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP required' });
  const existing = await db.collection('blockedIPs').findOne({ ip });
  if (existing) return res.status(409).json({ error: 'IP already blocked' });
  const doc = { ip, blockedAt: new Date().toISOString() };
  const result = await db.collection('blockedIPs').insertOne(doc);
  blockedIPs.add(ip);
  res.status(201).json({ ...doc, id: result.insertedId.toString() });
});

app.delete('/api/blocked-ips/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  try {
    const doc = await db.collection('blockedIPs').findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await db.collection('blockedIPs').deleteOne({ _id: new ObjectId(id) });
    blockedIPs.delete(doc.ip);
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Not found' });
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



// ─── Media Library ────────────────────────────────────────────────────────────
app.get('/api/media', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const doc = await db.collection('settings').findOne({ key: 'mediaLibrary' });
  res.json(doc ? doc.items : []);
});

app.post('/api/media', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { url, type, name } = req.body;
  const item = { url, type, name, uploadedAt: new Date().toISOString() };
  await db.collection('settings').updateOne(
    { key: 'mediaLibrary' },
    { $push: { items: item } as any },
    { upsert: true }
  );
  res.json(item);
});

app.delete('/api/media', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { url } = req.body;
  await db.collection('settings').updateOne(
    { key: 'mediaLibrary' },
    { $pull: { items: { url } } as any }
  );
  res.json({ ok: true });
});

// ─── Recommended Products Settings ───────────────────────────────────────────
app.get('/api/settings/recommended', async (req, res) => {
  const doc = await db.collection('settings').findOne({ key: 'recommendedProducts' });
  res.json(doc ? doc.productIds : []);
});

app.post('/api/settings/recommended', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { productIds } = req.body;
  await db.collection('settings').updateOne(
    { key: 'recommendedProducts' },
    { $set: { key: 'recommendedProducts', productIds } },
    { upsert: true }
  );
  res.json({ productIds });
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
      paymentMethod: order.paymentMethod,
      selectedBank: order.selectedBank,
      preorderPayOption: order.preorderPayOption,
      preorderRemainingAmount: order.preorderRemainingAmount,
      fullPaid: order.fullPaid || false,
      isPreorderOrder: order.isPreorderOrder || false,
      cancelRequest: order.cancelRequest || null,
      items: order.items?.map((i: any) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image, isPreorder: i.isPreorder })),
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

// Order history by phone number (public — customer looks up their own orders)
app.get('/api/orders/by-phone/:phone', async (req, res) => {
  const rawPhone = (req.params.phone || '').trim();
  // Normalise: strip spaces/dashes, allow optional leading +88
  const phone = rawPhone.replace(/[\s\-]/g, '');
  if (!phone || phone.length < 7) return res.status(400).json({ error: 'Invalid phone number' });
  try {
    const all = await db.collection('orders').find({}).toArray();
    const matched = all.filter((o: any) => {
      const p = (o.customerInfo?.phone || '').replace(/[\s\-]/g, '');
      return p === phone || p.endsWith(phone) || phone.endsWith(p);
    });
    if (matched.length === 0) return res.status(404).json({ error: 'No orders found for this phone number' });
    const safe = matched
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((order: any) => ({
        id: order._id.toString(),
        status: order.status || 'pending',
        createdAt: order.createdAt,
        finalTotal: order.finalTotal,
        remark: order.remark || '',
        paymentMethod: order.paymentMethod,
        selectedBank: order.selectedBank,
        preorderPayOption: order.preorderPayOption,
        preorderRemainingAmount: order.preorderRemainingAmount,
        fullPaid: order.fullPaid || false,
        isPreorderOrder: order.isPreorderOrder || false,
        cancelRequest: order.cancelRequest || null,
        items: order.items?.map((i: any) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image, isPreorder: i.isPreorder })),
        customerInfo: {
          fullName: order.customerInfo?.fullName,
          phone: order.customerInfo?.phone,
          address: order.customerInfo?.address,
        },
      }));
    res.json(safe);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const ip = getIP(req);
  const now = Date.now();

  // Brute-force protection: max 10 attempts per IP per 15 minutes
  const attempt = loginAttempts.get(ip);
  if (attempt) {
    if (now - attempt.firstAttempt < LOGIN_WINDOW_MS) {
      if (attempt.count >= LOGIN_MAX_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
      }
      attempt.count++;
    } else {
      loginAttempts.set(ip, { count: 1, firstAttempt: now });
    }
  } else {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  }

  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'moumitanvir';
  const adminPassword = process.env.ADMIN_PASSWORD || 'riffbabatanvir69420@';
  if (username === adminUsername && password === adminPassword) {
    // Clear failed attempts on successful login
    loginAttempts.delete(ip);
    res.json({ token: 'admin-secret-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ─── Robots.txt ───────────────────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /cart\nDisallow: /order-tracking\nDisallow: /my\nSitemap: https://zantrobd.com/sitemap.xml');
});

// ─── Sitemap ──────────────────────────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await db.collection('products').find(
      {},
      { projection: { _id: 1, name: 1, category: 1, updatedAt: 1 } }
    ).toArray();

    const categories = await db.collection('categories').find(
      {},
      { projection: { name: 1 } }
    ).toArray();

    const now = new Date().toISOString().split('T')[0];

    const staticUrls = [
      { loc: 'https://zantrobd.com',               priority: '1.0', changefreq: 'daily',   lastmod: now },
      { loc: 'https://zantrobd.com/shop',           priority: '0.9', changefreq: 'daily',   lastmod: now },
      { loc: 'https://zantrobd.com/preorder',       priority: '0.8', changefreq: 'weekly',  lastmod: now },
      { loc: 'https://zantrobd.com/about',          priority: '0.6', changefreq: 'monthly', lastmod: now },
      { loc: 'https://zantrobd.com/contact',        priority: '0.6', changefreq: 'monthly', lastmod: now },
      { loc: 'https://zantrobd.com/faq',            priority: '0.5', changefreq: 'monthly', lastmod: now },
    ];

    const categoryUrls = categories.map((c: any) => ({
      loc: `https://zantrobd.com/shop?category=${encodeURIComponent(c.name)}`,
      priority: '0.7',
      changefreq: 'daily',
      lastmod: now,
    }));

    const productUrls = products.map((p: any) => ({
      loc: `https://zantrobd.com/product/${p._id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: p.updatedAt
        ? new Date(p.updatedAt).toISOString().split('T')[0]
        : now,
    }));

    const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
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

    // Product pages MUST be before express.static — otherwise static catches the request first
    app.get('/product/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const product = ObjectId.isValid(id)
          ? await db.collection('products').findOne({ _id: new ObjectId(id) })
          : null;

        const html = await fs.promises.readFile(path.join(distPath, 'index.html'), 'utf-8');

        if (!product) return res.send(html);

        const p = { ...product, id: product._id.toString() };
        const stock = p.stock;
        const isOutOfStock = stock !== undefined && stock === 0;
        const isPreorder = !!p.isPreorder;
        const preorderTiers: Array<{ label: string; price: number }> = p.preorderPriceTiers || [];
        const hasTiers = isPreorder && preorderTiers.length > 0;
        const reviews: any[] = p.customerReviews || [];
        const avgRating = reviews.length > 0
          ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
          : p.rating;

        const jsonLd = {
          '@context': 'https://schema.org/',
          '@type': p.isPreowned ? 'IndividualProduct' : 'Product',
          name: p.name,
          description: p.description || '',
          image: [...(p.images || []), p.image].filter(Boolean),
          url: `https://zantrobd.com/product/${p.id}`,
          sku: p.id,
          brand: { '@type': 'Brand', name: 'Zantro' },
          category: p.category,
          ...(avgRating ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: String(avgRating),
              reviewCount: String(reviews.length || p.reviewCount || 1),
              bestRating: '5',
              worstRating: '1',
            }
          } : {}),
          ...(reviews.length > 0 ? {
            review: reviews.slice(0, 5).map((r: any) => ({
              '@type': 'Review',
              author: { '@type': 'Person', name: r.name },
              reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5', worstRating: '1' },
              reviewBody: r.comment,
              datePublished: r.date,
            }))
          } : {}),
          offers: hasTiers
            ? preorderTiers.map(tier => ({
                '@type': 'Offer',
                name: tier.label,
                price: String(tier.price),
                priceCurrency: 'BDT',
                availability: 'https://schema.org/PreOrder',
                url: `https://zantrobd.com/product/${p.id}`,
                seller: { '@type': 'Organization', name: 'Zantro' },
              }))
            : {
                '@type': 'Offer',
                price: String(p.price),
                priceCurrency: 'BDT',
                availability: isOutOfStock
                  ? 'https://schema.org/OutOfStock'
                  : isPreorder
                  ? 'https://schema.org/PreOrder'
                  : 'https://schema.org/InStock',
                url: `https://zantrobd.com/product/${p.id}`,
                priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                seller: { '@type': 'Organization', name: 'Zantro' },
              },
        };

        const productImage = (p.images && p.images.length > 0 ? p.images[0] : p.image) || '';
        const productDesc = (p.description || '').replace(/[<>"&]/g, ' ').slice(0, 155);
        const productUrl = `https://zantrobd.com/product/${p.id}`;
        const productTitle = `${p.name} — Zantro`;

        // Remove all existing og:*, twitter:*, <title>, and <meta name="description"> tags
        // so the product-specific ones we inject are the ONLY ones platforms see
        let injected = html
          .replace(/<meta\s+property="og:[^"]*"[^>]*\/?>/gi, '')
          .replace(/<meta\s+property="twitter:[^"]*"[^>]*\/?>/gi, '')
          .replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?>/gi, '')
          .replace(/<meta\s+property="product:[^"]*"[^>]*\/?>/gi, '')
          .replace(/<meta\s+name="description"[^>]*\/?>/gi, '')
          .replace(/<title>[^<]*<\/title>/gi, '');

        // Inject product OG tags right after <head>
        const ogTags = `<title>${productTitle}</title>
    <meta name="description" content="${productDesc}" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${productTitle}" />
    <meta property="og:description" content="${productDesc}" />
    <meta property="og:image" content="${productImage}" />
    <meta property="og:image:secure_url" content="${productImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${productUrl}" />
    <meta property="og:site_name" content="Zantro" />
    <meta property="product:price:amount" content="${p.price}" />
    <meta property="product:price:currency" content="BDT" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${productTitle}" />
    <meta name="twitter:description" content="${productDesc}" />
    <meta name="twitter:image" content="${productImage}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

        injected = injected.replace('<head>', `<head>\n    ${ogTags}`);
        res.send(injected);
      } catch {
        const html = await fs.promises.readFile(path.join(distPath, 'index.html'), 'utf-8');
        res.send(html);
      }
    });

    // Static assets (JS, CSS, images) — after product route so /product/:id fires first
    app.use(express.static(distPath));

    // All other routes → SPA index.html
    app.get('*', (req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
  }
  app.listen(PORT, '0.0.0.0', () => { console.log(`Server running on http://localhost:${PORT}`); });
}

startServer();
