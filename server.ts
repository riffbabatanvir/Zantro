import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS } from './src/constants.js';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up uploads directory
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Simple file-based database for orders
const DB_FILE = path.join(__dirname, 'orders.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Initialize DB files if they don't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(PRODUCTS, null, 2));
}

const getProducts = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveProduct = (product: any) => {
  const products = getProducts();
  const newProduct = { ...product, id: Date.now().toString() };
  products.push(newProduct);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  return newProduct;
};

const getOrders = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const getMessages = () => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveOrder = (order: any) => {
  const orders = getOrders();
  const newOrder = { ...order, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'pending' };
  orders.push(newOrder);
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));
  return newOrder;
};

const saveMessage = (message: any) => {
  const messages = getMessages();
  const newMessage = { ...message, id: Date.now().toString(), createdAt: new Date().toISOString() };
  messages.push(newMessage);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  return newMessage;
};

// API Routes
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const files = req.files as Express.Multer.File[];
  const urls = files.map(file => `/uploads/${file.filename}`);
  
  res.json({ urls });
});

app.get('/api/products', (req, res) => {
  const products = getProducts();
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const product = req.body;
  const savedProduct = saveProduct(product);
  res.status(201).json(savedProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const updates = req.body;
  const products = getProducts();
  const productIndex = products.findIndex((p: any) => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products[productIndex] = { ...products[productIndex], ...updates };
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json(products[productIndex]);
});

app.delete('/api/products/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const products = getProducts();
  const productIndex = products.findIndex((p: any) => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

app.post('/api/messages', (req, res) => {
  const message = req.body;
  const savedMessage = saveMessage(message);
  res.status(201).json(savedMessage);
});

app.get('/api/messages', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const messages = getMessages();
  res.json(messages);
});

app.delete('/api/messages/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const messages = getMessages();
  const messageIndex = messages.findIndex((m: any) => m.id === id);
  
  if (messageIndex === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  messages.splice(messageIndex, 1);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  res.json({ success: true });
});

app.post('/api/orders', (req, res) => {
  const order = req.body;
  const savedOrder = saveOrder(order);
  res.status(201).json(savedOrder);
});

app.get('/api/orders', (req, res) => {
  // Simple auth check
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const orders = getOrders();
  res.json(orders);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const { status } = req.body;
  const orders = getOrders();
  const orderIndex = orders.findIndex((o: any) => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  orders[orderIndex].status = status;
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));
  res.json(orders[orderIndex]);
});

app.delete('/api/orders/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const orders = getOrders();
  const orderIndex = orders.findIndex((o: any) => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  orders.splice(orderIndex, 1);
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded admin credentials
  if (username === 'moumitanvir' && password === 'riffbabatanvir69420@') {
    res.json({ token: 'admin-secret-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

async function startServer() {
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
