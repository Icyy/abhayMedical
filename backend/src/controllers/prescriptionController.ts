import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        customer: true,
        items: {
          include: { medicine: true },
        },
      },
      orderBy: { date: "desc" },
    });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

export const addPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { customerPhone, customerName, doctorName, notes, discount, items } =
      req.body;

    // validate stock first
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });
      if (!medicine) {
        return res.status(404).json({ error: `Medicine not found` });
      }
      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    let customer = await prisma.customer.findUnique({
      where: { phoneNumber: customerPhone },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phoneNumber: customerPhone,
          email: "",
          notes: "",
        },
      });
    }

    // calculate subtotal and GST per item, using each medicine's CURRENT gst rate at sale time
    let subTotal = 0;
    let gstAmount = 0;
    const itemsWithGst: {
      medicineId: string;
      quantity: number;
      price: number;
      gstPercent: number;
    }[] = [];

    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });
      if (medicine) {
        const lineTotal = medicine.price * item.quantity;
        const lineGst = lineTotal * (medicine.gstPercent / 100);
        subTotal += lineTotal;
        gstAmount += lineGst;
        itemsWithGst.push({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price,
          gstPercent: medicine.gstPercent,
        });
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
          create: itemsWithGst.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            price: item.price,
            gstPercent: item.gstPercent,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { medicine: true } },
      },
    });

    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });
      if (medicine) {
        const newStock = Math.max(0, medicine.stock - item.quantity);
        const newStatus =
          newStock === 0 ? "CRITICAL" : newStock < 10 ? "LOW" : "OK";
        await prisma.medicine.update({
          where: { id: item.medicineId },
          data: { stock: newStock, status: newStatus },
        });
      }
    }

    res.status(201).json(prescription);
  } catch (error) {
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

    const prescription = await prisma.prescription.update({
      where: { id },
      data: { status },
    });

    // if paid, award loyalty points
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

    await prisma.prescriptionItem.deleteMany({
      where: { prescriptionId: id },
    });

    await prisma.prescription.delete({ where: { id } });

    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete prescription" });
  }
};
