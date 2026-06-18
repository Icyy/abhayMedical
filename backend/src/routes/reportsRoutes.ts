import { Router } from 'express'

import { authenticate } from '../middlewares/authMiddleware'
import { getDashboardStats } from '../controllers/reportsController'


const router = Router()

router.get('/dashboard', authenticate, getDashboardStats)

export default router