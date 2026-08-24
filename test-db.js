const prisma = require("./server/db");

async function testDatabase() {
  try {
    const products = await prisma.product.findMany();

    console.log("Database connection successful!");
    console.log(`Products found: ${products.length}`);
  } catch (error) {
    console.error("Database query failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();