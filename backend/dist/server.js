"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// --- 1. PRISMA V7 ADAPTER IMPORTS ---
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const medicineRoutes_1 = __importDefault(require("./routes/medicineRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const prescriptionRoutes_1 = __importDefault(require("./routes/prescriptionRoutes"));
const supplierRoutes_1 = __importDefault(require("./routes/supplierRoutes"));
const purchaseOrderRoutes_1 = __importDefault(require("./routes/purchaseOrderRoutes"));
const reportsRoutes_1 = __importDefault(require("./routes/reportsRoutes"));
dotenv_1.default.config();
console.log("BOOT SEQUENCE STARTED");
// ==========================================
// 0. PRISMA V7 POOLER INITIALIZATION
// ==========================================
// This connects to your Supabase Pooler (Port 6543)
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase via the Node driver
});
const adapter = new adapter_pg_1.PrismaPg(pool);
// Export this instance so your route files can import it!
exports.prisma = new client_1.PrismaClient({ adapter });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
console.log(`starting server on ${PORT}`);
// ==========================================
// 1. PRODUCTION SECURITY & PROXY SETTINGS
// ==========================================
app.set("trust proxy", 1);
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);
// ==========================================
// 2. CORS CONFIGURATION (HARDENED)
// ==========================================
const allowedOrigins = [
    process.env.FRONTEND_URL?.replace(/\/$/, ""),
    "http://localhost:5173",
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.some((allowed) => origin === allowed)) {
            callback(null, true);
        }
        else {
            console.log("CORS blocked:", origin);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options(/(.*)/, (0, cors_1.default)());
// ==========================================
// 3. MIDDLEWARE & ROUTES
// ==========================================
app.use(express_1.default.json({ limit: "10mb" }));
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong' });
});
app.use((err, req, res, next) => {
    console.error("--- START ERROR LOG ---");
    console.error("Path:", req.path);
    console.error("Error Details:", err);
    console.error("--- END ERROR LOG ---");
    res.status(500).json({
        message: "Server Error",
        details: err.message || "Unknown error",
    });
});
app.get("/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/medicines", medicineRoutes_1.default);
app.use("/api/customers", customerRoutes_1.default);
app.use("/api/prescriptions", prescriptionRoutes_1.default);
app.use("/api/suppliers", supplierRoutes_1.default);
app.use("/api/purchase-orders", purchaseOrderRoutes_1.default);
app.use("/api/reports", reportsRoutes_1.default);
// ==========================================
// 4. ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    const isProd = process.env.NODE_ENV === "production";
    res.status(500).json({
        error: isProd ? "Internal Server Error" : err.message,
    });
});
// ==========================================
// 5. SERVER STARTUP & GRACEFUL SHUTDOWN
// ==========================================
const server = app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
server.on("error", (error) => {
    console.error("Fatal error starting server:", error);
});
// --- UPDATED: Graceful shutdown now safely disconnects Prisma ---
const shutdown = async () => {
    console.log("Shutting down server gracefully...");
    try {
        await exports.prisma.$disconnect();
        console.log("🔌 Database disconnected safely.");
    }
    catch (err) {
        console.error("Failed to disconnect database:", err);
    }
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
exports.default = app;
