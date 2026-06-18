import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../prisma'

export const register = async (req: Request, res: Response) => {
  try {
    const { name, phone, password, role } = req.body

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone already exists' })
    }

    // hash the password - never store plain text passwords
    const hashedPassword = await bcrypt.hash(password, 10)

    // create the user
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: role || 'EMPLOYEE'
      }
    })

    // generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body

    // find user by phone
    const user = await prisma.user.findUnique({
      where: { phone }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone or password' })
    }

    // compare password with hashed version
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid phone or password' })
    }

    // generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}