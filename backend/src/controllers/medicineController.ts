import { Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middlewares/authMiddleware'


export const getMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(medicines)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines' })
  }
}

export const addMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, unit, manufacturingDate, expiryDate, price, stock, batchNumber, status } = req.body

    const medicine = await prisma.medicine.create({
      data: {
        name,
        unit,
        manufacturingDate: new Date(manufacturingDate),
        expiryDate: new Date(expiryDate),
        price,
        stock,
        batchNumber,
        status: status || 'OK'
      }
    })

    res.status(201).json(medicine)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A medicine with this batch number already exists' })
    }
    res.status(500).json({ error: 'Failed to add medicine' })
  }
}

export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...data,
        manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      }
    })

    res.json(medicine)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update medicine' })
  }
}

export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.medicine.delete({
      where: { id }
    })

    res.json({ message: 'Medicine deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete medicine' })
  }
}

export const reduceStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    const medicine = await prisma.medicine.findUnique({ where: { id } })

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' })
    }

    const newStock = Math.max(0, medicine.stock - quantity)
    const newStatus = newStock === 0 ? 'CRITICAL' : newStock < 10 ? 'LOW' : 'OK'

    const updated = await prisma.medicine.update({
      where: { id },
      data: { stock: newStock, status: newStatus }
    })

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Failed to reduce stock' })
  }
}