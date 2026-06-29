import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set!')
  process.exit(1)
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

export default prisma