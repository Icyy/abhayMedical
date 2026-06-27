import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { qs } from "../utils/query";

export const getMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(qs(req.query.page)) || 1;
    const limit = parseInt(qs(req.query.limit)) || 10;
    const search = qs(req.query.search);
    const category = qs(req.query.category);
    const status = qs(req.query.status);

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.medicine.count({ where }),
    ]);

    res.json({
      medicines,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
};

export const addMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      unit,
      gstPercent,
      category,
      manufacturingDate,
      expiryDate,
      purchasePrice,
      price,
      stock,
      batchNumber,
      status,
    } = req.body;

    const medicine = await prisma.medicine.create({
      data: {
        name,
        unit,
        gstPercent,
        category,
        manufacturingDate: new Date(manufacturingDate),
        expiryDate: new Date(expiryDate),
        purchasePrice,
        price,
        stock,
        batchNumber,
        status: status || "OK",
      },
    });

    res.status(201).json(medicine);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "A medicine with this batch number already exists" });
    }
    res.status(500).json({ error: "Failed to add medicine" });
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...data,
        manufacturingDate: data.manufacturingDate
          ? new Date(data.manufacturingDate)
          : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: "Failed to update medicine" });
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.medicine.delete({
      where: { id },
    });

    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete medicine" });
  }
};

export const reduceStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const medicine = await prisma.medicine.findUnique({ where: { id } });

    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const newStock = Math.max(0, medicine.stock - quantity);
    const newStatus =
      newStock === 0 ? "CRITICAL" : newStock < 10 ? "LOW" : "OK";

    const updated = await prisma.medicine.update({
      where: { id },
      data: { stock: newStock, status: newStatus },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to reduce stock" });
  }
};

export const updateMedicineStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const medicine = await prisma.medicine.update({
      where: { id },
      data: { status },
    });

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: "Failed to update medicine status" });
  }
};
