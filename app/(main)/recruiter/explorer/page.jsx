"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  User,
  Briefcase,
  Code,
  ChevronDown,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useFetch from "@/hooks/use-fetch";
import { searchCandidates, toggleSaveCandidate, getSavedCandidates, extractSkillsFromJD } from "@/actions/recruiter";
import { toast } from "sonner";

const CandidateExplorerInner = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("explore");

  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [sortBy, setSortBy] = useState("experience");
  const [page, setPage] = useState(1);
  const [allCandidates, setAllCandidates] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const [jdExpanded, setJdExpanded] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [extracting, setExtracting] = useState(false);

  const {
    data: searchResult,
    loading: searchLoading,
    fn: doSearch,
  } = useFetch(searchCandidates);

  const { fn: doToggleSave } = useFetch(toggleSaveCandidate);

  const {
    data: savedResult,
    loading: savedLoading,
    fn: fetchSaved,
  } = useFetch(getSavedCandidates);

  // Sync tab state from query parameter tab=saved
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "saved") {
      setActiveTab("saved");
      fetchSaved();
    }
  }, [searchParams, fetchSaved]);

  const handleExtractSkills = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first.");
      return;
    }
    setExtracting(true);
    try {
      const extractedSkills = await extractSkillsFromJD(jobDescription);
      if (extractedSkills && extractedSkills.length > 0) {
        const existingSkills = skills.split(",").map(s => s.trim()).filter(Boolean);
        const newSkills = Array.from(new Set([...existingSkills, ...extractedSkills]));
        setSkills(newSkills.join(", "));
        toast.success("Skills extracted successfully!");

        // Auto-trigger search
        setPage(1);
        setHasSearched(true);
        doSearch({
          skills: newSkills,
          experience: experience ? parseInt(experience, 10) : undefined,
          sortBy,
          page: 1,
        });
      } else {
        toast.info("No skills found in the job description.");
      }
    } catch (error) {
      toast.error("Failed to extract skills.");
    } finally {
      setExtracting(false);
    }
  };

  // Load saved candidates when switcher is on "saved"
  useEffect(() => {
    if (activeTab === "saved") {
      fetchSaved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Append new results when search completes
  useEffect(() => {
    if (searchResult?.candidates) {
      if (page === 1) {
        setAllCandidates(searchResult.candidates);
      } else {
        setAllCandidates((prev) => [...prev, ...searchResult.candidates]);
      }

      // Track saved IDs from response
      if (searchResult.savedIds) {
        setSavedIds(new Set(searchResult.savedIds));
      }
    }
  }, [searchResult, page]);

  // Also sync savedIds from getSavedCandidates response so heart icons toggle accurately
  useEffect(() => {
    if (savedResult) {
      const ids = new Set(savedResult.map(item => item.candidate?.id).filter(Boolean));
      setSavedIds(ids);
    }
  }, [savedResult]);

  const handleSearch = useCallback(() => {
    setPage(1);
    setHasSearched(true);
    doSearch({
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experience: experience ? parseInt(experience, 10) : undefined,
      sortBy,
      page: 1,
    });
  }, [skills, experience, sortBy, doSearch]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch({
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experience: experience ? parseInt(experience, 10) : undefined,
      sortBy,
      page: nextPage,
    });
  }, [page, skills, experience, sortBy, doSearch]);

  const handleToggleSave = useCallback(
    async (candidateId) => {
      // Optimistic toggle
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(candidateId)) {
          next.delete(candidateId);
        } else {
          next.add(candidateId);
        }
        return next;
      });
      await doToggleSave({ candidateId });
      
      // Trigger a refetch if we are looking at the saved list
      if (activeTab === "saved") {
        fetchSaved();
      }
    },
    [doToggleSave, activeTab, fetchSaved]
  );

  // Trigger initial search on mount to populate candidates list instantly
  useEffect(() => {
    doSearch({
      skills: [],
      experience: undefined,
      sortBy: "experience",
      page: 1,
    });
    setHasSearched(true);
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = searchResult?.hasMore ?? false;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter gradient-title">
              Candidate Discovery Engine
            </h1>
            <p className="text-muted-foreground text-sm">
              Find the perfect talent with AI-powered search
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/[0.06]">
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 ${
            activeTab === "explore"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="h-4 w-4" />
          Explore Talent
        </button>
        <button
          onClick={() => {
            setActiveTab("saved");
            fetchSaved();
          }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 ${
            activeTab === "saved"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Saved Candidates
          {savedResult && savedResult.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 text-[10px] bg-primary/15 text-primary border border-primary/25 px-1.5 py-0">
              {savedResult.length}
            </Badge>
          )}
        </button>
      </div>

      {activeTab === "explore" ? (
        <>
          {/* Search Controls */}
          <Card className="glass">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-display tracking-tight">
                  Search Filters
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main search row */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_160px_auto] gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Skills (comma-separated) e.g. React, Node.js, Python"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="pl-10 h-11"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                <Input
                  type="number"
                  placeholder="Min. experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  min={0}
                  className="h-11"
                />

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] pl-3 pr-8 py-2 text-sm shadow-sm backdrop-blur-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 hover:border-white/[0.15] hover:bg-white/[0.06] appearance-none cursor-pointer"
                  >
                    <option value="experience" className="bg-background text-foreground">
                      Sort: Experience
                    </option>
                    <option value="newest" className="bg-background text-foreground">
                      Sort: Newest
                    </option>
                    <option value="name" className="bg-background text-foreground">
                      Sort: Name
                    </option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                <Button onClick={handleSearch} size="lg" className="h-11 px-8">
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Search</span>
                </Button>
              </div>

              {/* JD Upload (Collapsible) */}
              <div>
                <button
                  onClick={() => setJdExpanded(!jdExpanded)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      jdExpanded ? "rotate-180" : ""
                    }`}
                  />
                  Paste Job Description (optional)
                </button>

                {jdExpanded && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here to help refine your search..."
                      rows={5}
                      className="flex w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 hover:border-white/[0.15] hover:bg-white/[0.06] resize-none"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={extracting || !jobDescription.trim()}
                      onClick={handleExtractSkills}
                    >
                      {extracting ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                      {extracting ? "Extracting..." : "Extract Skills"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {searchLoading && page === 1 ? (
            // Loading Skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="glass">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !hasSearched ? (
            // Initial Empty State
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-5">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold tracking-tight mb-2">
                  Discover Top Talent
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Enter skills and filters above to search through your candidate
                  pool. Use comma-separated values for multiple skills.
                </p>
              </CardContent>
            </Card>
          ) : allCandidates.length === 0 ? (
            // No Results State
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-5">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-display font-bold tracking-tight mb-2">
                  No Candidates Found
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Try adjusting your search filters or broadening your skills
                  criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            // Results Grid
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {allCandidates.length}
                  </span>{" "}
                  candidate{allCandidates.length !== 1 && "s"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {allCandidates.map((candidate, index) => {
                  const isSaved = savedIds.has(candidate.id);
                  const rank = index + 1;
                  
                  const getOrdinal = (n) => {
                    const s = ["th", "st", "nd", "rd"];
                    const v = n % 100;
                    return n + (s[(v - 20) % 10] || s[v] || s[0]);
                  };

                  let badgeColor = "bg-white/[0.04] text-muted-foreground border-white/[0.08]";
                  if (rank === 1) badgeColor = "bg-amber-400/10 text-amber-400 border-amber-400/30 shadow-[0_0_10px_-2px_rgba(251,191,36,0.3)]";
                  else if (rank === 2) badgeColor = "bg-slate-300/10 text-slate-300 border-slate-300/30 shadow-[0_0_10px_-2px_rgba(203,213,225,0.3)]";
                  else if (rank === 3) badgeColor = "bg-orange-400/10 text-orange-400 border-orange-400/30 shadow-[0_0_10px_-2px_rgba(251,146,60,0.3)]";

                  return (
                    <Card
                      key={candidate.id}
                      className="group glass hover-lift card-glow relative"
                    >
                      {/* Rank Badge */}
                      {candidate.matchCount !== undefined && (
                        <div className={`absolute -top-3 -left-3 px-3 py-1.5 rounded-xl border text-xs font-bold font-display ${badgeColor} flex items-center gap-1.5 backdrop-blur-xl z-20`}>
                          <Sparkles className="h-3.5 w-3.5" />
                          {getOrdinal(rank)} Match
                        </div>
                      )}
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-white/[0.08]">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display font-semibold tracking-tight truncate">
                                {candidate.name}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {candidate.email}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleSave(candidate.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.12] shrink-0"
                            title={isSaved ? "Remove bookmark" : "Bookmark candidate"}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-4 w-4 text-amber-400" />
                            ) : (
                              <Bookmark className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Skills */}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.slice(0, 5).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 5 && (
                              <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground"
                              >
                                +{candidate.skills.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {candidate.experience !== undefined && (
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5" />
                              {candidate.experience} yrs
                            </span>
                          )}
                          {candidate.industry && (
                            <span className="flex items-center gap-1.5">
                              <Code className="h-3.5 w-3.5" />
                              {candidate.industry}
                            </span>
                          )}
                        </div>

                        {/* View Profile */}
                        <Link href={`/recruiter/candidate/${candidate.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-1"
                          >
                            <User className="h-3.5 w-3.5 mr-1.5" />
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={searchLoading}
                    className="px-10"
                  >
                    {searchLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Load More Candidates
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Saved Candidates List */}
          {savedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="glass">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !savedResult || savedResult.length === 0 ? (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/20 mb-5">
                  <Bookmark className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-display font-bold tracking-tight mb-2">
                  No Saved Candidates
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  You haven't bookmarked any candidate profiles yet. Bookmarked profiles will appear here for quick access.
                </p>
                <Button variant="outline" className="mt-4 border-white/[0.08] hover:bg-white/[0.06]" onClick={() => setActiveTab("explore")}>
                  Explore Candidates
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  You have saved{" "}
                  <span className="font-semibold text-foreground">
                    {savedResult.length}
                  </span>{" "}
                  candidate{savedResult.length !== 1 && "s"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {savedResult.map((item) => {
                  const candidate = item.candidate;
                  if (!candidate) return null;
                  const isSaved = savedIds.has(candidate.id);

                  return (
                    <Card
                      key={item.savedId}
                      className="group glass hover-lift card-glow animate-fade-in"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-accent/20 border border-amber-400/10">
                              {candidate.imageUrl ? (
                                <img
                                  src={candidate.imageUrl}
                                  alt={candidate.name || "Candidate"}
                                  className="w-11 h-11 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-amber-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display font-semibold tracking-tight truncate">
                                {candidate.name}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {candidate.email}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleSave(candidate.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.12] shrink-0"
                            title="Remove bookmark"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-4 w-4 text-amber-400" />
                            ) : (
                              <Bookmark className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Skills */}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.slice(0, 5).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 5 && (
                              <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground"
                              >
                                +{candidate.skills.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {candidate.experience !== undefined && (
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5" />
                              {candidate.experience} yrs
                            </span>
                          )}
                          {candidate.industry && (
                            <span className="flex items-center gap-1.5">
                              <Code className="h-3.5 w-3.5" />
                              {candidate.industry}
                            </span>
                          )}
                        </div>

                        {/* View Profile */}
                        <Link href={`/recruiter/candidate/${candidate.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-1 border-amber-400/20 hover:border-amber-400/30 hover:bg-amber-400/5 text-foreground"
                          >
                            <User className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function CandidateExplorer() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading talent database...</div>}>
      <CandidateExplorerInner />
    </Suspense>
  );
}
