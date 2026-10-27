"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicineController_1 = require("../controllers/medicineController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// all routes require authentication
router.get('/', authMiddleware_1.authenticate, medicineController_1.getMedicines);
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)('OWNER', 'ADMIN', 'EMPLOYEE'), medicineController_1.addMedicine);
router.put('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)('OWNER', 'ADMIN'), medicineController_1.updateMedicine);
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorizeRoles)('OWNER', 'ADMIN'), medicineController_1.deleteMedicine);
router.patch('/:id/reduce-stock', authMiddleware_1.authenticate, medicineController_1.reduceStock);
router.post('/:id/batches', authMiddleware_1.authenticate, medicineController_1.addBatch);
exports.default = router;
