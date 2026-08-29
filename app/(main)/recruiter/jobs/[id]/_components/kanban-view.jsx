"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  Calendar,
  PhoneCall,
  Save,
  UserCheck,
  Video,
  FileBadge,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { updateApplicationStatus } from "@/actions/job";

export default function KanbanView({ initialJob, initialAnalytics }) {
  const router = useRouter();
  const [job, setJob] = useState(initialJob);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [searchQuery, setSearchQuery] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState(50);

  // Selected candidate drawer state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Active tab inside drawer details
  const [activeDrawerTab, setActiveDrawerTab] = useState("profile");

  const handleCardClick = (app) => {
    setSelectedApp(app);
    setRecruiterNotes(app.recruiterNotes || "");
    setActiveDrawerTab("profile");
    setIsDrawerOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    try {
      const res = await updateApplicationStatus({
        applicationId: selectedApp.id,
        status: selectedApp.status,
        recruiterNotes,
      });

      if (res.success) {
        toast.success("Recruiter comments updated successfully!");
        // Update local state
        const updatedApps = job.applications.map((app) =>
          app.id === selectedApp.id ? { ...app, recruiterNotes } : app,
        );
        setJob({ ...job, applications: updatedApps });
        setSelectedApp({ ...selectedApp, recruiterNotes });
      }
    } catch (error) {
      toast.error(error.message || "Failed to save recruiter comments");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      const res = await updateApplicationStatus({
        applicationId: selectedApp.id,
        status: newStatus,
        recruiterNotes,
      });

      if (res.success) {
        toast.success(
          `Candidate status moved to ${newStatus.replace("_", " ")}!`,
        );

        // Dynamic messaging
        if (newStatus === "interview_invited") {
          toast.success(
            "AI interview pre-screening call automatically generated!",
          );
        }

        // Update local state
        const updatedApps = job.applications.map((app) =>
          app.id === selectedApp.id
            ? { ...app, status: newStatus, recruiterNotes }
            : app,
        );
        setJob({ ...job, applications: updatedApps });
        setSelectedApp({ ...selectedApp, status: newStatus, recruiterNotes });
        setIsDrawerOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update candidate status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Define column mappings
  const columns = [
    {
      id: "Applied",
      title: "Applied Pool",
      color: "border-blue-400/20 bg-blue-400/5",
      badgeColor: "bg-blue-400/10 text-blue-400",
      statuses: ["applied", "under_review"],
    },
    {
      id: "Shortlisted",
      title: "Shortlisted",
      color: "border-teal-400/20 bg-teal-400/5",
      badgeColor: "bg-teal-400/10 text-teal-400",
      statuses: ["shortlisted"],
    },
    {
      id: "Interview",
      title: "AI Screening",
      color: "border-purple-400/20 bg-purple-400/5",
      badgeColor: "bg-purple-400/10 text-purple-400",
      statuses: [
        "interview_invited",
        "interview_accepted",
        "interview_completed",
      ],
    },
    {
      id: "HumanRound",
      title: "Human Round",
      color: "border-amber-400/20 bg-amber-400/5",
      badgeColor: "bg-amber-400/10 text-amber-400",
      statuses: ["human_round_scheduled"],
    },
    {
      id: "Selected",
      title: "Hired 🎉",
      color: "border-emerald-400/20 bg-emerald-400/5",
      badgeColor: "bg-emerald-400/10 text-emerald-400",
      statuses: ["selected"],
    },
    {
      id: "Rejected",
      title: "Rejected",
      color: "border-red-400/20 bg-red-400/5",
      badgeColor: "bg-red-400/10 text-red-400",
      statuses: ["rejected", "withdrawn"],
    },
  ];

  // Filtering applicant cards
  const filteredApps = job.applications.filter((app) => {
    const candidateName = app.candidate?.name || "";
    const matchesSearch = candidateName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesScore = app.qualificationScore >= minScoreFilter;
    return matchesSearch && matchesScore;
  });

  return (
    <div className="space-y-6">
      {/* Filtering Toolbar */}
      <Card className="glass border-white/[0.08] shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md mt-5">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.02] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:max-w-sm">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 space-y-1 mt-4">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Min Match Score</span>
                  <span>{minScoreFilter}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban columns grid */}
      <div className="flex flex-col lg:flex-row gap-5 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((col) => {
          const colApps = filteredApps.filter((app) =>
            col.statuses.includes(app.status),
          );
          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-2xl border ${col.color} p-4 min-h-[500px] w-full lg:w-[280px] xl:w-[320px] shrink-0 space-y-4`}
            >
              {/* Header column title */}
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <h3 className="font-display font-bold text-sm tracking-tight text-foreground">
                  {col.title}
                </h3>
                <Badge
                  className={`rounded-lg text-xs font-bold px-2 py-0.5 border-0 ${col.badgeColor}`}
                >
                  {colApps.length}
                </Badge>
              </div>

              {/* Candidates cards list */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-none">
                {colApps.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-10 border border-dashed border-white/[0.04] rounded-xl">
                    <span className="text-xs text-muted-foreground italic">
                      Empty column
                    </span>
                  </div>
                ) : (
                  colApps.map((app) => {
                    const breakdown = app.scoreBreakdown || {};
                    return (
                      <div
                        key={app.id}
                        onClick={() => handleCardClick(app)}
                        className="glass border-white/[0.06] hover:border-white/[0.15] hover:shadow-md transition-all duration-300 p-4 rounded-xl cursor-pointer space-y-3 relative group"
                      >
                        <div className="flex items-center gap-2.5">
                          {app.candidate?.imageUrl ? (
                            <img
                              src={app.candidate.imageUrl}
                              alt={app.candidate.name}
                              className="w-8 h-8 rounded-full border border-white/[0.08]"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                              {app.candidate?.name?.[0] || "?"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                              {app.candidate?.name}
                            </h4>
                            <span className="text-xs text-muted-foreground font-medium block">
                              Exp:{" "}
                              {app.experienceSnapshot ||
                                app.candidate?.experience ||
                                0}{" "}
                              Yrs
                            </span>
                          </div>
                        </div>

                        {/* Scores Gauge */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
                          <span className="text-muted-foreground font-medium">
                            Match Score
                          </span>
                          <span
                            className={`font-bold ${app.qualificationScore >= 75 ? "text-emerald-400" : "text-amber-400"}`}
                          >
                            {app.qualificationScore}%
                          </span>
                        </div>

                        <div className="w-full bg-white/[0.04] h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${app.qualificationScore >= 75 ? "bg-emerald-400" : "bg-amber-400"}`}
                            style={{ width: `${app.qualificationScore}%` }}
                          />
                        </div>

                        {/* Badges preview */}
                        {app.status === "withdrawn" && (
                          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] w-full text-center block">
                            Withdrawn
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Profile Detail Drawer Dialog */}
      <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DialogContent className="glass-strong border-white/[0.08] max-w-4xl p-0 overflow-hidden shadow-2xl rounded-2xl">
          {selectedApp && (
            <div className="flex flex-col md:flex-row h-[85vh] md:h-[680px] max-h-[680px]">
              {/* Left Panel: Profile Detail, snapshots, resume */}
              <div className="flex-1 flex flex-col border-r-0 md:border-r border-b md:border-b-0 border-white/[0.06] overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    {selectedApp.candidate?.imageUrl ? (
                      <img
                        src={selectedApp.candidate.imageUrl}
                        alt={selectedApp.candidate?.name}
                        className="w-12 h-12 rounded-full border border-white/[0.08]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                        {selectedApp.candidate?.name?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <DialogTitle className="text-xl font-display font-bold text-foreground">
                        {selectedApp.candidate?.name}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground text-xs font-medium">
                        {selectedApp.candidate?.email}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                {/* Snapshots Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Snapshot Tab selector */}
                  <div className="flex border-b border-white/[0.06] pb-1.5 gap-4 overflow-x-auto scrollbar-none flex-nowrap shrink-0">
                    <button
                      onClick={() => setActiveDrawerTab("profile")}
                      className={`text-sm font-semibold tracking-tight pb-1.5 border-b-2 transition-all ${activeDrawerTab === "profile" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      Score Breakdown
                    </button>
                    <button
                      onClick={() => setActiveDrawerTab("snapshot")}
                      className={`text-sm font-semibold tracking-tight pb-1.5 border-b-2 transition-all ${activeDrawerTab === "snapshot" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      Skills Snapshot
                    </button>
                    <button
                      onClick={() => setActiveDrawerTab("resume")}
                      className={`text-sm font-semibold tracking-tight pb-1.5 border-b-2 transition-all ${activeDrawerTab === "resume" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      Resume Snapshot
                    </button>
                    <button
                      onClick={() => setActiveDrawerTab("interview")}
                      className={`text-sm font-semibold tracking-tight pb-1.5 border-b-2 transition-all ${activeDrawerTab === "interview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      Interview Results
                    </button>
                  </div>

                  {activeDrawerTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Metric gauges */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl text-center">
                          <span className="text-xs text-muted-foreground font-semibold block uppercase tracking-wider mb-1">
                            Skills Match
                          </span>
                          <span className="text-2xl font-bold text-blue-400">
                            {selectedApp.scoreBreakdown?.skillScore || 0}%
                          </span>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl text-center">
                          <span className="text-xs text-muted-foreground font-semibold block uppercase tracking-wider mb-1">
                            Exp Match
                          </span>
                          <span className="text-2xl font-bold text-amber-400">
                            {selectedApp.scoreBreakdown?.experienceScore || 0}%
                          </span>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl text-center">
                          <span className="text-xs text-muted-foreground font-semibold block uppercase tracking-wider mb-1">
                            Profile Alignment
                          </span>
                          <span className="text-2xl font-bold text-purple-400">
                            {selectedApp.scoreBreakdown?.profileScore || 0}%
                          </span>
                        </div>
                      </div>

                      {/* Overall details */}
                      <div className="space-y-4 bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl shadow-inner">
                        <h4 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-primary" />{" "}
                          Deterministic Profile Summary
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                          Candidate has {selectedApp.experienceSnapshot || 0}{" "}
                          years of experience. Handled canonical skill mappings
                          against required job listings, resolving synonym
                          mismatches and producing a weighted screening score of{" "}
                          <strong>{selectedApp.qualificationScore}%</strong>.
                        </p>
                      </div>

                      {/* Rejection / Feedback details */}
                      {selectedApp.status === "rejected" &&
                        selectedApp.rejectionFeedback && (
                          <div className="space-y-3 border border-red-500/20 bg-red-500/5 p-5 rounded-2xl">
                            <h4 className="text-sm font-bold tracking-tight text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-red-400" />{" "}
                              Rejection Gaps Feedback
                            </h4>
                            <div className="space-y-1.5 text-xs text-muted-foreground font-medium">
                              <p className="text-foreground">
                                Missing required skills:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {selectedApp.rejectionFeedback.missingSkills?.map(
                                  (s, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-[10px] border-red-500/20 text-red-400 bg-red-500/5"
                                    >
                                      {s}
                                    </Badge>
                                  ),
                                )}
                              </div>
                              <p className="text-foreground mt-2">
                                Improvement suggestions provided to candidate:
                              </p>
                              <ul className="list-disc pl-4 space-y-1">
                                {selectedApp.rejectionFeedback.improvementSuggestions?.map(
                                  (s, idx) => (
                                    <li key={idx}>{s}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {activeDrawerTab === "snapshot" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div>
                        <h4 className="text-sm font-bold tracking-tight text-foreground mb-2">
                          Skills at time of application:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.skillsSnapshot?.map((skill, index) => (
                            <Badge
                              key={index}
                              className="bg-white/[0.04] border border-white/[0.08] text-sm text-foreground/90 rounded-lg"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {(!selectedApp.skillsSnapshot ||
                            selectedApp.skillsSnapshot.length === 0) && (
                            <span className="text-xs text-muted-foreground italic">
                              No skills snapshot recorded.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/[0.04]">
                        <h4 className="text-sm font-bold tracking-tight text-foreground mb-2">
                          Experience level:
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium">
                          {selectedApp.experienceSnapshot || 0} Years of
                          Professional Experience
                        </p>
                      </div>
                    </div>
                  )}

                  {activeDrawerTab === "resume" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl max-h-[300px] overflow-y-auto leading-relaxed text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                        {selectedApp.resumeSnapshot ||
                          "No resume snapshot available."}
                      </div>
                    </div>
                  )}

                  {activeDrawerTab === "interview" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {selectedApp.interviewCall ? (
                        <>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl text-center">
                              <span className="text-xs text-muted-foreground font-semibold block uppercase tracking-wider mb-1">
                                Technical
                              </span>
                              <span className="text-2xl font-bold text-blue-400">
                                {Math.round(
                                  selectedApp.interviewCall.technicalScore || 0,
                                )}
                                %
                              </span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl text-center">
                              <span className="text-xs text-muted-foreground font-semibold block uppercase tracking-wider mb-1">
                                Communication
                              </span>
                              <span className="text-2xl font-bold text-amber-400">
                                {Math.round(
                                  selectedApp.interviewCall
                                    .communicationScore || 0,
                                )}
                                %
                              </span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl text-center">
                              <span className="text-xs text-muted-foreground font-semibold block uppercase tracking-wider mb-1">
                                Confidence
                              </span>
                              <span className="text-2xl font-bold text-purple-400">
                                {Math.round(
                                  selectedApp.interviewCall.confidenceScore ||
                                    0,
                                )}
                                %
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3 bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl shadow-inner">
                            <h4 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-primary" />{" "}
                              Interview Summary
                            </h4>
                            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                              {selectedApp.interviewCall.interviewSummary ||
                                "No interview summary available yet."}
                            </p>
                            {selectedApp.interviewCall
                              .interviewRecommendation && (
                              <p className="text-xs text-muted-foreground font-semibold">
                                Recommendation:{" "}
                                {
                                  selectedApp.interviewCall
                                    .interviewRecommendation
                                }
                              </p>
                            )}
                          </div>

                          {Array.isArray(
                            selectedApp.interviewCall.interviewTranscript,
                          ) &&
                            selectedApp.interviewCall.interviewTranscript
                              .length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-bold tracking-tight text-foreground">
                                  Transcript Highlights
                                </h4>
                                <div className="space-y-3 max-h-[240px] overflow-y-auto">
                                  {selectedApp.interviewCall.interviewTranscript.map(
                                    (entry, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4"
                                      >
                                        <p className="text-xs text-muted-foreground font-semibold">
                                          Q{idx + 1}: {entry.question}
                                        </p>
                                        <p className="text-sm text-foreground mt-2">
                                          {entry.answer}
                                        </p>
                                        {entry.score != null && (
                                          <p className="text-xs text-muted-foreground mt-2">
                                            Score: {entry.score}%
                                          </p>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </>
                      ) : (
                        <div className="border border-dashed border-white/[0.08] rounded-2xl p-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            No interview results available yet.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Notes comments and status transits */}
              <div className="w-full md:w-[320px] bg-white/[0.01] p-6 flex flex-col justify-between overflow-y-auto space-y-6">
                {/* Notes Column */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                    <FileBadge className="w-4 h-4 text-primary" /> Recruiter
                    Comments
                  </h4>
                  <Textarea
                    placeholder="Write private notes, hiring comments, or HR sync feedback..."
                    value={recruiterNotes}
                    onChange={(e) => setRecruiterNotes(e.target.value)}
                    rows={6}
                    className="bg-white/[0.02] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 rounded-xl leading-relaxed text-xs"
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    size="sm"
                    className="w-full rounded-xl flex items-center justify-center gap-1.5 h-10 shadow-sm"
                  >
                    {savingNotes ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Comments
                      </>
                    )}
                  </Button>
                </div>

                {/* Status Transitions */}
                <div className="space-y-3 pt-6 border-t border-white/[0.04]">
                  <h4 className="text-sm font-bold tracking-tight text-foreground">
                    Transition Candidate Status
                  </h4>
                  <div className="grid gap-2">
                    {selectedApp.status !== "shortlisted" && (
                      <Button
                        onClick={() => handleStatusTransition("shortlisted")}
                        variant="outline"
                        size="sm"
                        disabled={updatingStatus}
                        className="rounded-xl justify-start h-9 text-xs"
                      >
                        <ArrowRight className="w-3.5 h-3.5 mr-2 text-teal-400" />{" "}
                        Move to Shortlisted
                      </Button>
                    )}

                    {selectedApp.status !== "interview_invited" && (
                      <Button
                        onClick={() =>
                          handleStatusTransition("interview_invited")
                        }
                        variant="outline"
                        size="sm"
                        disabled={updatingStatus}
                        className="rounded-xl justify-start h-9 text-xs"
                      >
                        <Video className="w-3.5 h-3.5 mr-2 text-purple-400" />{" "}
                        AI Interview invitation
                      </Button>
                    )}

                    {selectedApp.status !== "human_round_scheduled" && (
                      <Button
                        onClick={() =>
                          handleStatusTransition("human_round_scheduled")
                        }
                        variant="outline"
                        size="sm"
                        disabled={updatingStatus}
                        className="rounded-xl justify-start h-9 text-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5 mr-2 text-amber-400" />{" "}
                        Move to Human Round
                      </Button>
                    )}

                    {selectedApp.status !== "selected" && (
                      <Button
                        onClick={() => handleStatusTransition("selected")}
                        variant="default"
                        size="sm"
                        disabled={updatingStatus}
                        className="rounded-xl justify-start h-9 text-xs shadow-md bg-emerald-500 hover:bg-emerald-600 border-0"
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-2" /> Select / Hire
                        Candidate 🎉
                      </Button>
                    )}

                    {selectedApp.status !== "rejected" && (
                      <Button
                        onClick={() => handleStatusTransition("rejected")}
                        variant="destructive"
                        size="sm"
                        disabled={updatingStatus}
                        className="rounded-xl justify-start h-9 text-xs"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-2" /> Reject
                        Candidate ❌
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
