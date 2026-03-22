import "server-only"
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

function initializeProductionDb(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'REPRESENTATIVE',
      "active" INTEGER NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

    CREATE TABLE IF NOT EXISTS "Customer" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "companyName" TEXT NOT NULL,
      "cnpj" TEXT NOT NULL,
      "address" TEXT NOT NULL,
      "city" TEXT NOT NULL,
      "state" TEXT NOT NULL,
      "segment" TEXT,
      "abcClass" TEXT DEFAULT 'C',
      "phone" TEXT,
      "email" TEXT,
      "cep" TEXT,
      "contactName" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "representativeId" TEXT NOT NULL,
      FOREIGN KEY ("representativeId") REFERENCES "User"("id")
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "Customer_cnpj_key" ON "Customer"("cnpj");

    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sku" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "category" TEXT NOT NULL,
      "unit" TEXT NOT NULL DEFAULT 'UN',
      "active" INTEGER NOT NULL DEFAULT 1,
      "basePrice" REAL NOT NULL,
      "volume" TEXT,
      "unitsPerBox" INTEGER DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");

    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderNumber" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "totalAmount" REAL NOT NULL DEFAULT 0,
      "discount" REAL NOT NULL DEFAULT 0,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "representativeId" TEXT NOT NULL,
      "customerId" TEXT NOT NULL,
      FOREIGN KEY ("representativeId") REFERENCES "User"("id"),
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");

    CREATE TABLE IF NOT EXISTS "OrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "quantity" INTEGER NOT NULL,
      "price" REAL NOT NULL,
      "total" REAL NOT NULL,
      "orderId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      FOREIGN KEY ("orderId") REFERENCES "Order"("id"),
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
    );

    CREATE TABLE IF NOT EXISTS "PriceTable" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "active" INTEGER NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "representativeId" TEXT NOT NULL,
      "customerId" TEXT,
      FOREIGN KEY ("representativeId") REFERENCES "User"("id"),
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
    );

    CREATE TABLE IF NOT EXISTS "PriceTableItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "salePrice" REAL NOT NULL,
      "priceTableId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      FOREIGN KEY ("priceTableId") REFERENCES "PriceTable"("id") ON DELETE CASCADE,
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
    );

    INSERT OR IGNORE INTO "User" ("id", "name", "email", "password", "role", "active", "createdAt", "updatedAt")
    VALUES ('static-admin-id', 'Admin', 'admin@sistema.com', 'admin123', 'ADMIN', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  `)
}

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production') {
    const db = new Database('/tmp/dev.db')
    initializeProductionDb(db)
    const adapter = new PrismaBetterSqlite3(db)
    return new PrismaClient({ adapter })
  }
  const adapter = new PrismaBetterSqlite3({ url: 'prisma/dev.db' })
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
