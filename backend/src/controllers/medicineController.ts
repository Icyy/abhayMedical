import { Response } from "express";
import prisma from "../prisma";

import { qs } from "../utils/query";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(qs(req.query.page)) || 1;
    const limit = parseInt(qs(req.query.limit)) || 10;
    const search = qs(req.query.search);
    const category = qs(req.query.category);
    const status = qs(req.query.status);

    const where: any = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (category) where.category = category;

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
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
      prisma.medicine.count({ where }),
    ]);

    // Compute derived fields for each medicine
    const enriched = medicines.map((med) => {
      const totalStock = med.batches.reduce((sum, b) => sum + b.stockUnits, 0);
      const today = new Date();
      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const nearestExpiry = med.batches
        .filter((b) => b.stockUnits > 0)
        .sort(
          (a, b) =>
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
        )[0];

      let computedStatus: string = "OK";
      if (totalStock === 0) computedStatus = "CRITICAL";
      else if (totalStock < 10 * med.unitsPerPack) computedStatus = "LOW";

      return {
        ...med,
        stock: totalStock,
        status: computedStatus,
        nearestExpiryDate: nearestExpiry?.expiryDate || null,
        expiringBatches: med.batches.filter(
          (b) => new Date(b.expiryDate) < in30Days && b.stockUnits > 0,
        ).length,
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
};

export const addMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      unit,
      packType,
      unitsPerPack,
      category,
      gstPercent,
      mrp,
      // batch details for first delivery
      batchNumber,
      manufacturingDate,
      expiryDate,
      purchasePrice,
      stockUnits,
      supplierId,
    } = req.body;

    const medicine = await prisma.medicine.create({
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

    res.status(201).json(medicine);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "A medicine with this name already exists" });
    }
    res.status(500).json({ error: "Failed to add medicine" });
  }
};

export const addBatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      batchNumber,
      manufacturingDate,
      expiryDate,
      purchasePrice,
      stockUnits,
      supplierId,
    } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid medicine ID format" });
    }

    const batch = await prisma.medicineBatch.create({
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
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Batch number already exists" });
    }
    res.status(500).json({ error: "Failed to add batch" });
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid medicine ID format" });
    }
    await prisma.medicineBatch.deleteMany({ where: { medicineId: id } });
    await prisma.medicine.delete({ where: { id } });
    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete medicine" });
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unit, packType, unitsPerPack, category, gstPercent, mrp } =
      req.body;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid medicine ID format" });
    }
    const medicine = await prisma.medicine.update({
      where: { id },
      data: { name, unit, packType, unitsPerPack, category, gstPercent, mrp },
      include: { batches: true },
    });

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: "Failed to update medicine" });
  }
};

export const reduceStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid medicine ID format" });
    }

    // FIFO - deduct from oldest batch first
    const batches = await prisma.medicineBatch.findMany({
      where: { medicineId: id, stockUnits: { gt: 0 } },
      orderBy: { expiryDate: "asc" },
    });

    let remaining = quantity;
    for (const batch of batches) {
      if (remaining <= 0) break;
      const deduct = Math.min(batch.stockUnits, remaining);
      await prisma.medicineBatch.update({
        where: { id: batch.id },
        data: { stockUnits: batch.stockUnits - deduct },
      });
      remaining -= deduct;
    }

    res.json({ message: "Stock reduced" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reduce stock" });
  }
};
