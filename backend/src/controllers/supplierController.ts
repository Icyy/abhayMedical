import { Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middlewares/authMiddleware'


export const getSuppliers = async (req: AuthRequest, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        medicines: true,
        purchaseOrders: {
          orderBy: { orderDate: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(suppliers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' })
  }
}

export const addSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { name, contactPerson, phone, email, address, gstNumber } = req.body

    const existing = await prisma.supplier.findUnique({
      where: { phone }
    })

    if (existing) {
      return res.status(400).json({ error: 'Supplier with this phone already exists' })
    }

    const supplier = await prisma.supplier.create({
      data: { name, contactPerson, phone, email, address, gstNumber }
    })

    res.status(201).json(supplier)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add supplier' })
  }
}

export const updateSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body

    const supplier = await prisma.supplier.update({
      where: { id },
      data
    })

    res.json(supplier)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' })
  }
}

export const deleteSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.supplier.delete({ where: { id } })

    res.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' })
  }
}

export const addSupplierMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { medicineName, pricePerUnit } = req.body

    const supplierMedicine = await prisma.supplierMedicine.upsert({
      where: {
        supplierId_medicineName: {
          supplierId: id,
          medicineName
        }
      },
      update: { pricePerUnit },
      create: { supplierId: id, medicineName, pricePerUnit }
    })

    res.json(supplierMedicine)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add medicine to supplier' })
  }
}

export const comparePrices = async (req: AuthRequest, res: Response) => {
  try {
    const { medicineName } = req.params

    const prices = await prisma.supplierMedicine.findMany({
      where: {
        medicineName: {
          contains: medicineName,
          mode: 'insensitive'
        }
      },
      include: { supplier: true },
      orderBy: { pricePerUnit: 'asc' }
    })

    res.json(prices)
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare prices' })
  }
}