const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const recruiter = await db.user.findFirst({
    where: { role: "recruiter" }
  });
  console.log("Using recruiter:", recruiter.name, recruiter.clerkUserId);

  // We will simulate searchCandidates logic directly
  try {
    let candidates = await db.user.findMany({
      where: { role: "candidate" },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        skills: true,
        experience: true,
        bio: true,
        industry: true,
        resumeDriveUrl: true,
        videoResumeUrl: true,
      },
    });

    console.log("All candidates in DB count:", candidates.length);
    console.log("Candidate names:", candidates.map(c => c.name));

    // Try simulating a search with empty skills
    const skills = [];
    let filtered = [...candidates];
    if (skills && skills.length > 0) {
      const lowerSkills = skills.map((s) => s.toLowerCase());
      filtered = filtered.filter((c) =>
        c.skills?.some((skill) => lowerSkills.includes(skill.toLowerCase()))
      );
    }
    console.log("Filtered candidates count (empty skills):", filtered.length);
  } catch (err) {
    console.error(err);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
