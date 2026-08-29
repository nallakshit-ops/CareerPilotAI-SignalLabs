"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  Undo2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getCandidateApplications, withdrawApplication } from "@/actions/job";

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getCandidateApplications();
      setApplications(data);
    } catch (error) {
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    setWithdrawingId(appId);
    try {
      const res = await withdrawApplication({ applicationId: appId });
      if (res.success) {
        toast.success("Application withdrawn successfully.");
        await fetchApplications();
      }
    } catch (error) {
      toast.error(error.message || "Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
    }
  };

  // Candidate analytics
  const analytics = useMemo(() => {
    const total = applications.length;
    const shortlisted = applications.filter((a) =>
      [
        "shortlisted",
        "interview_invited",
        "interview_accepted",
        "interview_completed",
        "human_round_scheduled",
        "selected",
      ].includes(a.status),
    ).length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const selected = applications.filter((a) => a.status === "selected").length;
    const shortlistRate =
      total > 0 ? Math.round((shortlisted / total) * 100) : 0;

    return { total, shortlisted, rejected, selected, shortlistRate };
  }, [applications]);

  // Tab filtering
  const filteredApps = useMemo(() => {
    if (activeTab === "all") return applications;
    if (activeTab === "shortlisted")
      return applications.filter((a) =>
        [
          "shortlisted",
          "interview_invited",
          "interview_accepted",
          "interview_completed",
          "human_round_scheduled",
          "selected",
        ].includes(a.status),
      );
    if (activeTab === "rejected")
      return applications.filter((a) => a.status === "rejected");
    if (activeTab === "withdrawn")
      return applications.filter((a) => a.status === "withdrawn");
    return applications;
  }, [applications, activeTab]);

  // ATS pipeline stages mapping for the stepper UI
  const getStageIndex = (status) => {
    if (status === "selected") return 4;
    if (status === "human_round_scheduled") return 3;
    if (
      [
        "interview_invited",
        "interview_accepted",
        "interview_completed",
      ].includes(status)
    )
      return 2;
    if (status === "shortlisted") return 1;
    return 0; // applied, under_review, etc.
  };

  const getStatusColor = (status) => {
    if (status === "selected") return "text-emerald-400";
    if (status === "rejected") return "text-red-400";
    if (status === "withdrawn") return "text-gray-400";
    if (
      [
        "interview_invited",
        "interview_accepted",
        "interview_completed",
      ].includes(status)
    )
      return "text-purple-400";
    if (status === "human_round_scheduled") return "text-amber-400";
    if (status === "shortlisted") return "text-teal-400";
    return "text-blue-400";
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
          My Applications
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your job applications, view screening results, and monitor
          interview progress
        </p>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="glass border-white/[0.08]">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1 mt-2">
              Applied
            </span>
            <span className="text-2xl font-bold tracking-tight">
              {analytics.total}
            </span>
          </CardContent>
        </Card>
        <Card className="glass border-white/[0.08]">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1 mt-2">
              Shortlisted
            </span>
            <span className="text-2xl font-bold text-teal-400 tracking-tight">
              {analytics.shortlisted}
            </span>
          </CardContent>
        </Card>
        <Card className="glass border-white/[0.08]">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1 mt-2">
              Rejected
            </span>
            <span className="text-2xl font-bold text-red-400 tracking-tight">
              {analytics.rejected}
            </span>
          </CardContent>
        </Card>
        <Card className="glass border-white/[0.08]">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1 mt-2">
              Selected
            </span>
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">
              {analytics.selected}
            </span>
          </CardContent>
        </Card>
        <Card className="glass border-white/[0.08]">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1 mt-2">
              Shortlist Rate
            </span>
            <span className="text-2xl font-bold text-purple-400 tracking-tight">
              {analytics.shortlistRate}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-3">
        {[
          { key: "all", label: "All" },
          { key: "shortlisted", label: "Shortlisted" },
          { key: "rejected", label: "Rejected" },
          { key: "withdrawn", label: "Withdrawn" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm font-semibold tracking-tight px-4 py-1.5 rounded-lg transition-all ${
              activeTab === tab.key
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="glass border-dashed border-white/[0.08] py-16 text-center">
          <CardContent className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <ClipboardList className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-xl font-bold tracking-tight">
              No Applications Yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Start applying to job openings from the Browse Jobs page. Your
              deterministic screening results will appear here instantly.
            </p>
            <Button asChild className="rounded-xl">
              <a href="/jobs">Browse Jobs</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredApps.map((app) => {
            const breakdown = app.scoreBreakdown || {};
            const isExpanded = expandedId === app.id;
            const stageIdx = getStageIndex(app.status);
            const isRejected = app.status === "rejected";
            const isWithdrawn = app.status === "withdrawn";

            return (
              <Card
                key={app.id}
                className="glass border-white/[0.08] hover:border-white/[0.12] transition-all duration-300 overflow-hidden shadow-md"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top Row: Job info + status + score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 mt-5">
                      <h3 className="text-lg font-display font-bold tracking-tight text-foreground">
                        {app.job?.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />{" "}
                          {app.job?.companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {app.job?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{" "}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-5">
                      {/* Overall Score */}
                      <div
                        className={`text-center px-3 py-1.5 rounded-xl border ${app.qualificationScore >= 75 ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}
                      >
                        <span className="text-xs text-muted-foreground font-semibold block">
                          Score
                        </span>
                        <span
                          className={`text-lg font-bold ${app.qualificationScore >= 75 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {app.qualificationScore}%
                        </span>
                      </div>

                      {/* Status Badge */}
                      <Badge
                        className={`${getStatusColor(app.status)} bg-white/[0.04] border border-white/[0.08] text-xs font-semibold px-3 py-1`}
                      >
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Pipeline Stepper (only for non-rejected, non-withdrawn) */}
                  {!isRejected && !isWithdrawn && (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-muted-foreground">
                          Application Progress
                        </span>
                        <span className={`${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[
                          "Applied",
                          "Shortlisted",
                          "AI Screening",
                          "Human Round",
                          "Hired",
                        ].map((stage, idx) => (
                          <React.Fragment key={stage}>
                            <div
                              className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border transition-all ${
                                idx <= stageIdx
                                  ? "bg-primary/20 border-primary/40 text-primary"
                                  : "bg-white/[0.02] border-white/[0.08] text-muted-foreground"
                              }`}
                            >
                              {idx <= stageIdx ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            {idx < 4 && (
                              <div
                                className={`flex-1 h-0.5 rounded-full ${idx < stageIdx ? "bg-primary/40" : "bg-white/[0.06]"}`}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score Breakdown Bars */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                        <span>Skills</span>
                        <span>{breakdown.skillScore || 0}%</span>
                      </div>
                      <Progress
                        value={breakdown.skillScore || 0}
                        className="h-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                        <span>Experience</span>
                        <span>{breakdown.experienceScore || 0}%</span>
                      </div>
                      <Progress
                        value={breakdown.experienceScore || 0}
                        className="h-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                        <span>Profile</span>
                        <span>{breakdown.profileScore || 0}%</span>
                      </div>
                      <Progress
                        value={breakdown.profileScore || 0}
                        className="h-1.5"
                      />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <div className="flex gap-2">
                      {isRejected && app.rejectionFeedback && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-xs h-8"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : app.id)
                          }
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5 mr-1" /> Hide
                              Feedback
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />{" "}
                              View Improvement Tips
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Withdraw button */}
                    {!isRejected &&
                      !isWithdrawn &&
                      app.status !== "selected" &&
                      app.status !== "interview_invited" &&
                      app.status !== "human_round_scheduled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-xs h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawingId === app.id}
                        >
                          {withdrawingId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Undo2 className="w-3.5 h-3.5 mr-1" /> Withdraw
                            </>
                          )}
                        </Button>
                      )}
                  </div>

                  {/* Expanded Rejection Feedback */}
                  {isExpanded && app.rejectionFeedback && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-3 border border-amber-500/20 bg-amber-500/5 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Personalized
                        Improvement Guide
                      </h4>

                      {app.rejectionFeedback.missingSkills?.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-foreground">
                            Missing Skills:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {app.rejectionFeedback.missingSkills.map(
                              (skill, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[10px] border-amber-500/20 text-amber-400 bg-amber-500/5"
                                >
                                  {skill}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {app.rejectionFeedback.improvementSuggestions?.length >
                        0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-foreground">
                            Suggestions:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                            {app.rejectionFeedback.improvementSuggestions.map(
                              (s, idx) => (
                                <li key={idx}>{s}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
