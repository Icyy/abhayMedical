import { Router } from 'express'
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  addSupplierMedicine,
  comparePrices
} from '../controllers/supplierController'
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware'


const router = Router()

router.get('/', authenticate, getSuppliers)
router.post('/', authenticate, authorizeRoles('OWNER', 'ADMIN'), addSupplier)
router.put('/:id', authenticate, authorizeRoles('OWNER', 'ADMIN'), updateSupplier)
router.delete('/:id', authenticate, authorizeRoles('OWNER', 'ADMIN'), deleteSupplier)
router.post('/:id/medicines', authenticate, authorizeRoles('OWNER', 'ADMIN'), addSupplierMedicine)
router.get('/compare/:medicineName', authenticate, comparePrices)

export default router