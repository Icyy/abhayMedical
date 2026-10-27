"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardLoyaltyPoints = exports.deleteCustomer = exports.updateCustomer = exports.addCustomer = exports.getCustomers = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const query_1 = require("../utils/query");
const getCustomers = async (req, res) => {
    try {
        const search = (0, query_1.qs)(req.query.search);
        const page = parseInt((0, query_1.qs)(req.query.page)) || 1;
        const limit = parseInt((0, query_1.qs)(req.query.limit)) || 50;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { phoneNumber: { contains: search } },
            ];
        }
        const [customers, total] = await Promise.all([
            prisma_1.default.customer.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.customer.count({ where }),
        ]);
        res.json({ customers, total, page, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch customers" });
    }
};
exports.getCustomers = getCustomers;
const addCustomer = async (req, res) => {
    try {
        const { name, phoneNumber, email, notes } = req.body;
        const existing = await prisma_1.default.customer.findUnique({
            where: { phoneNumber },
        });
        if (existing) {
            return res
                .status(400)
                .json({ error: "Customer with this phone number already exists" });
        }
        const customer = await prisma_1.default.customer.create({
            data: { name, phoneNumber, email, notes },
        });
        res.status(201).json(customer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to add customer" });
    }
};
exports.addCustomer = addCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid customer ID format" });
        }
        const customer = await prisma_1.default.customer.update({
            where: { id },
            data,
        });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid customer ID format" });
        }
        await prisma_1.default.customer.delete({ where: { id } });
        res.json({ message: "Customer deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete customer" });
    }
};
exports.deleteCustomer = deleteCustomer;
const awardLoyaltyPoints = async (req, res) => {
    try {
        const { phoneNumber, name, spendAmount } = req.body;
        const pointsEarned = Math.floor(spendAmount / 100);
        const existing = await prisma_1.default.customer.findUnique({
            where: { phoneNumber },
        });
        if (existing) {
            const customer = await prisma_1.default.customer.update({
                where: { phoneNumber },
                data: {
                    loyaltyPoints: existing.loyaltyPoints + pointsEarned,
                    totalSpend: existing.totalSpend + spendAmount,
                },
            });
            return res.json(customer);
        }
        const customer = await prisma_1.default.customer.create({
            data: {
                name,
                phoneNumber,
                loyaltyPoints: pointsEarned,
                totalSpend: spendAmount,
                email: "",
                notes: "",
            },
        });
        res.status(201).json(customer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to award loyalty points" });
    }
};
exports.awardLoyaltyPoints = awardLoyaltyPoints;
