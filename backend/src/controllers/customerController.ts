import { Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middlewares/authMiddleware'


export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(customers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' })
  }
}

export const addCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phoneNumber, email, notes } = req.body

    const existing = await prisma.customer.findUnique({
      where: { phoneNumber }
    })

    if (existing) {
      return res.status(400).json({ error: 'Customer with this phone number already exists' })
    }

    const customer = await prisma.customer.create({
      data: { name, phoneNumber, email, notes }
    })

    res.status(201).json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add customer' })
  }
}

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body

    const customer = await prisma.customer.update({
      where: { id },
      data
    })

    res.json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' })
  }
}

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.customer.delete({ where: { id } })

    res.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' })
  }
}

export const awardLoyaltyPoints = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumber, name, spendAmount } = req.body
    const pointsEarned = Math.floor(spendAmount / 100)

    const existing = await prisma.customer.findUnique({
      where: { phoneNumber }
    })

    if (existing) {
      const customer = await prisma.customer.update({
        where: { phoneNumber },
        data: {
          loyaltyPoints: existing.loyaltyPoints + pointsEarned,
          totalSpend: existing.totalSpend + spendAmount
        }
      })
      return res.json(customer)
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phoneNumber,
        loyaltyPoints: pointsEarned,
        totalSpend: spendAmount,
        email: '',
        notes: ''
      }
    })

    res.status(201).json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to award loyalty points' })
  }
}