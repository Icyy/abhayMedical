import { Router } from 'express'
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, awardLoyaltyPoints } from '../controllers/customerController'
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware'

const router = Router()

router.get('/', authenticate, getCustomers)
router.post('/', authenticate, addCustomer)
router.put('/:id', authenticate, authorizeRoles('OWNER', 'ADMIN'), updateCustomer)
router.delete('/:id', authenticate, authorizeRoles('OWNER', 'ADMIN'), deleteCustomer)
router.post('/loyalty', authenticate, awardLoyaltyPoints)

export default router