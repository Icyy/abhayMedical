import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  datasource: {
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!
    }),
    url: process.env.DIRECT_URL!,
    directUrl: process.env.DIRECT_URL,
  },
})