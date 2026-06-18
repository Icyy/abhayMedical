import { Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middlewares/authMiddleware'


export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        customer: true,
        items: {
          include: { medicine: true }
        }
      },
      orderBy: { date: 'desc' }
    })
    res.json(prescriptions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' })
  }
}

export const addPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { customerPhone, customerName, doctorName, notes, discount, items } = req.body

    // find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phoneNumber: customerPhone }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phoneNumber: customerPhone,
          email: '',
          notes: ''
        }
      })
    }

    // calculate totals
    let subTotal = 0
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId }
      })
      if (medicine) {
        subTotal += medicine.price * item.quantity
      }
    }

    const total = subTotal - (subTotal * discount / 100)

    // create prescription with items
    const prescription = await prisma.prescription.create({
      data: {
        customerId: customer.id,
        doctorName,
        notes,
        discount,
        subTotal,
        total,
        items: {
          create: items.map((item: { medicineId: string, quantity: number, price: number }) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: { medicine: true }
        }
      }
    })

    // reduce stock for each medicine
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId }
      })
      if (medicine) {
        const newStock = Math.max(0, medicine.stock - item.quantity)
        const newStatus = newStock === 0 ? 'CRITICAL' : newStock < 10 ? 'LOW' : 'OK'
        await prisma.medicine.update({
          where: { id: item.medicineId },
          data: { stock: newStock, status: newStatus }
        })
      }
    }

    res.status(201).json(prescription)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prescription' })
  }
}

export const updatePrescriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const prescription = await prisma.prescription.update({
      where: { id },
      data: { status }
    })

    // if paid, award loyalty points
    if (status === 'PAID') {
      const pointsEarned = Math.floor(prescription.total / 100)
      await prisma.customer.update({
        where: { id: prescription.customerId },
        data: {
          loyaltyPoints: { increment: pointsEarned },
          totalSpend: { increment: prescription.total }
        }
      })
    }

    res.json(prescription)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prescription status' })
  }
}

export const deletePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.prescriptionItem.deleteMany({
      where: { prescriptionId: id }
    })

    await prisma.prescription.delete({ where: { id } })

    res.json({ message: 'Prescription deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prescription' })
  }
}