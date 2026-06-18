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

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/medicines', medicineRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/purchase-orders', purchaseOrderRoutes)
app.use('/api/reports', reportsRoutes)


app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Abhay Medical API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app