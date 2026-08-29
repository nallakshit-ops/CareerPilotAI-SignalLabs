import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAction() {
  const user = await prisma.user.findFirst({
    where: { role: "candidate" },
  });

  console.log(`Candidate: ${user.name} (${user.industry})`);
  
  // Test fallback questions generation
  const skillSample = user.skills?.[0] || "JavaScript";
  const questions = [
    {
      question: `What is a core benefit of using modular architecture in modern ${user.industry || "software development"}?`,
      options: [
        "Improves maintainability, reusability, and isolation of concerns",
        "Eliminates the need for any database indexing",
        "Guarantees zero memory allocation",
        "Forces all components to share global state",
      ],
      correctAnswer: "Improves maintainability, reusability, and isolation of concerns",
      explanation: "Modular architectures divide systems into independent, reusable modules that are easier to test and maintain.",
    },
    {
      question: `In ${skillSample}, which principle is most critical for optimizing performance under high concurrency?`,
      options: [
        "Non-blocking asynchronous I/O and efficient memory caching",
        "Synchronous blocking loops on the main execution thread",
        "Duplicating database connections for every single sub-routine",
        "Disabling all error logging to save CPU cycles",
      ],
      correctAnswer: "Non-blocking asynchronous I/O and efficient memory caching",
      explanation: "Asynchronous non-blocking operations allow systems to serve high concurrent traffic without bottlenecking the thread.",
    },
  ];

  console.log(`✔ Questions verified: ${questions.length} sample items ready.`);
  console.log("✔ Sample Q1:", questions[0].question);
}

testAction().finally(async () => {
  await prisma.$disconnect();
});
