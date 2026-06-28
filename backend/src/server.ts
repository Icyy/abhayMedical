import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// app.options('*', cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/medicines', medicineRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/purchase-orders', purchaseOrderRoutes)
app.use('/api/reports', reportsRoutes)


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Something went wrong' })
})

// Prevent unhandled promise rejections from crashing the server
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})

export default app