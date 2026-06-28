import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  migrations: {
    seed: "bun·./prisma/seed.ts",
  },
  datasource: {
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
    url: process.env.DATABASE_URL!,
  },
});
