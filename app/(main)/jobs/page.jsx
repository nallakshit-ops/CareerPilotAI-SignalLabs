"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Target,
  ArrowUpRight,
  Filter,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getJobs, applyToJob } from "@/actions/job";

export default function CandidateJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expFilter, setExpFilter] = useState("all");

  // Expanded rejection feedback cards
  const [expandedFeedback, setExpandedFeedback] = useState({});

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs({});
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (error) {
      toast.error("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    setApplyingTo(jobId);
    try {
      const res = await applyToJob({ jobId });
      if (res.success) {
        const app = res.application;
        if (app.status === "shortlisted") {
          toast.success(
            `🎉 Congratulations! You've been shortlisted with a ${app.qualificationScore}% match score!`,
          );
        } else {
          toast.error(
            `Your qualification score (${app.qualificationScore}%) was below the threshold. Check the feedback below for improvement tips.`,
          );
        }
        // Refresh job list to update applied states
        await fetchJobs();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setApplyingTo(null);
    }
  };

  const toggleFeedback = (jobId) => {
    setExpandedFeedback((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  // Client-side filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation =
        locationFilter === "all" ||
        job.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        job.employmentType.toLowerCase().includes(typeFilter.toLowerCase());

      const matchesExp =
        expFilter === "all" ||
        (expFilter === "intern" && job.minExperience === 0) ||
        (expFilter === "entry" && job.minExperience <= 2) ||
        (expFilter === "mid" &&
          job.minExperience >= 2 &&
          job.minExperience <= 5) ||
        (expFilter === "senior" && job.minExperience >= 5);

      return matchesSearch && matchesLocation && matchesType && matchesExp;
    });
  }, [jobs, searchQuery, locationFilter, typeFilter, expFilter]);

  const getStatusBadge = (job) => {
    if (!job.alreadyApplied) return null;
    if (job.applicationStatus === "shortlisted") {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Shortlisted —{" "}
          {job.applicationScore}%
        </Badge>
      );
    }
    if (job.applicationStatus === "rejected") {
      return (
        <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5">
          <XCircle className="w-3 h-3 mr-1" /> Not Qualified —{" "}
          {job.applicationScore}%
        </Badge>
      );
    }
    if (job.applicationStatus === "withdrawn") {
      return (
        <Badge className="bg-gray-500/15 text-gray-400 border-gray-500/30 text-xs font-semibold px-2.5 py-0.5">
          Withdrawn
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-xs font-semibold px-2.5 py-0.5 capitalize">
        <Clock className="w-3 h-3 mr-1" />{" "}
        {job.applicationStatus?.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Browse Job Openings
        </h1>
        <p className="text-muted-foreground text-lg">
          Apply instantly — our deterministic matching engine evaluates your
          profile in real-time
        </p>
      </div>

      {/* Filters Card */}
      <Card className="glass shadow-lg">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/[0.02] border-white/[0.08] rounded-xl">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            <Select value={expFilter} onValueChange={setExpFilter}>
              <SelectTrigger className="bg-white/[0.02] border-white/[0.08] rounded-xl">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="intern">Internship (0 yrs)</SelectItem>
                <SelectItem value="entry">Entry (0-2 yrs)</SelectItem>
                <SelectItem value="mid">Mid (2-5 yrs)</SelectItem>
                <SelectItem value="senior">Senior (5+ yrs)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground font-medium">
        Showing {filteredJobs.length} of {jobs.length} openings
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="glass border-dashed border-white/[0.08] py-16 text-center">
          <CardContent className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <Briefcase className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-xl font-bold tracking-tight">
              No Openings Found
            </h3>
            <p className="text-muted-foreground text-sm">
              There are no job postings matching your filters. Check back later
              or try different criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="glass border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 relative group overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 space-y-4">
                {/* Top: Title + Status Badge */}
                <div className="flex items-start justify-between gap-3 my-10">
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-lg font-display font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                      {job.companyName}
                    </p>
                  </div>
                  {getStatusBadge(job)}
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.05]">
                    <MapPin className="w-3 h-3 text-sky-400" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.05]">
                    <Briefcase className="w-3 h-3 text-amber-400" />{" "}
                    {job.employmentType}
                  </span>
                  <span className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.05]">
                    <Clock className="w-3 h-3 text-purple-400" /> Min{" "}
                    {job.minExperience} Yrs Exp
                  </span>
                  <span className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.05]">
                    <Target className="w-3 h-3 text-primary" /> Threshold:{" "}
                    {job.qualificationThreshold}%
                  </span>
                </div>

                {/* Required Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills?.slice(0, 5).map((skill, i) => (
                    <Badge
                      key={`${skill}-${i}`}
                      variant="secondary"
                      className="bg-white/[0.04] border-white/[0.06] text-xs px-2 py-0.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {job.requiredSkills?.length > 5 && (
                    <Badge
                      variant="outline"
                      className="border-white/[0.08] text-xs bg-transparent"
                    >
                      +{job.requiredSkills.length - 5} more
                    </Badge>
                  )}
                </div>

                {/* Description preview */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                  {job.description}
                </p>

                {/* Applicants count */}
                <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />{" "}
                  {job.applicationsCount} applicant
                  {job.applicationsCount !== 1 ? "s" : ""}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  {job.alreadyApplied ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        disabled
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs h-9 flex-1 opacity-60 cursor-not-allowed"
                      >
                        Already Applied
                      </Button>
                      {job.applicationStatus === "rejected" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-xs h-9"
                          onClick={() => toggleFeedback(job.id)}
                        >
                          {expandedFeedback[job.id] ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5 mr-1" /> Hide
                              Feedback
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5 mr-1" /> View
                              Feedback
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="rounded-xl text-xs h-9 shadow-md hover-lift flex-1"
                      onClick={() => handleApply(job.id)}
                      disabled={applyingTo === job.id}
                    >
                      {applyingTo === job.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />{" "}
                          Screening...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Apply Now
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Expanded Rejection Feedback Panel */}
                {job.alreadyApplied &&
                  job.applicationStatus === "rejected" &&
                  expandedFeedback[job.id] && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-3 border border-red-500/20 bg-red-500/5 p-4 rounded-xl mt-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <h4 className="text-sm font-bold text-red-400">
                          Improvement Guidance
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Your qualification score of{" "}
                        <strong>{job.applicationScore}%</strong> was below the{" "}
                        {job.qualificationThreshold}% threshold for this
                        position.
                      </p>
                      <div className="text-xs text-muted-foreground space-y-2">
                        <p className="font-semibold text-foreground">
                          Suggested improvements:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>
                            Strengthen the skills listed in this job&apos;s
                            requirements that are missing from your profile.
                          </li>
                          <li>
                            Gain more practical experience through projects and
                            certifications.
                          </li>
                          <li>
                            Update your profile and resume to accurately reflect
                            your latest capabilities.
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
