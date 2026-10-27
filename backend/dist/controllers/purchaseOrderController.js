"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPurchaseOrder = exports.receivePurchaseOrder = exports.createPurchaseOrder = exports.getPurchaseOrders = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getPurchaseOrders = async (req, res) => {
    try {
        const orders = await prisma_1.default.purchaseOrder.findMany({
            include: {
                supplier: true,
                items: true,
            },
            orderBy: { orderDate: "desc" },
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
};
exports.getPurchaseOrders = getPurchaseOrders;
const createPurchaseOrder = async (req, res) => {
    try {
        const { supplierId, expectedDelivery, notes, items } = req.body;
        const totalCost = items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
        const order = await prisma_1.default.purchaseOrder.create({
            data: {
                supplierId,
                totalCost,
                expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
                notes,
                items: {
                    create: items.map((item) => ({
                        medicineName: item.medicineName,
                        batchNumber: item.batchNumber || null,
                        manufacturingDate: item.manufacturingDate
                            ? new Date(item.manufacturingDate)
                            : null,
                        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
                        quantity: item.quantity,
                        pricePerUnit: item.pricePerUnit,
                        sellingPrice: item.sellingPrice || null,
                        gstPercent: item.gstPercent || null,
                        totalPrice: item.quantity * item.pricePerUnit,
                    })),
                },
            },
            include: {
                supplier: true,
                items: true,
            },
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create purchase order" });
    }
};
exports.createPurchaseOrder = createPurchaseOrder;
const receivePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid customer ID format" });
        }
        const order = await prisma_1.default.purchaseOrder.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!order) {
            return res.status(404).json({ error: 'Purchase order not found' });
        }
        const updated = await prisma_1.default.purchaseOrder.update({
            where: { id },
            data: {
                status: 'RECEIVED',
                receivedDate: new Date()
            },
            include: {
                supplier: true,
                items: true
            }
        });
        for (const item of order.items) {
            // Find the medicine to get unitsPerPack
            const medicine = await prisma_1.default.medicine.findFirst({
                where: {
                    name: {
                        contains: item.medicineName,
                        mode: 'insensitive'
                    }
                }
            });
            if (medicine) {
                // item.quantity = number of strips/bottles ordered
                // stockUnits = individual tablets/ml = strips × unitsPerPack
                const stockUnitsToAdd = item.quantity * medicine.unitsPerPack;
                await prisma_1.default.medicineBatch.create({
                    data: {
                        medicineId: medicine.id,
                        batchNumber: item.batchNumber || `PO${Date.now()}`,
                        manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate) : new Date(),
                        expiryDate: item.expiryDate ? new Date(item.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        purchasePrice: item.pricePerUnit, // price per strip - stored as-is
                        stockUnits: stockUnitsToAdd, // converted to individual units
                        supplierId: order.supplierId
                    }
                });
            }
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to receive purchase order' });
    }
};
exports.receivePurchaseOrder = receivePurchaseOrder;
const cancelPurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid customer ID format" });
        }
        const order = await prisma_1.default.purchaseOrder.update({
            where: { id },
            data: { status: "CANCELLED" },
            include: {
                supplier: true,
                items: true,
            },
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to cancel purchase order" });
    }
};
exports.cancelPurchaseOrder = cancelPurchaseOrder;
