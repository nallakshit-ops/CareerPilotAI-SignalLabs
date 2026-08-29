import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// Disable Next.js response caching for this route
export const dynamic = "force-dynamic";

/**
 * Fetch hackathons from Devpost API (correct endpoint)
 * Returns real, live open + upcoming hackathons
 */
async function fetchDevpostHackathons() {
  try {
    const url = new URL("https://devpost.com/api/hackathons");
    url.searchParams.set("status[]", "open");
    // Also fetch upcoming hackathons
    url.searchParams.append("status[]", "upcoming");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Devpost API returned non-200:", response.status);
      return [];
    }

    const data = await response.json();
    const hackathons = data.hackathons || [];

    return hackathons.map((h) => {
      // Parse prize amount — Devpost wraps it in HTML spans
      let prize = "TBD";
      if (h.prize_amount) {
        const prizeText = h.prize_amount
          .replace(/<[^>]*>/g, "") // strip HTML tags
          .trim();
        if (prizeText) prize = prizeText;
      }

      return {
        id: `devpost-${h.id}`,
        title: (h.title || "Untitled Hackathon").trim(),
        description:
          h.analytics_identifier || h.title || "",
        prize,
        deadline: h.submission_period_dates || "Rolling",
        timeLeft: h.time_left_to_submission || "",
        link: h.url || "https://devpost.com",
        type: h.displayed_location?.location?.toLowerCase().includes("online")
          ? "online"
          : "in-person",
        source: "Devpost",
        tags: (h.themes || []).map((t) => t.name),
        registrations: h.registrations_count || 0,
        organizer: h.organization_name || "",
        thumbnail: h.thumbnail_url
          ? `https:${h.thumbnail_url}`
          : null,
      };
    });
  } catch (error) {
    console.error("Devpost fetch error:", error.message);
    return [];
  }
}

/**
 * Curated fallback hackathons (only used when Devpost API is down)
 */
function getFallbackHackathons() {
  return [
    {
      id: "fallback-1",
      title: "Browse Open Hackathons on Devpost",
      description: "Discover thousands of hackathons on Devpost",
      prize: "Various",
      deadline: "Ongoing",
      timeLeft: "",
      link: "https://devpost.com/hackathons?status[]=open",
      type: "online",
      source: "Devpost",
      tags: ["All Categories"],
      registrations: 0,
      organizer: "Devpost",
      thumbnail: null,
    },
    {
      id: "fallback-2",
      title: "MLH Season 2026 Hackathons",
      description: "Major League Hacking official season hackathons",
      prize: "Various",
      deadline: "See MLH",
      timeLeft: "",
      link: "https://mlh.io/seasons/2026/events",
      type: "hybrid",
      source: "MLH",
      tags: ["AI", "Web", "Mobile"],
      registrations: 0,
      organizer: "MLH",
      thumbnail: null,
    },
  ];
}

/**
 * Rank hackathons by relevance to user interests
 */
function rankByRelevance(hackathons, userInterests) {
  if (!userInterests || userInterests.length === 0) {
    return hackathons;
  }

  const interestLower = userInterests.map((i) => i.toLowerCase());

  return hackathons
    .map((h) => {
      const titleMatch = interestLower.some((i) =>
        h.title.toLowerCase().includes(i)
      );
      const descMatch = interestLower.some((i) =>
        h.description.toLowerCase().includes(i)
      );
      const tagMatch = h.tags?.some((t) =>
        interestLower.some((i) => t.toLowerCase().includes(i))
      );

      const score = (titleMatch ? 3 : 0) + (descMatch ? 2 : 0) + (tagMatch ? 1 : 0);

      return { ...h, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { skills: true, industry: true },
    });

    // Fetch real hackathons from Devpost
    let hackathons = await fetchDevpostHackathons();

    // If Devpost API fails, use fallback
    if (hackathons.length === 0) {
      hackathons = getFallbackHackathons();
    }

    // Rank by relevance to user skills
    const ranked = rankByRelevance(hackathons, user?.skills || []);

    return Response.json({
      success: true,
      hackathons: ranked,
      total: ranked.length,
    });
  } catch (error) {
    console.error("Hackathon fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch hackathons" },
      { status: 500 }
    );
  }
}
