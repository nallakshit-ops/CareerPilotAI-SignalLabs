import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// Disable Next.js response caching for this route
export const dynamic = "force-dynamic";

/**
 * Search GitHub for hackathon winning projects
 * Uses GitHub Search API (5000 req/hr authenticated, 60 req/hr unauthenticated)
 */
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { skills: true },
    });

    const { searchParams } = new URL(req.url);
    const customQuery = searchParams.get("q");

    // Build search query: use OR for skills so it doesn't overly restrict the search
    const userSkills = user?.skills?.slice(0, 3).join(" OR ") || "javascript";
    const baseQuery = customQuery || `hackathon winner (${userSkills})`;

    const githubToken = process.env.GITHUB_TOKEN;
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    // GitHub Search API
    const searchUrl = new URL("https://api.github.com/search/repositories");
    searchUrl.searchParams.set("q", baseQuery);
    searchUrl.searchParams.set("sort", "stars");
    searchUrl.searchParams.set("order", "desc");
    searchUrl.searchParams.set("per_page", "12");

    const response = await fetch(searchUrl.toString(), { headers, cache: "no-store" });

    if (!response.ok) {
      const isRateLimit = response.status === 403 || response.status === 429;
      console.error("GitHub API error:", response.status, isRateLimit ? "(rate limited)" : "");
      
      if (isRateLimit) {
        // Return empty with explanation instead of erroring
        return Response.json({
          success: true,
          repos: [],
          total: 0,
          query: baseQuery,
          rateLimited: true,
          message: "GitHub API rate limit reached. Add a GITHUB_TOKEN to your .env for 5000 req/hr.",
        });
      }

      return Response.json(
        { success: false, error: "GitHub API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const repos = data.items || [];

    const formattedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "No description provided",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || "Unknown",
      topics: repo.topics || [],
      link: repo.html_url,
      owner: {
        username: repo.owner.login,
        avatar: repo.owner.avatar_url,
        profile: repo.owner.html_url,
      },
      lastUpdated: repo.updated_at,
      createdAt: repo.created_at,
      homepage: repo.homepage || null,
    }));

    return Response.json({
      success: true,
      repos: formattedRepos,
      total: data.total_count,
      query: baseQuery,
    });
  } catch (error) {
    console.error("GitHub repos fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch GitHub repos" },
      { status: 500 }
    );
  }
}
