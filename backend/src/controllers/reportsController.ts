import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalMedicines,
      lowStockCount,
      criticalCount,
      expiringCount,
      todayRevenue,
      monthRevenue,
      totalCustomers,
      pendingPrescriptions,
    ] = await Promise.all([
      prisma.medicine.count(),
      prisma.medicine.count({ where: { status: "LOW" } }),
      prisma.medicine.count({ where: { status: "CRITICAL" } }),
      prisma.medicine.count({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.prescription.aggregate({
        where: {
          status: "PAID",
          date: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { total: true },
      }),
      prisma.prescription.aggregate({
        where: {
          status: "PAID",
          date: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.customer.count(),
      prisma.prescription.count({ where: { status: "PENDING" } }),
    ]);

    res.json({
      totalMedicines,
      lowStockCount,
      criticalCount,
      expiringCount,
      todayRevenue: todayRevenue._sum.total || 0,
      monthRevenue: monthRevenue._sum.total || 0,
      totalCustomers,
      pendingPrescriptions,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getSalesReport = async (req: AuthRequest, res: Response) => {
  try {
    const month =
      parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [prescriptions, dailyRevenue] = await Promise.all([
      prisma.prescription.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          status: "PAID",
        },
        include: {
          customer: true,
          items: { include: { medicine: true } },
        },
        orderBy: { date: "desc" },
      }),
      prisma.prescription.groupBy({
        by: ["date"],
        where: {
          date: { gte: startDate, lte: endDate },
          status: "PAID",
        },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    const totalRevenue = prescriptions.reduce(
      (sum: number, p: any) => sum + p.total,
      0,
    );
    const totalGst = prescriptions.reduce(
      (sum: number, p: any) => sum + p.gstAmount,
      0,
    );

    const medicineRevenue: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};
    prescriptions.forEach((p: any) => {
      p.items.forEach((item: any) => {
        const name = item.medicine.name;
        if (!medicineRevenue[name]) {
          medicineRevenue[name] = { name, quantity: 0, revenue: 0 };
        }
        medicineRevenue[name].quantity += item.quantity;
        medicineRevenue[name].revenue += item.price * item.quantity;
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
  } catch (error) {
    res.status(500).json({ error: "Failed to generate sales report" });
  }
};

export const getPurchaseReport = async (req: AuthRequest, res: Response) => {
  try {
    const month =
      parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const orders = await prisma.purchaseOrder.findMany({
      where: {
        orderDate: { gte: startDate, lte: endDate },
        status: "RECEIVED",
      },
      include: {
        supplier: true,
        items: true,
      },
      orderBy: { orderDate: "desc" },
    });

    const totalSpend = orders.reduce(
      (sum: number, o: any) => sum + o.totalCost,
      0,
    );

    const supplierSpend: Record<
      string,
      { name: string; orders: number; spend: number }
    > = {};
    orders.forEach((o: any) => {
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
      supplierBreakdown: Object.values(supplierSpend).sort(
        (a, b) => b.spend - a.spend,
      ),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate purchase report" });
  }
};
