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

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'di4byoc2w',
  api_key: process.env.CLOUDINARY_API_KEY || '783818254271344',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'aln4avRCPy61woO7Acj5Up7ogIw',
});

// MongoDB setup
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Zantro:aSmjatd84Z61NY4k@cluster0.vphqqr7.mongodb.net/?appName=Cluster0';
const client = new MongoClient(MONGO_URI);
let db: any;

async function connectDB() {
  await client.connect();
  db = client.db('zantro');
  console.log('Connected to MongoDB');

  // Seed products if empty
  const productsCol = db.collection('products');
  const count = await productsCol.countDocuments();
  if (count === 0) {
    await productsCol.insertMany(PRODUCTS.map(p => ({ ...p, _id: undefined })));
    console.log('Seeded initial products');
  }
}

// Use memory storage - we'll stream to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Helper to upload buffer to Cloudinary
function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'zantro', public_id: `${Date.now()}-${filename}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Auth helper
const isAdmin = (req: any) => req.headers.authorization === 'Bearer admin-secret-token';

// Upload - now goes to Cloudinary
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  try {
    const files = req.files as Express.Multer.File[];
    const urls = await Promise.all(
      files.map(file => uploadToCloudinary(file.buffer, file.originalname))
    );
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
  const { status } = req.body;
  try {
    await db.collection('orders').updateOne({ _id: new ObjectId(id) }, { $set: { status } });
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

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'moumitanvir' && password === 'riffbabatanvir69420@') {
    res.json({ token: 'admin-secret-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

async function startServer() {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
