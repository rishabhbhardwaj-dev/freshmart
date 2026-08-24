/**
 * Seed script — loads products from server/data/products.json into the database.
 * Run with: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const fs = require('fs');
const path = require('path');

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'freshmart',
  connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const products = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'server', 'data', 'products.json'), 'utf-8')
  );

  console.log(`Seeding ${products.length} products...`);

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        unit: product.unit,
        inStock: product.inStock,
        description: product.description,
      },
      create: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        unit: product.unit,
        inStock: product.inStock,
        description: product.description,
      },
    });
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });