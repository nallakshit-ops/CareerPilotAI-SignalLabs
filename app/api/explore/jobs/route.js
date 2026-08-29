import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// Disable Next.js response caching for this route
export const dynamic = "force-dynamic";

/**
 * Fetch jobs from Remotive API (FREE, no API key needed)
 * https://remotive.com/api/remote-jobs
 */
async function fetchRemotiveJobs(query) {
  try {
    const url = new URL("https://remotive.com/api/remote-jobs");
    if (query) {
      url.searchParams.set("search", query);
    }
    url.searchParams.set("limit", "15");

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      console.warn("Remotive API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs = data.jobs || [];

    return jobs.map((job) => {
      // Clean up HTML tags from description
      const cleanDesc = (job.description || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 300);

      return {
        id: `remotive-${job.id}`,
        title: job.title || "Untitled Position",
        company: job.company_name || "Company",
        location: job.candidate_required_location || "Remote",
        description: cleanDesc ? `${cleanDesc}...` : "",
        link: job.url || "#",
        salary: job.salary || "Not disclosed",
        postedDate: job.publication_date || "Recently",
        source: "Remotive",
        type: job.job_type
          ? job.job_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "Full-time",
        category: job.category || "",
        tags: job.tags || [],
      };
    });
  } catch (error) {
    console.error("Remotive API error:", error.message);
    return [];
  }
}

/**
 * Fetch jobs from JSearch RapidAPI (aggregates LinkedIn, Indeed, Glassdoor)
 * Free tier: 200 requests/month
 */
async function fetchJSearchJobs(query, location = "Remote") {
  const apiKey = process.env.JSEARCH_RAPIDAPI_KEY;

  if (!apiKey) {
    console.warn("JSEARCH_RAPIDAPI_KEY not configured, skipping JSearch");
    return [];
  }

  try {
    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.set("query", query);
    url.searchParams.set("page", "1");
    url.searchParams.set("num_pages", "1");
    if (location !== "Remote") {
      url.searchParams.set("location", location);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("JSearch API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs = data.data || [];

    return jobs.slice(0, 10).map((job) => ({
      id: `jsearch-${job.job_id}`,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : "Remote",
      description: job.job_description?.slice(0, 300) + "..." || "",
      link: job.job_apply_link || job.job_google_link || "#",
      salary: job.job_salary || "Not disclosed",
      postedDate: job.job_posted_at_datetime_utc || "Recently",
      source: "LinkedIn/Indeed/Glassdoor (JSearch)",
      type: job.job_employment_type || "Full-time",
    }));
  } catch (error) {
    console.error("JSearch API error:", error.message);
    return [];
  }
}

/**
 * Fetch jobs from Adzuna (free tier: 250 req/day)
 */
async function fetchAdzunaJobs(query, location = "us") {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn("Adzuna credentials not configured, skipping");
    return [];
  }

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${location}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(query)}&results_per_page=10`;

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.warn("Adzuna API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs = data.results || [];

    return jobs.map((job) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company?.display_name || "Company",
      location: job.location?.display_name || "Remote",
      description: job.description?.slice(0, 300) + "..." || "",
      link: job.redirect_url || "#",
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
        : "Not disclosed",
      postedDate: job.created || "Recently",
      source: "Adzuna",
      type: job.contract_time || "Full-time",
    }));
  } catch (error) {
    console.error("Adzuna API error:", error.message);
    return [];
  }
}

/**
 * Fallback: Curated job board links (always available, only used when all APIs fail)
 */
function getFallbackJobs(industry, region) {
  const boards = {
    tech: [
      {
        id: "fallback-1",
        title: "Browse Tech Jobs",
        company: "LinkedIn Jobs",
        location: "Remote & Worldwide",
        description: "Search thousands of tech roles on LinkedIn",
        link: "https://www.linkedin.com/jobs/search/?keywords=software%20engineer",
        salary: "Varies",
        postedDate: "Live",
        source: "Job Board",
        type: "All types",
      },
      {
        id: "fallback-2",
        title: "Remote Developer Jobs",
        company: "We Work Remotely",
        location: "Remote",
        description: "Premium remote developer positions",
        link: "https://weworkremotely.com/categories/remote-programming-jobs",
        salary: "Competitive",
        postedDate: "Daily updates",
        source: "Job Board",
        type: "Remote",
      },
    ],
    finance: [
      {
        id: "fallback-3",
        title: "Finance & Banking Roles",
        company: "eFinancialCareers",
        location: "Global",
        description: "Top finance jobs worldwide",
        link: "https://www.efinancialcareers.com/",
        salary: "Varies",
        postedDate: "Live",
        source: "Job Board",
        type: "All types",
      },
    ],
    healthcare: [
      {
        id: "fallback-4",
        title: "Healthcare Jobs",
        company: "Health eCareers",
        location: "US",
        description: "Healthcare and medical positions",
        link: "https://www.healthecareers.com/",
        salary: "Varies",
        postedDate: "Live",
        source: "Job Board",
        type: "All types",
      },
    ],
  };

  const industryKey = industry?.includes("tech") ? "tech" 
    : industry?.includes("finance") ? "finance"
    : industry?.includes("health") ? "healthcare" 
    : "tech"; // default

  let fallbackList = boards[industryKey] || boards.tech;
  
  // If a specific region is requested, adapt the fallback links
  if (region && region !== "remote" && region !== "us") {
    fallbackList = fallbackList.map(job => ({
      ...job,
      title: `${job.title} in ${region.charAt(0).toUpperCase() + region.slice(1)}`,
      location: `${region.charAt(0).toUpperCase() + region.slice(1)}, Remote`,
      link: `${job.link}&f_TPR=&geoId=102713980&location=${region}` // rough LinkedIn location param hack
    }));
  }

  return fallbackList;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const regionParam = searchParams.get("region") || "us";
    
    // Map full names to Adzuna codes, default to us
    const adzunaRegionMap = {
      "india": "in",
      "us": "us",
      "uk": "gb",
      "canada": "ca",
      "australia": "au",
      "germany": "de",
      "remote": "us" // Adzuna doesn't have a global remote, default to US remote
    };
    
    const adzunaLocation = adzunaRegionMap[regionParam.toLowerCase()] || "us";
    
    // For JSearch, we can pass the full region name
    let jsearchLocation = "Remote";
    if (regionParam !== "remote") {
      jsearchLocation = regionParam.charAt(0).toUpperCase() + regionParam.slice(1);
    }

    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { skills: true, industry: true },
    });

    // Build query from user skills
    const query = user?.skills?.slice(0, 3).join(" ") || "software engineer";
    const industry = user?.industry || "tech";

    // Fetch from all APIs in parallel (Remotive is free and always works)
    const [remotiveJobsRaw, jSearchJobs, adzunaJobs] = await Promise.all([
      fetchRemotiveJobs(query),
      fetchJSearchJobs(query, jsearchLocation),
      fetchAdzunaJobs(query, adzunaLocation),
    ]);

    // Filter Remotive jobs locally since its API doesn't support a strict location param
    const remotiveJobs = remotiveJobsRaw.filter(job => {
      if (regionParam === "remote" || regionParam === "us") return true; // Most remotive jobs are US/Global
      
      const loc = job.location.toLowerCase();
      const targetRegion = regionParam.toLowerCase();
      
      return loc.includes(targetRegion) || 
             loc.includes("worldwide") || 
             loc.includes("anywhere") || 
             loc.includes("global");
    });

    const realJobs = [...remotiveJobs, ...jSearchJobs, ...adzunaJobs];

    // Deduplicate by title+company (rough dedup)
    const seen = new Set();
    const deduped = realJobs.filter((job) => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // If no real jobs found, add fallback job board links
    const jobs = deduped.length > 0 
      ? deduped 
      : getFallbackJobs(industry, regionParam);

    return Response.json({
      success: true,
      jobs,
      total: jobs.length,
      query,
    });
  } catch (error) {
    console.error("Job fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
