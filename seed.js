require("dotenv/config");

const fs = require("fs");
const path = require("path");
const prisma = require("./server/db");

const products = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "server", "data", "products.json"),
    "utf-8"
  )
);

async function seed() {
  try {
    console.log(`Found ${products.length} products in products.json`);

    for (const product of products) {
      await prisma.product.upsert({
        where: {
          id: product.id,
        },
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

    console.log(`Successfully seeded ${products.length} products.`);
  } catch (error) {
    console.error("Seeding failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();