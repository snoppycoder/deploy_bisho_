import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import next from 'next';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3001;

app.prepare().then(() => {
  const server = express();

  // CORS middleware
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Proxy API requests to the backend
  server.use('/api', createProxyMiddleware({
    target: process.env.BACKEND_URL || 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api', // Keep the /api prefix
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ 
        error: 'Backend service unavailable',
        message: 'The backend service is not running or has an error. Please check if the backend is started on port 3000.'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.url} to backend`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Backend responded with status: ${proxyRes.statusCode}`);
    }
  }));

  // Handle all other requests with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> API requests will be proxied to http://localhost:3000`);
    console.log(`> Make sure the backend is running on port 3000`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
}); 