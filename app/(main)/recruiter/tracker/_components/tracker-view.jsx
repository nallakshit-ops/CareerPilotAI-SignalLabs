"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Activity,
  Sparkles,
  Calendar,
  Video,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  FileText,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function TrackerView({ initialCalls }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Summary Metrics
  const stats = useMemo(() => {
    const total = initialCalls.length;
    const accepted = initialCalls.filter(c => c.candidateDecision === "accepted").length;
    const scheduled = initialCalls.filter(c => c.status === "scheduled").length;
    const hired = initialCalls.filter(c => c.status === "selected").length;
    const pendingResponse = initialCalls.filter(c => c.candidateDecision === "pending").length;

    return { total, accepted, scheduled, hired, pendingResponse };
  }, [initialCalls]);

  // Filtering Logic
  const filteredCalls = useMemo(() => {
    return initialCalls.filter((call) => {
      // 1. Search Query filter (match candidate name, email, or job title)
      const name = call.candidate?.name?.toLowerCase() || "";
      const email = call.candidate?.email?.toLowerCase() || "";
      const job = call.jobTitle?.toLowerCase() || "";
      const matchesSearch =
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        job.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Tab Filter
      if (activeTab === "all") return true;
      if (activeTab === "ai") {
        return (
          call.status === "pending" ||
          call.status === "accepted" ||
          call.status === "under_ai_review" ||
          call.status === "shortlisted"
        );
      }
      if (activeTab === "human") {
        return call.status === "scheduled";
      }
      if (activeTab === "final") {
        return call.status === "selected" || call.status === "rejected";
      }

      return true;
    });
  }, [initialCalls, searchQuery, activeTab]);

  // Map database currentStage & status to a step index (0-3) for visual tracking
  const getStageIndex = (call) => {
    const stage = call.currentStage?.toLowerCase() || "";
    const status = call.status?.toLowerCase() || "";

    if (status === "selected" || status === "rejected" || stage === "final decision") {
      return 3;
    }
    if (status === "scheduled" || stage === "human interview") {
      return 2;
    }
    if (
      status === "under_ai_review" ||
      status === "shortlisted" ||
      stage === "ai review" ||
      stage === "virtual interview" ||
      call.candidateDecision === "accepted"
    ) {
      return 1;
    }
    return 0; // Resume Screening / Invited
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "selected":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "rejected":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "scheduled":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "under_ai_review":
      case "shortlisted":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "accepted":
        return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getDecisionBadgeStyle = (decision) => {
    switch (decision) {
      case "accepted":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "declined":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.2)]">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter gradient-title">
                Candidate Pipeline Tracker
              </h1>
              <p className="text-muted-foreground text-sm">
                Monitor invited candidates, AI assessment reviews, and human interviews in real-time
              </p>
            </div>
          </div>
        </div>
        <Link href="/recruiter/explorer">
          <Button className="hover-lift flex items-center gap-2">
            <span>Invite More Candidates</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Invited", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/15" },
          { label: "Pending Resp.", value: stats.pendingResponse, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/15" },
          { label: "Accepted Calls", value: stats.accepted, icon: CheckCircle2, color: "text-indigo-400", bg: "bg-indigo-400/5", border: "border-indigo-400/15" },
          { label: "Human Syncs", value: stats.scheduled, icon: Calendar, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/15" },
          { label: "Hired / Selected", value: stats.hired, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/15" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="glass p-4 flex flex-col justify-between hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-lg ${item.bg} border ${item.border}`}>
                  <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-display tracking-tight text-foreground">
                  {item.value}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search & Tabs Controls */}
      <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Search bar */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidate name, job title, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-white/[0.08] focus:border-primary/50 rounded-xl"
            />
          </div>

          {/* Group Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 lg:col-span-2 justify-start lg:justify-end">
            {[
              { id: "all", label: "All Candidates" },
              { id: "ai", label: "AI Screening" },
              { id: "human", label: "Human Rounds" },
              { id: "final", label: "Hired & Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 border ${
                  activeTab === tab.id
                    ? "bg-primary text-white border-primary shadow-[0_0_15px_-3px_hsl(var(--primary)/0.4)]"
                    : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-6">
        {filteredCalls.length === 0 ? (
          <Card className="glass py-16 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display">No candidates found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search criteria or invite more candidates.
                </p>
              </div>
              <Link href="/recruiter/explorer">
                <Button variant="outline" className="mt-4 border-white/[0.08] hover:bg-white/[0.06]">
                  Open Candidate Explorer
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          filteredCalls.map((call) => {
            const activeStep = getStageIndex(call);
            const score = call.aiMatchScore;

            return (
              <Card key={call.id} className="glass hover-lift border-white/[0.08] relative overflow-hidden transition-all duration-300">
                {/* Glowing subtle top indicator based on status */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
                  call.status === "selected" ? "from-emerald-500 to-green-500" :
                  call.status === "rejected" ? "from-red-500 to-rose-500" :
                  call.status === "scheduled" ? "from-amber-500 to-yellow-500" :
                  "from-primary to-blue-500"
                } opacity-50`} />

                <div className="p-6 md:p-8 space-y-6">
                  {/* Candidate Bio & Job Meta info */}
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        {call.candidate?.imageUrl ? (
                          <img
                            src={call.candidate.imageUrl}
                            alt={call.candidate.name || "Candidate"}
                            className="w-14 h-14 rounded-2xl object-cover border border-white/[0.1] shadow-lg"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/20 flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold font-display text-primary">
                              {call.candidate?.name?.[0]?.toUpperCase() || "C"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Name, Email, Info */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold font-display text-foreground leading-none">
                            {call.candidate?.name || "Anonymous Candidate"}
                          </h2>
                          <Badge variant="outline" className="text-xs bg-white/[0.02] border-white/[0.08]">
                            {call.candidate?.experience ? `${call.candidate.experience} yrs exp` : "Entry Level"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{call.candidate?.email}</p>
                        
                        {/* Skills preview */}
                        {call.candidate?.skills && call.candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {call.candidate.skills.slice(0, 4).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/[0.04] text-muted-foreground border-transparent">
                                {skill}
                              </Badge>
                            ))}
                            {call.candidate.skills.length > 4 && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/[0.04] text-muted-foreground border-transparent">
                                +{call.candidate.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Details & Status Badges */}
                    <div className="lg:text-right space-y-2 w-full lg:w-auto flex flex-col items-start lg:items-end">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-muted-foreground">Applied position</div>
                        <div className="text-lg font-bold font-display text-primary">{call.jobTitle}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Status badge */}
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${getStatusBadgeStyle(call.status)}`}>
                          Pipeline: {call.status.replace("_", " ")}
                        </span>

                        {/* Decision badge */}
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${getDecisionBadgeStyle(call.candidateDecision)}`}>
                          Invite: {call.candidateDecision}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Stepper Line */}
                  <div className="py-4">
                    <div className="relative">
                      {/* Stepper track background */}
                      <div className="absolute top-[18px] left-[5%] right-[5%] h-1 bg-white/[0.04] rounded-full -translate-y-1/2" />
                      
                      {/* Stepper track filled */}
                      <div
                        className="absolute top-[18px] left-[5%] h-1 bg-primary/60 rounded-full -translate-y-1/2 transition-all duration-500"
                        style={{ width: `${(activeStep / 3) * 90}%` }}
                      />

                      <div className="grid grid-cols-4 relative z-10 text-center">
                        {[
                          { label: "Resume Screening", desc: "Invited" },
                          { label: "Virtual Interview", desc: "AI Screening" },
                          { label: "Human Interview", desc: "Human Round" },
                          { label: "Final Decision", desc: "Hired/Rejected" }
                        ].map((step, idx) => {
                          const isCompleted = activeStep > idx;
                          const isActive = activeStep === idx;
                          const isPending = activeStep < idx;

                          return (
                            <div key={idx} className="flex flex-col items-center">
                              {/* Step circle */}
                              <div className={`h-9 w-9 rounded-xl border flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                isCompleted ? "bg-primary border-primary text-white shadow-[0_0_15px_-3px_hsl(var(--primary)/0.6)]" :
                                isActive ? "bg-background border-primary text-primary shadow-[0_0_15px_-3px_hsl(var(--primary)/0.4)] scale-110" :
                                "bg-background border-white/[0.08] text-muted-foreground"
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span className="text-xs font-bold font-display mt-2 text-foreground hidden sm:block">
                                {step.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Interactive Cards Content based on active state */}
                  <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-5 md:p-6 space-y-4">
                    {/* Top Row matches */}
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-muted-foreground">
                          Current Stage: <span className="text-foreground font-bold">{call.currentStage || "Resume Screening"}</span>
                        </span>
                      </div>

                      {score !== null && (
                        <div className={`px-3 py-1.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 ${
                          score >= 75 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]" :
                          score >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]" :
                          "text-red-400 bg-red-500/10 border-red-500/20"
                        }`}>
                          <Sparkles className="h-4 w-4" />
                          <span>AI Match: {Math.round(score)}%</span>
                        </div>
                      )}
                    </div>

                    {/* 1. AI Mock Interview Completed Section */}
                    {(call.technicalScore !== null || call.status === "under_ai_review" || call.status === "shortlisted" || activeStep >= 1) && (
                      <div className="pt-2 border-t border-white/[0.04] space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                          <span>AI Virtual Interview Metrics</span>
                        </div>

                        {call.technicalScore !== null ? (
                          <div className="space-y-4">
                            {/* Score Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                { label: "Technical Competence", val: call.technicalScore, color: "bg-emerald-500", text: "text-emerald-400" },
                                { label: "Communication Skill", val: call.communicationScore, color: "bg-indigo-500", text: "text-indigo-400" },
                                { label: "Confidence Metric", val: call.confidenceScore, color: "bg-amber-500", text: "text-amber-400" }
                              ].map((bar, i) => (
                                <div key={i} className="space-y-1 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                                  <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-muted-foreground">{bar.label}</span>
                                    <span className={bar.text}>{bar.val}%</span>
                                  </div>
                                  <Progress value={bar.val} className="h-1.5" indicatorClassName={bar.color} />
                                </div>
                              ))}
                            </div>

                            {/* Interview Recommendation / Summary */}
                            {call.interviewSummary && (
                              <div className="bg-primary/[0.02] border border-primary/10 rounded-xl p-4 text-sm space-y-1">
                                <div className="font-bold flex items-center gap-1 text-primary">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>AI Interview Summary</span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-xs">
                                  {call.interviewSummary}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                            <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                            <span>Interview completed! Gemini is generating the match intelligence summary...</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Human round schedules */}
                    {call.status === "scheduled" && call.scheduledAt && (
                      <div className="pt-3 border-t border-white/[0.04] space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Human Interview Coordination
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-amber-400 font-semibold">
                              <Calendar className="h-4 w-4" />
                              <span>Scheduled: {new Date(call.scheduledAt).toLocaleDateString()} at {new Date(call.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {call.humanMessage && (
                              <p className="text-muted-foreground text-xs">{call.humanMessage}</p>
                            )}
                          </div>
                          {call.googleMeetLink && (
                            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-medium shrink-0 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]">
                              <a href={call.googleMeetLink} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-2 h-4 w-4" />
                                Join Google Meet
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. Rejection Feedbacks */}
                    {call.status === "rejected" && call.candidateFeedback && (
                      <div className="pt-3 border-t border-white/[0.04] space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Growth Plan & AI Rejection Feedback
                        </div>
                        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
                          <p className="font-semibold text-red-400/90 mb-1">Sent feedback details:</p>
                          {call.candidateFeedback}
                        </div>
                      </div>
                    )}

                    {/* 4. Selected Success state */}
                    {call.status === "selected" && (
                      <div className="pt-3 border-t border-white/[0.04]">
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-400/90">
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <div>
                            <span className="font-bold block text-sm">Hired! Selection finalized</span>
                            The candidate successfully navigated the entire pipeline and has been marked as Selected for hiring.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      Invited: {new Date(call.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-3">
                      <Link href={`/recruiter/candidate/${call.candidate?.id}`}>
                        <Button variant="outline" className="border-white/[0.08] hover:bg-white/[0.06] flex items-center gap-2 rounded-xl text-xs h-9">
                          <span>View Profile & Report</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
