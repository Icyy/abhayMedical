import { Router } from 'express'
import { getMedicines, addMedicine, updateMedicine, deleteMedicine, reduceStock, updateMedicineStatus, addBatch } from '../controllers/medicineController'
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware'


const router = Router()

// all routes require authentication
router.get('/', authenticate, getMedicines)
router.post('/', authenticate, authorizeRoles('OWNER', 'ADMIN', 'EMPLOYEE'), addMedicine)
router.put('/:id', authenticate, authorizeRoles('OWNER', 'ADMIN'), updateMedicine)
router.delete('/:id', authenticate, authorizeRoles('OWNER', 'ADMIN'), deleteMedicine)
router.patch('/:id/reduce-stock', authenticate, reduceStock)
router.patch('/:id/status', authenticate, updateMedicineStatus)
router.post('/:id/batches', authenticate, addBatch)

export default router