"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchaseReport = exports.getSalesReport = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const [totalMedicines, todayRevenue, monthRevenue, totalCustomers, pendingPrescriptions, expiringBatches,] = await Promise.all([
            prisma_1.default.medicine.count(),
            prisma_1.default.prescription.aggregate({
                where: { status: "PAID", date: { gte: startOfDay, lte: endOfDay } },
                _sum: { total: true },
            }),
            prisma_1.default.prescription.aggregate({
                where: { status: "PAID", date: { gte: startOfMonth } },
                _sum: { total: true },
            }),
            prisma_1.default.customer.count(),
            prisma_1.default.prescription.count({ where: { status: "PENDING" } }),
            prisma_1.default.medicineBatch.count({
                where: { expiryDate: { lte: in30Days }, stockUnits: { gt: 0 } },
            }),
        ]);
        // Compute low/critical by aggregating batch stock per medicine
        const medicinesWithStock = await prisma_1.default.medicine.findMany({
            include: {
                batches: { where: { stockUnits: { gt: 0 } } },
            },
        });
        const LOW_THRESHOLD = 10;
        let lowStockCount = 0;
        let criticalCount = 0;
        medicinesWithStock.forEach((med) => {
            const totalStock = med.batches.reduce((sum, b) => sum + b.stockUnits, 0);
            if (totalStock === 0)
                criticalCount++;
            else if (totalStock < LOW_THRESHOLD * med.unitsPerPack)
                lowStockCount++;
        });
        res.json({
            totalMedicines,
            lowStockCount,
            criticalCount,
            expiringCount: expiringBatches,
            todayRevenue: todayRevenue._sum.total || 0,
            monthRevenue: monthRevenue._sum.total || 0,
            totalCustomers,
            pendingPrescriptions,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};
exports.getDashboardStats = getDashboardStats;
const getSalesReport = async (req, res) => {
    try {
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const [prescriptions, dailyRevenue] = await Promise.all([
            prisma_1.default.prescription.findMany({
                where: {
                    date: { gte: startDate, lte: endDate },
                },
                include: {
                    customer: true,
                    items: { include: { medicine: true } },
                },
                orderBy: { date: "desc" },
            }),
            prisma_1.default.prescription.groupBy({
                by: ["date"],
                where: {
                    date: { gte: startDate, lte: endDate },
                },
                _sum: { total: true },
                _count: { id: true },
            }),
        ]);
        const totalRevenue = prescriptions.reduce((sum, p) => sum + (p.total || 0), 0);
        const totalGst = prescriptions.reduce((sum, p) => sum + (p.gstAmount || 0), 0);
        const medicineRevenue = {};
        prescriptions.forEach((p) => {
            p.items.forEach((item) => {
                const name = item.medicine?.name || "Unknown";
                const price = item.pricePerUnit || item.price || 0;
                if (!medicineRevenue[name]) {
                    medicineRevenue[name] = { name, quantity: 0, revenue: 0 };
                }
                medicineRevenue[name].quantity += item.quantity;
                medicineRevenue[name].revenue += price * item.quantity;
            });
        });
        const topMedicines = Object.values(medicineRevenue)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
        res.json({
            month,
            year,
            totalRevenue,
            totalGst,
            prescriptionCount: prescriptions.length,
            dailyRevenue,
            topMedicines,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate sales report" });
    }
};
exports.getSalesReport = getSalesReport;
const getPurchaseReport = async (req, res) => {
    try {
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const orders = await prisma_1.default.purchaseOrder.findMany({
            where: {
                orderDate: { gte: startDate, lte: endDate },
            },
            include: {
                supplier: true,
                items: true,
            },
            orderBy: { orderDate: "desc" },
        });
        const totalSpend = orders.reduce((sum, o) => sum + o.totalCost, 0);
        const supplierSpend = {};
        orders.forEach((o) => {
            const name = o.supplier?.name || "Unknown";
            if (!supplierSpend[name]) {
                supplierSpend[name] = { name, orders: 0, spend: 0 };
            }
            supplierSpend[name].orders += 1;
            supplierSpend[name].spend += o.totalCost;
        });
        res.json({
            month,
            year,
            totalSpend,
            orderCount: orders.length,
            orders,
            supplierBreakdown: Object.values(supplierSpend).sort((a, b) => b.spend - a.spend),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate purchase report" });
    }
};
exports.getPurchaseReport = getPurchaseReport;
