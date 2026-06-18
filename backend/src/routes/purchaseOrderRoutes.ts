import { Router } from 'express'
import {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder
} from '../controllers/purchaseOrderController'
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware'


const router = Router()

router.get('/', authenticate, getPurchaseOrders)
router.post('/', authenticate, authorizeRoles('OWNER', 'ADMIN'), createPurchaseOrder)
router.patch('/:id/receive', authenticate, authorizeRoles('OWNER', 'ADMIN'), receivePurchaseOrder)
router.patch('/:id/cancel', authenticate, authorizeRoles('OWNER', 'ADMIN'), cancelPurchaseOrder)

export default router