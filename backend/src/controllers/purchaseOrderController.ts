import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getPurchaseOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: true,
      },
      orderBy: { orderDate: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId, expectedDelivery, notes, items } = req.body;

    const totalCost = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.pricePerUnit,
      0,
    );

    const order = await prisma.purchaseOrder.create({
      data: {
        supplierId,
        totalCost,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        notes,
        items: {
          create: items.map((item: any) => ({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to create purchase order" });
  }
};

export const receivePurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }

    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: "RECEIVED",
        receivedDate: new Date(),
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    for (const item of order.items) {
      const medicine = await prisma.medicine.findFirst({
        where: {
          name: {
            contains: item.medicineName,
            mode: "insensitive",
          },
        },
      });

      if (medicine) {
        const newStock = medicine.stock + item.quantity;
        const newStatus =
          newStock === 0 ? "CRITICAL" : newStock < 10 ? "LOW" : "OK";
        await prisma.medicine.update({
          where: { id: medicine.id },
          data: { stock: newStock, status: newStatus },
        });
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to receive purchase order" });
  }
};

export const cancelPurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        supplier: true,
        items: true,
      },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel purchase order" });
  }
};
