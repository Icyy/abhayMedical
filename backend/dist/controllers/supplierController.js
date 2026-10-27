"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePrices = exports.addSupplierMedicine = exports.deleteSupplier = exports.updateSupplier = exports.addSupplier = exports.getSuppliers = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await prisma_1.default.supplier.findMany({
            include: {
                medicines: true,
                purchaseOrders: {
                    orderBy: { orderDate: 'desc' },
                    take: 5
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(suppliers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
};
exports.getSuppliers = getSuppliers;
const addSupplier = async (req, res) => {
    try {
        const { name, contactPerson, phone, email, address, gstNumber } = req.body;
        const existing = await prisma_1.default.supplier.findUnique({
            where: { phone }
        });
        if (existing) {
            return res.status(400).json({ error: 'Supplier with this phone already exists' });
        }
        const supplier = await prisma_1.default.supplier.create({
            data: { name, contactPerson, phone, email, address, gstNumber }
        });
        res.status(201).json(supplier);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add supplier' });
    }
};
exports.addSupplier = addSupplier;
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid customer ID format" });
        }
        const supplier = await prisma_1.default.supplier.update({
            where: { id },
            data
        });
        res.json(supplier);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update supplier' });
    }
};
exports.updateSupplier = updateSupplier;
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid customer ID format" });
        }
        await prisma_1.default.supplier.delete({ where: { id } });
        res.json({ message: 'Supplier deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
};
exports.deleteSupplier = deleteSupplier;
const addSupplierMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const { medicineName, pricePerUnit } = req.body;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid customer ID format" });
        }
        const supplierMedicine = await prisma_1.default.supplierMedicine.upsert({
            where: {
                supplierId_medicineName: {
                    supplierId: id,
                    medicineName
                }
            },
            update: { pricePerUnit },
            create: { supplierId: id, medicineName, pricePerUnit }
        });
        res.json(supplierMedicine);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add medicine to supplier' });
    }
};
exports.addSupplierMedicine = addSupplierMedicine;
const comparePrices = async (req, res) => {
    try {
        const { medicineName } = req.params;
        if (typeof medicineName !== "string") {
            return res.status(400).json({ error: "Invalid medicine name format" });
        }
        const prices = await prisma_1.default.supplierMedicine.findMany({
            where: {
                medicineName: {
                    contains: medicineName,
                    mode: 'insensitive'
                }
            },
            include: { supplier: true },
            orderBy: { pricePerUnit: 'asc' }
        });
        res.json(prices);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to compare prices' });
    }
};
exports.comparePrices = comparePrices;
