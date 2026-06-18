import { Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middlewares/authMiddleware'


export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      totalMedicines,
      lowStockCount,
      criticalCount,
      expiringCount,
      todayRevenue,
      monthRevenue,
      totalCustomers,
      pendingPrescriptions
    ] = await Promise.all([
      prisma.medicine.count(),
      prisma.medicine.count({ where: { status: 'LOW' } }),
      prisma.medicine.count({ where: { status: 'CRITICAL' } }),
      prisma.medicine.count({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.prescription.aggregate({
        where: {
          status: 'PAID',
          date: { gte: startOfDay, lte: endOfDay }
        },
        _sum: { total: true }
      }),
      prisma.prescription.aggregate({
        where: {
          status: 'PAID',
          date: { gte: startOfMonth }
        },
        _sum: { total: true }
      }),
      prisma.customer.count(),
      prisma.prescription.count({ where: { status: 'PENDING' } })
    ])

    res.json({
      totalMedicines,
      lowStockCount,
      criticalCount,
      expiringCount,
      todayRevenue: todayRevenue._sum.total || 0,
      monthRevenue: monthRevenue._sum.total || 0,
      totalCustomers,
      pendingPrescriptions
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
}