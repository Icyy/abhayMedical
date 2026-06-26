require('dotenv').config(); 
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data in correct order (children before parents)
  await prisma.prescriptionItem.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.supplierMedicine.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.medicine.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Users
  const hashedPassword = await bcrypt.hash('abhay123', 10)
  const ownerPassword = await bcrypt.hash('owner123', 10)
  const employeePassword = await bcrypt.hash('employee123', 10)

  await prisma.user.createMany({
    data: [
      {
        name: 'Abhay',
        phone: '9876543210',
        password: hashedPassword,
        role: 'ADMIN'
      },
      {
        name: 'Owner',
        phone: '9999999999',
        password: ownerPassword,
        role: 'OWNER'
      },
      {
        name: 'Staff',
        phone: '8888888888',
        password: employeePassword,
        role: 'EMPLOYEE'
      }
    ]
  })
  console.log('👤 Users created')

  // Suppliers - real Mumbai pharma distributors format
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'SG Pharma Distributors',
      contactPerson: 'Suresh Gupta',
      phone: '9820123456',
      email: 'orders@sgpharma.com',
      address: 'Shop 12, Medicine Market, Malad West, Mumbai 400064',
      gstNumber: '27AABCS1234A1Z5',
      discountPercent: 15
    }
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Mehta Medical Agencies',
      contactPerson: 'Rajesh Mehta',
      phone: '9821456789',
      email: 'mehta.medical@gmail.com',
      address: 'Office 5, Linking Road, Bandra West, Mumbai 400050',
      gstNumber: '27AABCM5678B1Z3',
      discountPercent: 12
    }
  })

  const supplier3 = await prisma.supplier.create({
    data: {
      name: 'Patel Healthcare',
      contactPerson: 'Dinesh Patel',
      phone: '9819876543',
      email: 'patel.healthcare@gmail.com',
      address: 'Plot 8, MIDC Industrial Area, Andheri East, Mumbai 400093',
      gstNumber: '27AABCP9012C1Z1',
      discountPercent: 18
    }
  })

  console.log('🏢 Suppliers created')

  // Medicines - real medicines commonly sold in Indian pharmacies
  const medicines = await prisma.medicine.createMany({
    data: [
      // Allopathic - common
      {
        name: 'Paracetamol 500mg (Crocin)',
        unit: 'strips',
        stock: 150,
        price: 30,
        purchasePrice: 25,
        batchNumber: 'CRO2024001',
        manufacturingDate: new Date('2024-01-01'),
        expiryDate: new Date('2026-01-01'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Azithromycin 500mg (Azithral)',
        unit: 'strips',
        stock: 8,
        price: 145,
        purchasePrice: 120,
        batchNumber: 'AZI2024002',
        manufacturingDate: new Date('2024-02-01'),
        expiryDate: new Date('2026-02-01'),
        status: 'LOW',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Amoxicillin 500mg (Mox)',
        unit: 'strips',
        stock: 60,
        price: 95,
        purchasePrice: 78,
        batchNumber: 'MOX2024003',
        manufacturingDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Metformin 500mg (Glycomet)',
        unit: 'strips',
        stock: 200,
        price: 42,
        purchasePrice: 35,
        batchNumber: 'MET2024004',
        manufacturingDate: new Date('2024-03-01'),
        expiryDate: new Date('2026-03-01'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Amlodipine 5mg (Amlokind)',
        unit: 'strips',
        stock: 5,
        price: 55,
        purchasePrice: 45,
        batchNumber: 'AML2024005',
        manufacturingDate: new Date('2024-02-15'),
        expiryDate: new Date('2026-02-15'),
        status: 'CRITICAL',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Atorvastatin 10mg (Atorva)',
        unit: 'strips',
        stock: 90,
        price: 88,
        purchasePrice: 72,
        batchNumber: 'ATO2024006',
        manufacturingDate: new Date('2024-01-20'),
        expiryDate: new Date('2026-01-20'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Omeprazole 20mg (Omez)',
        unit: 'strips',
        stock: 120,
        price: 65,
        purchasePrice: 52,
        batchNumber: 'OME2024007',
        manufacturingDate: new Date('2024-03-10'),
        expiryDate: new Date('2026-03-10'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Cetirizine 10mg (Cetzine)',
        unit: 'strips',
        stock: 80,
        price: 35,
        purchasePrice: 28,
        batchNumber: 'CET2024008',
        manufacturingDate: new Date('2024-02-01'),
        expiryDate: new Date('2026-02-01'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Pantoprazole 40mg (Pan D)',
        unit: 'strips',
        stock: 7,
        price: 120,
        purchasePrice: 98,
        batchNumber: 'PAN2024009',
        manufacturingDate: new Date('2024-01-10'),
        expiryDate: new Date('2026-01-10'),
        status: 'LOW',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Vitamin D3 60000 IU (Calcirol)',
        unit: 'capsules',
        stock: 200,
        price: 28,
        purchasePrice: 22,
        batchNumber: 'VTD2024010',
        manufacturingDate: new Date('2024-03-01'),
        expiryDate: new Date('2026-03-01'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 5
      },
      {
        name: 'Multivitamin (Supradyn)',
        unit: 'strips',
        stock: 45,
        price: 175,
        purchasePrice: 142,
        batchNumber: 'SUP2024011',
        manufacturingDate: new Date('2024-02-20'),
        expiryDate: new Date('2026-02-20'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      {
        name: 'Ibuprofen 400mg (Brufen)',
        unit: 'strips',
        stock: 100,
        price: 28,
        purchasePrice: 22,
        batchNumber: 'IBU2024012',
        manufacturingDate: new Date('2024-01-05'),
        expiryDate: new Date('2026-01-05'),
        status: 'OK',
        category: 'ALLOPATHIC',
        gstPercent: 12
      },
      // Ayurvedic
      {
        name: 'Triphala Churna (Dabur)',
        unit: 'bottles',
        stock: 30,
        price: 95,
        purchasePrice: 75,
        batchNumber: 'TRP2024013',
        manufacturingDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-12-31'),
        status: 'OK',
        category: 'AYURVEDIC',
        gstPercent: 12
      },
      {
        name: 'Ashwagandha Tablets (Himalaya)',
        unit: 'bottles',
        stock: 25,
        price: 185,
        purchasePrice: 148,
        batchNumber: 'ASH2024014',
        manufacturingDate: new Date('2024-02-01'),
        expiryDate: new Date('2026-02-01'),
        status: 'OK',
        category: 'AYURVEDIC',
        gstPercent: 12
      },
      // Personal care
      {
        name: 'Dettol Antiseptic Liquid 250ml',
        unit: 'bottles',
        stock: 40,
        price: 145,
        purchasePrice: 115,
        batchNumber: 'DET2024015',
        manufacturingDate: new Date('2024-03-01'),
        expiryDate: new Date('2026-03-01'),
        status: 'OK',
        category: 'PERSONAL_CARE',
        gstPercent: 18
      },
      {
        name: 'Stayfree Secure (8 pads)',
        unit: 'packets',
        stock: 60,
        price: 55,
        purchasePrice: 42,
        batchNumber: 'STF2024016',
        manufacturingDate: new Date('2024-02-01'),
        expiryDate: new Date('2026-02-01'),
        status: 'OK',
        category: 'PERSONAL_CARE',
        gstPercent: 0
      },
      {
        name: 'Moov Pain Relief Cream 50g',
        unit: 'tubes',
        stock: 35,
        price: 115,
        purchasePrice: 90,
        batchNumber: 'MOV2024017',
        manufacturingDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        status: 'OK',
        category: 'PERSONAL_CARE',
        gstPercent: 18
      },
      // Cosmetics
      {
        name: 'Himalaya Face Wash 100ml',
        unit: 'bottles',
        stock: 20,
        price: 95,
        purchasePrice: 76,
        batchNumber: 'HFW2024018',
        manufacturingDate: new Date('2024-02-10'),
        expiryDate: new Date('2026-02-10'),
        status: 'OK',
        category: 'COSMETIC',
        gstPercent: 18
      },
      // General store
      {
        name: 'Cadbury Dairy Milk 36g',
        unit: 'pieces',
        stock: 100,
        price: 20,
        purchasePrice: 15,
        batchNumber: 'CDM2024019',
        manufacturingDate: new Date('2024-03-15'),
        expiryDate: new Date('2024-09-15'),
        status: 'OK',
        category: 'GENERAL_STORE',
        gstPercent: 18
      },
      {
        name: 'ORS Electral Powder (Lemon)',
        unit: 'packets',
        stock: 3,
        price: 15,
        purchasePrice: 11,
        batchNumber: 'ORS2024020',
        manufacturingDate: new Date('2024-01-20'),
        expiryDate: new Date('2026-01-20'),
        status: 'CRITICAL',
        category: 'ALLOPATHIC',
        gstPercent: 5
      }
    ]
  })

  console.log('💊 Medicines created')

  // Customers - typical Mumbai pharmacy customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Ramesh Shah',
      phoneNumber: '9820111222',
      email: 'ramesh.shah@gmail.com',
      notes: 'Diabetic patient - regular Metformin customer',
      loyaltyPoints: 45,
      totalSpend: 4500
    }
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Sunita Kulkarni',
      phoneNumber: '9821333444',
      email: '',
      notes: 'BP patient - monthly Amlodipine',
      loyaltyPoints: 82,
      totalSpend: 8200
    }
  })

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Anil Joshi',
      phoneNumber: '9819555666',
      email: 'anil.joshi@yahoo.com',
      notes: '',
      loyaltyPoints: 12,
      totalSpend: 1200
    }
  })

  const customer4 = await prisma.customer.create({
    data: {
      name: 'Priya Nair',
      phoneNumber: '9820777888',
      email: '',
      notes: 'Prefers generic brands',
      loyaltyPoints: 5,
      totalSpend: 500
    }
  })

  console.log('👥 Customers created')

  // Get medicine IDs for prescriptions
  const allMedicines = await prisma.medicine.findMany()
  const getMed = (name: string) => allMedicines.find(m => m.name.includes(name))

  const paracetamol = getMed('Paracetamol')
  const metformin = getMed('Metformin')
  const amlodipine = getMed('Amlodipine')
  const omeprazole = getMed('Omeprazole')
  const cetirizine = getMed('Cetirizine')
  const vitaminD = getMed('Vitamin D3')

  // Prescriptions
  if (paracetamol && omeprazole) {
    await prisma.prescription.create({
      data: {
        customerId: customer3.id,
        doctorName: 'Dr. Mehta',
        discount: 0,
        subTotal: paracetamol.price + omeprazole.price,
        gstAmount: (paracetamol.price * paracetamol.gstPercent / 100) + (omeprazole.price * omeprazole.gstPercent / 100),
        total: paracetamol.price + omeprazole.price + (paracetamol.price * paracetamol.gstPercent / 100) + (omeprazole.price * omeprazole.gstPercent / 100),
        status: 'PAID',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            { medicineId: paracetamol.id, quantity: 2, price: paracetamol.price, gstPercent: paracetamol.gstPercent },
            { medicineId: omeprazole.id, quantity: 1, price: omeprazole.price, gstPercent: omeprazole.gstPercent }
          ]
        }
      }
    })
  }

  if (metformin && amlodipine) {
    await prisma.prescription.create({
      data: {
        customerId: customer1.id,
        doctorName: 'Dr. Sharma',
        discount: 5,
        subTotal: (metformin.price * 3) + (amlodipine.price * 1),
        gstAmount: (metformin.price * 3 * metformin.gstPercent / 100) + (amlodipine.price * amlodipine.gstPercent / 100),
        total: ((metformin.price * 3) + (amlodipine.price * 1)) * 0.95 + (metformin.price * 3 * metformin.gstPercent / 100) + (amlodipine.price * amlodipine.gstPercent / 100),
        status: 'PAID',
        date: new Date(),
        items: {
          create: [
            { medicineId: metformin.id, quantity: 3, price: metformin.price, gstPercent: metformin.gstPercent },
            { medicineId: amlodipine.id, quantity: 1, price: amlodipine.price, gstPercent: amlodipine.gstPercent }
          ]
        }
      }
    })
  }

  if (cetirizine && paracetamol) {
    await prisma.prescription.create({
      data: {
        customerId: customer4.id,
        doctorName: 'Dr. Patel',
        discount: 0,
        subTotal: cetirizine.price + paracetamol.price,
        gstAmount: (cetirizine.price * cetirizine.gstPercent / 100) + (paracetamol.price * paracetamol.gstPercent / 100),
        total: cetirizine.price + paracetamol.price + (cetirizine.price * cetirizine.gstPercent / 100) + (paracetamol.price * paracetamol.gstPercent / 100),
        status: 'PENDING',
        date: new Date(),
        items: {
          create: [
            { medicineId: cetirizine.id, quantity: 1, price: cetirizine.price, gstPercent: cetirizine.gstPercent },
            { medicineId: paracetamol.id, quantity: 1, price: paracetamol.price, gstPercent: paracetamol.gstPercent }
          ]
        }
      }
    })
  }

  console.log('📋 Prescriptions created')

  // Purchase orders
  if (paracetamol && metformin) {
    await prisma.purchaseOrder.create({
      data: {
        supplierId: supplier1.id,
        status: 'RECEIVED',
        totalCost: (paracetamol.purchasePrice * 100) + (metformin.purchasePrice * 200),
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Monthly stock replenishment',
        items: {
          create: [
            { medicineName: paracetamol.name, quantity: 100, pricePerUnit: paracetamol.purchasePrice, totalPrice: paracetamol.purchasePrice * 100 },
            { medicineName: metformin.name, quantity: 200, pricePerUnit: metformin.purchasePrice, totalPrice: metformin.purchasePrice * 200 }
          ]
        }
      }
    })
  }

  if (vitaminD && omeprazole) {
    await prisma.purchaseOrder.create({
      data: {
        supplierId: supplier3.id,
        status: 'PENDING',
        totalCost: (vitaminD!.purchasePrice * 50) + (omeprazole.purchasePrice * 30),
        orderDate: new Date(),
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        notes: 'Urgent - low stock items',
        items: {
          create: [
            { medicineName: vitaminD!.name, quantity: 50, pricePerUnit: vitaminD!.purchasePrice, totalPrice: vitaminD!.purchasePrice * 50 },
            { medicineName: omeprazole.name, quantity: 30, pricePerUnit: omeprazole.purchasePrice, totalPrice: omeprazole.purchasePrice * 30 }
          ]
        }
      }
    })
  }

  console.log('📦 Purchase orders created')
  console.log('')
  console.log('✅ Seed complete!')
  console.log('')
  console.log('Login credentials:')
  console.log('  Admin  → phone: 9876543210  password: abhay123')
  console.log('  Owner  → phone: 9999999999  password: owner123')
  console.log('  Staff  → phone: 8888888888  password: employee123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })