import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

// Routes
import authRoutes from './routes/authRoutes'
import medicineRoutes from './routes/medicineRoutes'
import customerRoutes from './routes/customerRoutes'
import prescriptionRoutes from './routes/prescriptionRoutes'
import supplierRoutes from './routes/supplierRoutes'
import purchaseOrderRoutes from './routes/purchaseOrderRoutes'
import reportsRoutes from './routes/reportsRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ==========================================
// 1. PRODUCTION SECURITY & PROXY SETTINGS
// ==========================================
// Trust the reverse proxy (Crucial for Render/Railway so rate limiting works)
app.set('trust proxy', 1)

// Add basic security headers
app.use(helmet())

// Compress responses (makes your API much faster)
app.use(compression())

// Rate limiting (prevents API spam / basic DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api', limiter)

// ==========================================
// 2. CORS CONFIGURATION (HARDENED)
// ==========================================
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // Strips trailing slash safely
  'http://localhost:5173',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    
    // Strict match instead of startsWith for security
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.error(`🚨 CORS Blocked: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

// Explicitly handle preflight requests
app.options(/(.*)/, cors())

// ==========================================
// 3. MIDDLEWARE & ROUTES
// ==========================================
app.use(express.json({ limit: '10mb' })) // Added limit to prevent giant payload crashes

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Force a log to the terminal, even if it's a "silent" error
  console.error('--- START ERROR LOG ---');
  console.error('Path:', req.path);
  console.error('Error Details:', err);
  console.error('--- END ERROR LOG ---');
  
  res.status(500).json({ 
    message: 'Server Error', 
    details: err.message || 'Unknown error' 
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV })
})

app.use('/api/auth', authRoutes)
app.use('/api/medicines', medicineRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/purchase-orders', purchaseOrderRoutes)
app.use('/api/reports', reportsRoutes)

// ==========================================
// 4. ERROR HANDLING
// ==========================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 Unhandled error:', err)
  
  // Don't leak stack traces in production
  const isProd = process.env.NODE_ENV === 'production'
  res.status(500).json({ 
    error: isProd ? 'Internal Server Error' : err.message 
  })
})

// ==========================================
// 5. SERVER STARTUP & GRACEFUL SHUTDOWN
// ==========================================
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
server.on('error', (error) => {
  console.error('Fatal error starting server:', error);
});

// Graceful shutdown (Prevents database corruption when Render/Railway restarts the server)
const shutdown = () => {
  console.log('🛑 Shutting down server gracefully...')
  server.close(() => {
    console.log('HTTP server closed.')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error)
  process.exit(1) // Always exit on uncaught exceptions
})

export default app