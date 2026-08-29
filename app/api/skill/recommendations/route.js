import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch stored recommendations for the user
        const recommendations = await db.skillRecommendation.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        // Fetch the latest analysis result
        const latestAnalysis = await db.skillAnalysisResult.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return Response.json({
            success: true,
            recommendations,
            latestAnalysis: latestAnalysis
                ? {
                    id: latestAnalysis.id,
                    matchPercentage: latestAnalysis.matchPercentage,
                    matchedSkills: latestAnalysis.matchedSkills,
                    missingSkills: latestAnalysis.missingSkills,
                    jobDescription: latestAnalysis.jobDescription,
                    createdAt: latestAnalysis.createdAt,
                }
                : null,
        });
    } catch (error) {
        console.error("Recommendations fetch error:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
