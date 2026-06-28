import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

// --- 1. PRISMA V7 ADAPTER IMPORTS ---
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client' 

// Routes
import authRoutes from './routes/authRoutes'
import medicineRoutes from './routes/medicineRoutes'
import customerRoutes from './routes/customerRoutes'
import prescriptionRoutes from './routes/prescriptionRoutes'
import supplierRoutes from './routes/supplierRoutes'
import purchaseOrderRoutes from './routes/purchaseOrderRoutes'
import reportsRoutes from './routes/reportsRoutes'

dotenv.config()
console.log("🔥 BOOT SEQUENCE STARTED");
// ==========================================
// 0. PRISMA V7 POOLER INITIALIZATION
// ==========================================
// This connects to your Supabase Pooler (Port 6543)
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase via the Node driver
});
const adapter = new PrismaPg(pool)

// Export this instance so your route files can import it!
export const prisma = new PrismaClient({ adapter })

const app = express()
const PORT = process.env.PORT || 5000

// ==========================================
// 1. PRODUCTION SECURITY & PROXY SETTINGS
// ==========================================
app.set('trust proxy', 1)
app.use(helmet())
app.use(compression())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api', limiter)

// ==========================================
// 2. CORS CONFIGURATION (HARDENED)
// ==========================================
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
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

app.options(/(.*)/, cors())

// ==========================================
// 3. MIDDLEWARE & ROUTES
// ==========================================
app.use(express.json({ limit: '10mb' }))

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// --- UPDATED: Graceful shutdown now safely disconnects Prisma ---
const shutdown = async () => { 
  console.log('🛑 Shutting down server gracefully...')
  
  try {
    await prisma.$disconnect()
    console.log('🔌 Database disconnected safely.')
  } catch (err) {
    console.error('Failed to disconnect database:', err)
  }

  server.close(() => {
    console.log('✅ HTTP server closed.')
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
  process.exit(1)
})

export default app