import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { qs } from "../utils/query";

export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(qs(req.query.page)) || 1;
    const limit = parseInt(qs(req.query.limit)) || 10;
    const search = qs(req.query.search);
    const status = qs(req.query.status);

    const where: any = {};

    if (search) {
      where.customer = {
        name: { contains: search, mode: "insensitive" },
      };
    }
    if (status) {
      where.status = status;
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          customer: true,
          items: { include: { medicine: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.prescription.count({ where }),
    ]);

    res.json({
      prescriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

export const addPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { customerPhone, customerName, doctorName, notes, discount, items } =
      req.body;

    // Validate stock across batches
    for (const item of items) {
      const batches = await prisma.medicineBatch.findMany({
        where: { medicineId: item.medicineId, stockUnits: { gt: 0 } },
        orderBy: { expiryDate: "asc" },
      });
      const totalStock = batches.reduce((sum, b) => sum + b.stockUnits, 0);
      if (totalStock < item.quantity) {
        const medicine = await prisma.medicine.findUnique({
          where: { id: item.medicineId },
        });
        return res.status(400).json({
          error: `Insufficient stock for ${medicine?.name}. Available: ${totalStock} units, Requested: ${item.quantity}`,
        });
      }
    }

    // Find or create customer - walk-in if no phone provided
    let customer;
    if (customerPhone && customerPhone.trim()) {
      customer = await prisma.customer.findUnique({
        where: { phoneNumber: customerPhone },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName || "Walk-in Customer",
            phoneNumber: customerPhone,
            email: "",
            notes: "",
          },
        });
      }
    } else {
      // Walk-in sale - find or create generic walk-in customer
      customer = await prisma.customer.findUnique({
        where: { phoneNumber: "0000000000" },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: "Walk-in Customer",
            phoneNumber: "0000000000",
            email: "",
            notes:
              "Generic walk-in customer for sales without customer details",
          },
        });
      }
    }

    // Calculate totals
    let subTotal = 0;
    let gstAmount = 0;

    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });
      if (medicine) {
        const lineTotal = (item.price || 0) * item.quantity; // item.price not item.pricePerUnit
        const lineGst = lineTotal * (medicine.gstPercent / 100);
        subTotal += lineTotal;
        gstAmount += lineGst;
      }
    }

    const discountedSubTotal = subTotal - (subTotal * discount) / 100;
    const total = discountedSubTotal + gstAmount;

    const prescription = await prisma.prescription.create({
      data: {
        customerId: customer.id,
        doctorName,
        notes,
        discount,
        subTotal,
        gstAmount,
        total,
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            pricePerUnit: item.price,
            gstPercent: item.gstPercent || 0,
            sellAsPackOf: item.sellAsPackOf || 1,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { medicine: true } },
      },
    });

    // FIFO stock deduction across batches
    for (const item of items) {
      const batches = await prisma.medicineBatch.findMany({
        where: { medicineId: item.medicineId, stockUnits: { gt: 0 } },
        orderBy: { expiryDate: "asc" },
      });
      let remaining = item.quantity;
      for (const batch of batches) {
        if (remaining <= 0) break;
        const deduct = Math.min(batch.stockUnits, remaining);
        await prisma.medicineBatch.update({
          where: { id: batch.id },
          data: { stockUnits: batch.stockUnits - deduct },
        });
        remaining -= deduct;
      }
    }

    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create prescription" });
  }
};

export const updatePrescriptionStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }

    const prescription = await prisma.prescription.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: { include: { medicine: true } },
      },
    });

    if (status === "PAID") {
      const pointsEarned = Math.floor(prescription.total / 100);
      await prisma.customer.update({
        where: { id: prescription.customerId },
        data: {
          loyaltyPoints: { increment: pointsEarned },
          totalSpend: { increment: prescription.total },
        },
      });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: "Failed to update prescription status" });
  }
};
export const deletePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }

    await prisma.prescriptionItem.deleteMany({
      where: { prescriptionId: id },
    });

    await prisma.prescription.delete({ where: { id } });

    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete prescription" });
  }
};
