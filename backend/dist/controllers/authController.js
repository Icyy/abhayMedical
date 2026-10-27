"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const register = async (req, res) => {
    try {
        const { name, phone, password, role } = req.body;
        // check if user already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { phone }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this phone already exists' });
        }
        // hash the password - never store plain text passwords
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // create the user
        const user = await prisma_1.default.user.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                role: role || 'EMPLOYEE'
            }
        });
        // generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        // find user by phone
        const user = await prisma_1.default.user.findUnique({
            where: { phone }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid phone or password' });
        }
        // compare password with hashed version
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid phone or password' });
        }
        // generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, name: true, phone: true, role: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getMe = getMe;
