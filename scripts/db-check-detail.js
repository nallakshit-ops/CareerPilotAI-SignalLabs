const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const candidate = await db.user.findFirst({
    where: { role: "candidate" }
  });
  console.log("Candidate detail:", candidate);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
