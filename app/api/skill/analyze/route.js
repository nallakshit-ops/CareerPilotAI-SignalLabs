import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { extractSkills, calculateSkillGap, generateAISummary } from "@/lib/skill-analysis";
import { getRecommendations } from "@/lib/recommendation-engine";

export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { resumeText, jobDescription } = body;

        if (!resumeText || !jobDescription) {
            return Response.json(
                { error: "Both resumeText and jobDescription are required." },
                { status: 400 }
            );
        }

        // Find the user
        let user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            const { checkUser } = await import("@/lib/checkUser");
            user = await checkUser();
        }

        if (!user) {
            return Response.json({ error: "User profile could not be synchronized." }, { status: 404 });
        }

        // 1. Extract skills from both inputs
        const candidateSkills = extractSkills(resumeText);
        const requiredSkills = extractSkills(jobDescription);

        // 2. Calculate the skill gap (includes confidenceScore)
        const gapAnalysis = calculateSkillGap(candidateSkills, requiredSkills);

        // 3. Generate AI summary
        const summary = generateAISummary(gapAnalysis);

        // 4. Get course recommendations for missing skills
        const recommendations = getRecommendations(gapAnalysis.missingSkills);

        // 5. Save analysis result to database
        const analysisResult = await db.skillAnalysisResult.create({
            data: {
                userId: user.id,
                matchPercentage: gapAnalysis.matchPercentage,
                matchedSkills: gapAnalysis.matchedSkills,
                missingSkills: gapAnalysis.missingSkills,
                jobDescription: jobDescription,
            },
        });

        // 6. Save recommendations to database
        if (recommendations.length > 0) {
            // Delete old recommendations for this user first
            await db.skillRecommendation.deleteMany({
                where: { userId: user.id },
            });

            // Only save recommendations with valid course data (skip fallbacks)
            const validRecs = recommendations.filter((rec) => rec.url !== null);
            if (validRecs.length > 0) {
                await db.skillRecommendation.createMany({
                    data: validRecs.map((rec) => ({
                        userId: user.id,
                        skillName: rec.skill,
                        courseName: rec.course_name,
                        platform: rec.platform,
                        duration: rec.duration,
                        certification: rec.certification,
                    })),
                });
            }
        }

        return Response.json({
            success: true,
            analysis: {
                id: analysisResult.id,
                matchPercentage: gapAnalysis.matchPercentage,
                matchedSkills: gapAnalysis.matchedSkills,
                missingSkills: gapAnalysis.missingSkills,
                confidenceScore: gapAnalysis.confidenceScore,
                summary,
            },
            recommendations,
        });
    } catch (error) {
        console.error("Skill analysis error:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
