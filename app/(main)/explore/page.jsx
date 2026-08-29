"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Trophy,
  Briefcase,
  Github,
  MessageSquare,
  ExternalLink,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  Copy,
  Check,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ExploreContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam && ["hackathons", "jobs", "repos"].includes(tabParam)
      ? tabParam
      : "hackathons"
  );

  useEffect(() => {
    if (tabParam && ["hackathons", "jobs", "repos"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [hackathons, setHackathons] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState({
    hackathons: true,
    jobs: true,
    repos: true,
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [coldDM, setColdDM] = useState(null);
  const [generatingDM, setGeneratingDM] = useState(false);
  const [copiedDM, setCopiedDM] = useState(false);

  // Filtering state
  const [hackathonFilters, setHackathonFilters] = useState({
    search: "",
    type: "all",
    prize: "all",
  });
  const [jobFilters, setJobFilters] = useState({
    search: "",
    role: "all",
    experience: "all",
    location: "all",
    type: "all",
    region: "remote", // Added region filter
  });

  const router = useRouter(); // For navigation to details

  // Ref for auto-scrolling to the cold DM card
  const coldDMRef = useRef(null);

  // Fetch when tab changes — always fetch fresh data on tab switch
  useEffect(() => {
    if (activeTab === "hackathons") {
      fetchHackathons();
    } else if (activeTab === "jobs") {
      fetchJobs();
    } else if (activeTab === "repos") {
      fetchRepos();
    }
  }, [activeTab]);

  // Refetch jobs when the region filter explicitly changes
  useEffect(() => {
    if (activeTab === "jobs") {
      fetchJobs();
    }
  }, [jobFilters.region]);

  const fetchHackathons = async () => {
    setLoading((prev) => ({ ...prev, hackathons: true }));
    try {
      const res = await fetch("/api/explore/hackathons", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setHackathons(data.hackathons);
      }
    } catch (error) {
      toast.error("Failed to load hackathons");
    } finally {
      setLoading((prev) => ({ ...prev, hackathons: false }));
    }
  };

  const fetchJobs = async () => {
    setLoading((prev) => ({ ...prev, jobs: true }));
    try {
      const res = await fetch(`/api/explore/jobs?region=${jobFilters.region}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading((prev) => ({ ...prev, jobs: false }));
    }
  };

  // Fetch GitHub repos for user skills
  const fetchRepos = async () => {
    setLoading((prev) => ({ ...prev, repos: true }));
    try {
      const res = await fetch("/api/explore/github-repos", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setRepos(data.repos);
      }
    } catch (error) {
      toast.error("Failed to load GitHub repos");
    } finally {
      setLoading((prev) => ({ ...prev, repos: false }));
    }
  };

  const generateColdDM = async (job) => {
    setSelectedJob(job);
    setGeneratingDM(true);
    setColdDM(null);

    try {
      const res = await fetch("/api/generate-cold-dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: job.company,
          jobTitle: job.title,
          tone: "professional",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setColdDM(data);
        toast.success("Cold DM generated!");
        // Auto-scroll to the DM card after a short delay for render
        setTimeout(() => {
          coldDMRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      } else {
        toast.error(data.error || "Failed to generate DM");
      }
    } catch (error) {
      toast.error("Failed to generate cold DM");
    } finally {
      setGeneratingDM(false);
    }
  };

  // Clean message: convert literal \n to real newlines
  const getCleanMessage = (msg) => {
    if (!msg) return "";
    return msg.replace(/\\n/g, "\n").replace(/\\t/g, "  ");
  };

  const copyDMToClipboard = () => {
    if (coldDM?.message) {
      navigator.clipboard.writeText(getCleanMessage(coldDM.message));
      setCopiedDM(true);
      toast.success("Message copied to clipboard!");
      setTimeout(() => setCopiedDM(false), 2000);
    }
  };

  // Filtered hackathons
  const filteredHackathons = useMemo(() => {
    return hackathons.filter((hack) => {
      const searchMatch =
        hackathonFilters.search === "" ||
        hack.title.toLowerCase().includes(hackathonFilters.search.toLowerCase()) ||
        hack.description.toLowerCase().includes(hackathonFilters.search.toLowerCase());

      const typeMatch =
        hackathonFilters.type === "all" ||
        hack.type.toLowerCase() === hackathonFilters.type;

      const prizeMatch =
        hackathonFilters.prize === "all" ||
        (hackathonFilters.prize === "high" && hack.prize.includes("$") && parseInt(hack.prize.replace(/\D/g, "")) >= 10000) ||
        (hackathonFilters.prize === "medium" && hack.prize.includes("$") && parseInt(hack.prize.replace(/\D/g, "")) < 10000);

      return searchMatch && typeMatch && prizeMatch;
    });
  }, [hackathons, hackathonFilters]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchMatch =
        jobFilters.search === "" ||
        job.title.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(jobFilters.search.toLowerCase());

      const roleMatch =
        jobFilters.role === "all" ||
        job.title.toLowerCase().includes(jobFilters.role.toLowerCase());

      const experienceMatch =
        jobFilters.experience === "all" ||
        job.title.toLowerCase().includes(jobFilters.experience.toLowerCase()) ||
        job.description.toLowerCase().includes(jobFilters.experience.toLowerCase());

      const locationMatch =
        jobFilters.location === "all" ||
        job.location.toLowerCase().includes(jobFilters.location.toLowerCase());

      const typeMatch =
        jobFilters.type === "all" ||
        job.type.toLowerCase().includes(jobFilters.type.toLowerCase());

      return searchMatch && roleMatch && experienceMatch && locationMatch && typeMatch;
    });
  }, [jobs, jobFilters]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Explore Opportunities
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Discover verified hackathons, job openings, and winning project repositories
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="hackathons" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Hackathons
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="repos" className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            Winning Projects
          </TabsTrigger>
        </TabsList>

        {/* HACKATHONS TAB */}
        <TabsContent value="hackathons" className="space-y-4">
          {/* Hackathon Filters */}
          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Hackathons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search hackathons..."
                    value={hackathonFilters.search}
                    onChange={(e) =>
                      setHackathonFilters({ ...hackathonFilters, search: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={hackathonFilters.type}
                    onValueChange={(value) =>
                      setHackathonFilters({ ...hackathonFilters, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Prize Range</label>
                  <Select
                    value={hackathonFilters.prize}
                    onValueChange={(value) =>
                      setHackathonFilters({ ...hackathonFilters, prize: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prizes</SelectItem>
                      <SelectItem value="high">$10,000+</SelectItem>
                      <SelectItem value="medium">Under $10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading.hackathons ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-2">
                Showing {filteredHackathons.length} of {hackathons.length} hackathons
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredHackathons.map((hack) => (
                  <Card key={hack.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{hack.title}</CardTitle>
                        <Badge variant="secondary">{hack.source}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {hack.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 font-medium text-green-600">
                          <Trophy className="w-4 h-4" />
                          {hack.prize}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {hack.deadline}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {hack.tags?.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button asChild className="flex-1">
                          <a href={hack.link} target="_blank" rel="noopener noreferrer">
                            Register <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                        >
                          <Link href={`/hackathon/${hack.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* JOBS TAB */}
        <TabsContent value="jobs" className="space-y-4">
          {/* Job Filters */}
          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search jobs..."
                    value={jobFilters.search}
                    onChange={(e) =>
                      setJobFilters({ ...jobFilters, search: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Region/Country</label>
                  <Select
                    value={jobFilters.region}
                    onValueChange={(value) =>
                      setJobFilters({ ...jobFilters, region: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Global / Remote</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role Type</label>
                  <Select
                    value={jobFilters.role}
                    onValueChange={(value) =>
                      setJobFilters({ ...jobFilters, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="full stack">Full Stack</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="ml">AI/ML</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Experience</label>
                  <Select
                    value={jobFilters.experience}
                    onValueChange={(value) =>
                      setJobFilters({ ...jobFilters, experience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="intern">Internship</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Select
                    value={jobFilters.location}
                    onValueChange={(value) =>
                      setJobFilters({ ...jobFilters, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading.jobs ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-2">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredJobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-semibold">{job.company}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {job.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="secondary">{job.type}</Badge>
                          <span className="font-semibold text-green-600">{job.salary}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild className="flex-1">
                            <a href={job.link} target="_blank" rel="noopener noreferrer">
                              Apply Now
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              sessionStorage.setItem("selectedJobData", JSON.stringify(job));
                              router.push(`/job/${job.id}`);
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => generateColdDM(job)}
                            disabled={generatingDM}
                          >
                            {generatingDM && selectedJob?.id === job.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageSquare className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cold DM Card — appears right below the selected job */}
                    {coldDM && selectedJob?.id === job.id && (
                      <Card
                        ref={coldDMRef}
                        className="md:col-span-2 border-2 border-primary animate-in slide-in-from-top duration-300"
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Cold DM for {selectedJob.company}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold mb-2">Subject:</p>
                            <p className="text-sm bg-muted p-2 rounded">{coldDM.subject}</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold">Message:</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={copyDMToClipboard}
                              >
                                {copiedDM ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <textarea
                              readOnly
                              className="w-full text-sm bg-muted p-4 rounded border-0 resize-none focus:outline-none focus:ring-0 min-h-[200px]"
                              value={getCleanMessage(coldDM.message)}
                              rows={10}
                            />
                          </div>
                          <Button asChild className="w-full">
                            <a
                              href={coldDM.linkedinSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Find Recruiters on LinkedIn
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* GITHUB REPOS TAB */}
        <TabsContent value="repos" className="space-y-4">
          {loading.repos ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : repos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Github className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Could not load GitHub projects. This might be due to API rate limiting.
                  Try again in a few minutes, or add a GitHub token in your .env file for higher limits.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchRepos}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {repos.map((repo) => (
                <Card key={repo.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      {repo.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{repo.fullName}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {repo.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {repo.stars}
                      </span>
                      <Badge variant="secondary">{repo.language}</Badge>
                    </div>
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {repo.topics.slice(0, 3).map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button asChild className="w-full" variant="outline">
                      <a href={repo.link} target="_blank" rel="noopener noreferrer">
                        View on GitHub
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6 text-sm text-muted-foreground">Loading opportunities...</div>}>
      <ExploreContent />
    </Suspense>
  );
}


