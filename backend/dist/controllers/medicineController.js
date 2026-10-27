"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceStock = exports.updateMedicine = exports.deleteMedicine = exports.addBatch = exports.addMedicine = exports.getMedicines = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const query_1 = require("../utils/query");
const getMedicines = async (req, res) => {
    try {
        const page = parseInt((0, query_1.qs)(req.query.page)) || 1;
        const limit = parseInt((0, query_1.qs)(req.query.limit)) || 10;
        const search = (0, query_1.qs)(req.query.search);
        const category = (0, query_1.qs)(req.query.category);
        const status = (0, query_1.qs)(req.query.status);
        const where = {};
        if (search)
            where.name = { contains: search, mode: "insensitive" };
        if (category)
            where.category = category;
        const [medicines, total] = await Promise.all([
            prisma_1.default.medicine.findMany({
                where,
                include: {
                    batches: {
                        orderBy: { expiryDate: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.medicine.count({ where }),
        ]);
        // Compute derived fields for each medicine
        const enriched = medicines.map((med) => {
            const totalStock = med.batches.reduce((sum, b) => sum + b.stockUnits, 0);
            const today = new Date();
            const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
            const nearestExpiry = med.batches
                .filter((b) => b.stockUnits > 0)
                .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
            let computedStatus = "OK";
            if (totalStock === 0)
                computedStatus = "CRITICAL";
            else if (totalStock < 10 * med.unitsPerPack)
                computedStatus = "LOW";
            return {
                ...med,
                stock: totalStock,
                status: computedStatus,
                nearestExpiryDate: nearestExpiry?.expiryDate || null,
                expiringBatches: med.batches.filter((b) => new Date(b.expiryDate) < in30Days && b.stockUnits > 0).length,
            };
        });
        // Apply status filter after computing
        const filtered = status
            ? enriched.filter((m) => m.status === status)
            : enriched;
        res.json({
            medicines: filtered,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch medicines" });
    }
};
exports.getMedicines = getMedicines;
const addMedicine = async (req, res) => {
    try {
        const { name, unit, packType, unitsPerPack, category, gstPercent, mrp, batchNumber, manufacturingDate, expiryDate, purchasePrice, stockUnits, supplierId, } = req.body;
        // Check if medicine already exists by name
        let medicine = await prisma_1.default.medicine.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
            include: { batches: true },
        });
        if (medicine) {
            // Medicine exists - just add a new batch
            if (batchNumber) {
                const existingBatch = await prisma_1.default.medicineBatch.findUnique({
                    where: { batchNumber },
                });
                if (existingBatch) {
                    return res
                        .status(400)
                        .json({ error: `Batch number ${batchNumber} already exists` });
                }
                await prisma_1.default.medicineBatch.create({
                    data: {
                        medicineId: medicine.id,
                        batchNumber,
                        manufacturingDate: new Date(manufacturingDate),
                        expiryDate: new Date(expiryDate),
                        purchasePrice,
                        stockUnits: stockUnits || 0,
                        supplierId: supplierId || null,
                    },
                });
            }
            // Update medicine details if provided (mrp may have changed)
            medicine = await prisma_1.default.medicine.update({
                where: { id: medicine.id },
                data: { mrp, gstPercent, packType, unitsPerPack, category },
                include: { batches: true },
            });
        }
        else {
            // New medicine - create with first batch
            medicine = await prisma_1.default.medicine.create({
                data: {
                    name,
                    unit,
                    packType: packType || "strip",
                    unitsPerPack: unitsPerPack || 1,
                    category: category || "ALLOPATHIC",
                    gstPercent: gstPercent || 0,
                    mrp,
                    batches: batchNumber
                        ? {
                            create: [
                                {
                                    batchNumber,
                                    manufacturingDate: new Date(manufacturingDate),
                                    expiryDate: new Date(expiryDate),
                                    purchasePrice,
                                    stockUnits: stockUnits || 0,
                                    supplierId: supplierId || null,
                                },
                            ],
                        }
                        : undefined,
                },
                include: { batches: true },
            });
        }
        res.status(201).json(enrichMedicine(medicine));
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Batch number already exists" });
        }
        res.status(500).json({ error: "Failed to add medicine" });
    }
};
exports.addMedicine = addMedicine;
const addBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { batchNumber, manufacturingDate, expiryDate, purchasePrice, stockUnits, supplierId, } = req.body;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid medicine ID format" });
        }
        const batch = await prisma_1.default.medicineBatch.create({
            data: {
                medicineId: id,
                batchNumber,
                manufacturingDate: new Date(manufacturingDate),
                expiryDate: new Date(expiryDate),
                purchasePrice,
                stockUnits,
                supplierId: supplierId || null,
            },
        });
        res.status(201).json(batch);
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Batch number already exists" });
        }
        res.status(500).json({ error: "Failed to add batch" });
    }
};
exports.addBatch = addBatch;
const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid medicine ID format" });
        }
        await prisma_1.default.medicineBatch.deleteMany({ where: { medicineId: id } });
        await prisma_1.default.medicine.delete({ where: { id } });
        res.json({ message: "Medicine deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete medicine" });
    }
};
exports.deleteMedicine = deleteMedicine;
const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, unit, packType, unitsPerPack, category, gstPercent, mrp } = req.body;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid medicine ID format" });
        }
        const medicine = await prisma_1.default.medicine.update({
            where: { id },
            data: { name, unit, packType, unitsPerPack, category, gstPercent, mrp },
            include: { batches: true },
        });
        res.json(enrichMedicine(medicine));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update medicine" });
    }
};
exports.updateMedicine = updateMedicine;
const reduceStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid medicine ID format" });
        }
        // FIFO - deduct from oldest batch first
        const batches = await prisma_1.default.medicineBatch.findMany({
            where: { medicineId: id, stockUnits: { gt: 0 } },
            orderBy: { expiryDate: "asc" },
        });
        let remaining = quantity;
        for (const batch of batches) {
            if (remaining <= 0)
                break;
            const deduct = Math.min(batch.stockUnits, remaining);
            await prisma_1.default.medicineBatch.update({
                where: { id: batch.id },
                data: { stockUnits: batch.stockUnits - deduct },
            });
            remaining -= deduct;
        }
        res.json({ message: "Stock reduced" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reduce stock" });
    }
};
exports.reduceStock = reduceStock;
const enrichMedicine = (med) => {
    const totalStock = (med.batches || []).reduce((sum, b) => sum + b.stockUnits, 0);
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const activeBatches = (med.batches || []).filter((b) => b.stockUnits > 0);
    const nearestExpiry = activeBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
    let computedStatus = "OK";
    if (totalStock === 0)
        computedStatus = "CRITICAL";
    else if (totalStock < 10 * (med.unitsPerPack || 1))
        computedStatus = "LOW";
    return {
        ...med,
        stock: totalStock,
        status: computedStatus,
        nearestExpiryDate: nearestExpiry?.expiryDate || null,
        expiringBatches: activeBatches.filter((b) => new Date(b.expiryDate) < in30Days).length,
    };
};
