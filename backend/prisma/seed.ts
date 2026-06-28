require('dotenv').config(); 
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database safely...')

  // 🚨 REMOVED ALL deleteMany() COMMANDS FOR PRODUCTION SAFETY 🚨

  // 1. Safe User Creation (Upsert)
  const hashedPassword = await bcrypt.hash('abhay123', 10)
  const ownerPassword = await bcrypt.hash('owner123', 10)
  const employeePassword = await bcrypt.hash('employee123', 10)

  // Upsert Admin
  await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {}, // Do nothing if exists
    create: {
      name: 'Abhay',
      phone: '9876543210',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  // Upsert Owner
  await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      name: 'Owner',
      phone: '9999999999',
      password: ownerPassword,
      role: 'OWNER'
    }
  })

  // Upsert Staff
  await prisma.user.upsert({
    where: { phone: '8888888888' },
    update: {},
    create: {
      name: 'Staff',
      phone: '8888888888',
      password: employeePassword,
      role: 'EMPLOYEE'
    }
  })
  console.log('👤 Admin/Users verified')
  
  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })