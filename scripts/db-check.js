const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany();
  console.log("Total users:", users.length);
  console.log("Users:", users.map(u => ({ id: u.id, name: u.name, role: u.role, email: u.email })));
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
