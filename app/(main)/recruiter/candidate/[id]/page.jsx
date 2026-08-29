import React from "react";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import {
  User2,
  Mail,
  Briefcase,
  Clock,
  Sparkles,
  FileText,
  Video,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ActionBar from "./_components/action-bar";

function getGoogleDriveEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return url;
}

function getScoreColor(score) {
  if (score >= 70) return "text-[hsl(var(--success))]";
  if (score >= 40) return "text-[hsl(var(--warning))]";
  return "text-[hsl(var(--destructive))]";
}

function getScoreIndicatorClass(score) {
  if (score >= 70) return "bg-[hsl(var(--success))]";
  if (score >= 40) return "bg-[hsl(var(--warning))]";
  return "bg-[hsl(var(--destructive))]";
}

export default async function RecruiterCandidateProfilePage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const recruiter = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!recruiter || recruiter.role !== "recruiter") {
    redirect("/dashboard");
  }

  const candidate = await db.user.findUnique({
    where: { id },
    include: {
      resume: true,
    },
  });

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass p-12 text-center">
          <User2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold tracking-tight">
            Candidate Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            This candidate profile could not be loaded.
          </p>
        </Card>
      </div>
    );
  }

  // Fetch existing interview call between this recruiter and candidate
  const interviewCall = await db.interviewCall.findFirst({
    where: {
      candidateId: candidate.id,
      recruiterId: recruiter.id,
    },
    orderBy: { createdAt: "desc" },
  });

  const aiReport = interviewCall?.aiMatchReport;
  const scoreBreakdown = aiReport?.scoreBreakdown;
  const matchScore = interviewCall?.aiMatchScore;

  const resumeEmbedUrl = getGoogleDriveEmbedUrl(candidate.resumeDriveUrl);
  const videoEmbedUrl = getGoogleDriveEmbedUrl(candidate.videoResumeUrl);

  const transcript = interviewCall?.interviewTranscript;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      {/* ─── Header ────────────────────────────────────────── */}
      <Card className="glass overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.04] pointer-events-none" />
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {candidate.imageUrl ? (
                <img
                  src={candidate.imageUrl}
                  alt={candidate.name || "Candidate"}
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-white/[0.08] shadow-lg"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <User2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {matchScore != null && (
                <div
                  className={`absolute -bottom-2 -right-2 h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold border-2 border-background ${getScoreIndicatorClass(matchScore)}`}
                >
                  {Math.round(matchScore)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tighter">
                {candidate.name || "Unnamed Candidate"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {candidate.email}
                </span>
                {candidate.industry && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    <Briefcase className="h-3 w-3 mr-1" />
                    {candidate.industry}
                  </Badge>
                )}
                {candidate.experience != null && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {candidate.experience} yrs experience
                  </span>
                )}
              </div>
            </div>

            {/* Match Score Gauge */}
            {matchScore != null && (
              <div className="shrink-0 text-center">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      strokeWidth="6"
                      fill="none"
                      className="stroke-white/[0.06]"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${(matchScore / 100) * 213.6} 213.6`}
                      strokeLinecap="round"
                      className={`${matchScore >= 70 ? "stroke-[hsl(var(--success))]" : matchScore >= 40 ? "stroke-[hsl(var(--warning))]" : "stroke-[hsl(var(--destructive))]"} transition-all duration-700`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${getScoreColor(matchScore)}`}>
                      {Math.round(matchScore)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI Match
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Tabs ──────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="resume-video" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Resume & Video
          </TabsTrigger>
          <TabsTrigger value="interview" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Interview Reports
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Overview ─────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Bio */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-display tracking-tight text-xl">
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed">
                {candidate.bio || "No bio provided by this candidate."}
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="font-display tracking-tight text-xl">
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2.5">
                  {candidate.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="px-3 py-1.5 text-sm bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Match Report */}
          {aiReport && (
            <div className="space-y-6">
              {/* Score Breakdown */}
              {scoreBreakdown && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="font-display tracking-tight text-xl flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Score Breakdown
                    </CardTitle>
                    <CardDescription>
                      Detailed analysis of candidate-job alignment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {[
                      {
                        label: "Technical Alignment",
                        value: scoreBreakdown.technicalAlignment,
                      },
                      {
                        label: "Communication Fit",
                        value: scoreBreakdown.communicationFit,
                      },
                      {
                        label: "Experience Fit",
                        value: scoreBreakdown.experienceFit,
                      },
                      {
                        label: "Skill Coverage",
                        value: scoreBreakdown.skillCoverage,
                      },
                      {
                        label: "Confidence Score",
                        value: scoreBreakdown.confidenceScore,
                      },
                    ].map(
                      (item) =>
                        item.value != null && (
                          <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-medium">
                                {item.label}
                              </span>
                              <span
                                className={`font-bold ${getScoreColor(item.value)}`}
                              >
                                {Math.round(item.value)}%
                              </span>
                            </div>
                            <Progress
                              value={item.value}
                              className="h-2"
                              indicatorClassName={getScoreIndicatorClass(
                                item.value
                              )}
                            />
                          </div>
                        )
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Why This Candidate? */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="font-display tracking-tight text-xl">
                    Why This Candidate?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Matched Skills */}
                  {aiReport.matchedSkills &&
                    aiReport.matchedSkills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                          Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {aiReport.matchedSkills.map((skill) => (
                            <Badge
                              key={skill}
                              className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border border-[hsl(var(--success))]/20 hover:bg-[hsl(var(--success))]/25"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Missing Skills */}
                  {aiReport.missingSkills &&
                    aiReport.missingSkills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                          Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {aiReport.missingSkills.map((skill) => (
                            <Badge
                              key={skill}
                              className="bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border border-[hsl(var(--warning))]/20 hover:bg-[hsl(var(--warning))]/25"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* AI Recommendation */}
                  {aiReport.recommendation && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-5">
                      <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Recommendation
                      </h4>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {aiReport.recommendation}
                      </p>
                    </div>
                  )}

                  {/* AI Summary */}
                  {aiReport.summary && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-5">
                      <h4 className="text-sm font-medium text-accent mb-2">
                        Summary
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {aiReport.summary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* No AI report */}
          {!aiReport && (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No AI match report available yet. Send an interview invitation
                  to trigger AI screening.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Tab 2: Resume & Video ───────────────────────── */}
        <TabsContent value="resume-video">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="font-display tracking-tight text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resumeEmbedUrl ? (
                  <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                    <iframe
                      src={resumeEmbedUrl}
                      className="w-full h-[600px]"
                      allow="autoplay"
                      title="Candidate Resume"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08]">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No resume uploaded
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Resume */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="font-display tracking-tight text-xl flex items-center gap-2">
                  <Video className="h-5 w-5 text-accent" />
                  Video Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {videoEmbedUrl ? (
                  <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                    <iframe
                      src={videoEmbedUrl}
                      className="w-full h-[600px]"
                      allow="autoplay"
                      title="Candidate Video Resume"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08]">
                    <Video className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No video resume uploaded
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 3: Interview Reports ────────────────────── */}
        <TabsContent value="interview" className="space-y-6">
          {transcript && Array.isArray(transcript) ? (
            <>
              {/* Interview Scores */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="font-display tracking-tight text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Interview Scores
                  </CardTitle>
                  <CardDescription>
                    AI-evaluated performance from the virtual interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        label: "Technical",
                        value: interviewCall.technicalScore,
                      },
                      {
                        label: "Communication",
                        value: interviewCall.communicationScore,
                      },
                      {
                        label: "Confidence",
                        value: interviewCall.confidenceScore,
                      },
                    ].map(
                      (item) =>
                        item.value != null && (
                          <div
                            key={item.label}
                            className="text-center space-y-3"
                          >
                            <div className="relative h-16 w-16 mx-auto">
                              <svg
                                className="h-16 w-16 -rotate-90"
                                viewBox="0 0 64 64"
                              >
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  strokeWidth="5"
                                  fill="none"
                                  className="stroke-white/[0.06]"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  strokeWidth="5"
                                  fill="none"
                                  strokeDasharray={`${(item.value / 100) * 163.4} 163.4`}
                                  strokeLinecap="round"
                                  className={`${item.value >= 70 ? "stroke-[hsl(var(--success))]" : item.value >= 40 ? "stroke-[hsl(var(--warning))]" : "stroke-[hsl(var(--destructive))]"} transition-all duration-700`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                  className={`text-sm font-bold ${getScoreColor(item.value)}`}
                                >
                                  {Math.round(item.value)}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {item.label}
                            </p>
                          </div>
                        )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transcript Q&A */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="font-display tracking-tight text-xl">
                    Interview Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transcript.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-xs bg-primary/10 text-primary border border-primary/20"
                        >
                          Q{index + 1}
                        </Badge>
                        <p className="text-sm font-medium text-foreground">
                          {item.question}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 pl-1">
                        <div className="w-1 shrink-0 self-stretch rounded-full bg-accent/30" />
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                      {item.score != null && (
                        <div className="flex items-center gap-2 pt-1">
                          <Progress
                            value={item.score}
                            className="h-1.5 flex-1"
                            indicatorClassName={getScoreIndicatorClass(
                              item.score
                            )}
                          />
                          <span
                            className={`text-xs font-bold ${getScoreColor(item.score)}`}
                          >
                            {item.score}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Interview Summary & Recommendation */}
              {(interviewCall.interviewSummary ||
                interviewCall.interviewRecommendation) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interviewCall.interviewSummary && (
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="font-display tracking-tight text-xl">
                          Interview Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {interviewCall.interviewSummary}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {interviewCall.interviewRecommendation && (
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="font-display tracking-tight text-xl">
                          AI Recommendation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {interviewCall.interviewRecommendation}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-lg font-display font-bold tracking-tight mb-2">
                  No Interview Completed Yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  The candidate has not completed an AI virtual interview.
                  Interview reports will appear here once completed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Action Bar ─────────────────────────────────────── */}
      <ActionBar
        candidateId={candidate.id}
        interviewCall={interviewCall ? {
          id: interviewCall.id,
          status: interviewCall.status,
          candidateDecision: interviewCall.candidateDecision,
        } : null}
      />
    </div>
  );
}
