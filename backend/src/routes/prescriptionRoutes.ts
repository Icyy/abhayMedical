import { Router } from 'express'
import { getPrescriptions, addPrescription, updatePrescriptionStatus, deletePrescription } from '../controllers/prescriptionController'
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware'


const router = Router()

router.get('/', authenticate, getPrescriptions)
router.post('/', authenticate, addPrescription)
router.patch('/:id/status', authenticate, updatePrescriptionStatus)
router.delete('/:id', authenticate, authorizeRoles('OWNER', 'ADMIN'), deletePrescription)

export default router