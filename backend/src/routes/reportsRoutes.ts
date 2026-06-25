import { Router } from 'express'

import { authenticate } from '../middlewares/authMiddleware'
import { getDashboardStats, getPurchaseReport, getSalesReport } from '../controllers/reportsController'


const router = Router()

router.get('/dashboard', authenticate, getDashboardStats)
router.get('/sales', authenticate, getSalesReport)
router.get('/purchase', authenticate, getPurchaseReport)

export default router