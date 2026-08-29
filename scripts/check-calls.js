const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const calls = await db.interviewCall.findMany({
    include: {
      candidate: { select: { name: true, email: true } },
      recruiter: { select: { name: true, email: true } }
    }
  });
  console.log("Total interview calls created:", calls.length);
  console.log("Calls details:", calls.map(c => ({
    id: c.id,
    jobTitle: c.jobTitle,
    companyName: c.companyName,
    candidateId: c.candidateId,
    candidateName: c.candidate?.name,
    recruiterId: c.recruiterId,
    recruiterName: c.recruiter?.name,
    status: c.status
  })));
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
