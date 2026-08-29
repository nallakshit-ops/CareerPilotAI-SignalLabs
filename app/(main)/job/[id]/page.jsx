"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Calendar, MapPin, Briefcase, DollarSign, MessageSquare, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cold DM state
  const [coldDM, setColdDM] = useState(null);
  const [generatingDM, setGeneratingDM] = useState(false);
  const [copiedDM, setCopiedDM] = useState(false);

  useEffect(() => {
    // We expect the job details to be passed via sessionStorage
    // since the job board aggregates live results without DB persistence
    const savedJobData = sessionStorage.getItem("selectedJobData");

    if (savedJobData) {
      try {
        const parsedJob = JSON.parse(savedJobData);
        if (parsedJob.id === id || parsedJob.id === decodeURIComponent(id)) {
          setJob(parsedJob);
        } else {
          toast.error("Job details mismatch. Please search again.");
        }
      } catch (e) {
        toast.error("Failed to parse job details.");
      }
    } else {
      toast.error("Session expired or direct link accessed. Please use the Explore page.");
    }

    setLoading(false);
  }, [id]);

  const generateColdDM = async () => {
    if (!job) return;

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
      } else {
        toast.error(data.error || "Failed to generate DM");
      }
    } catch (error) {
      toast.error("Failed to generate cold DM");
    } finally {
      setGeneratingDM(false);
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-8 mt-4">
        <Button variant="ghost" disabled className="opacity-50"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <Skeleton className="h-[280px] w-full rounded-2xl glass" />
        <Skeleton className="h-[400px] w-full rounded-2xl glass" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-8 max-w-xl text-center space-y-6 mt-20">
        <div className="mx-auto w-24 h-24 bg-white/[0.03] border border-white/[0.06] rounded-full flex items-center justify-center shadow-inner">
          <Briefcase className="w-10 h-10 text-muted-foreground opacity-70" />
        </div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Job Details Not Found</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Because jobs are fetched live from global boards, direct links expire. Please go back to the Explore page to search again.
        </p>
        <Button asChild size="lg" className="mt-4 shadow-lg hover-lift">
          <Link href="/explore">
            Back to Explore
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-20 mt-4">
      <div className="flex items-center">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group">
          <Link href="/explore">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Jobs
          </Link>
        </Button>
      </div>

      {/* Hero Header Section */}
      <Card className="glass-strong overflow-hidden border-white/[0.08] relative">
        <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-emerald-500" />
        <CardContent className="p-8 sm:p-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="space-y-6 flex-1">
              <div className="space-y-3">
                <Badge variant="outline" className="bg-white/[0.04] border-white/[0.1] text-xs font-medium uppercase tracking-wider px-3 py-1 mt-4">
                  {job.source}
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-4xl font-display font-bold tracking-tighter text-foreground leading-tight mt-2">
                  {job.title}
                </h1>
                <div className="flex items-center gap-3 text-xl text-muted-foreground mt-2 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-primary/80" />
                  </div>
                  {job.company}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.05] shadow-sm">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-medium text-foreground/90">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.05] shadow-sm">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">{job.salary}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.05] shadow-sm">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-foreground/80">
                    {new Date(job.postedDate).toLocaleDateString() === 'Invalid Date' ? job.postedDate : new Date(job.postedDate).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-primary/15 text-primary hover:bg-primary/25 px-4 py-2 text-sm rounded-xl transition-colors border-0">
                  {job.type}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[240px] lg:pt-8">
              <Button asChild size="lg" className="w-full shadow-[0_0_40px_-10px_rgba(var(--primary),0.4)] hover:shadow-[0_0_60px_-10px_rgba(var(--primary),0.6)] hover-lift text-md h-14 rounded-xl">
                <a href={job.link} target="_blank" rel="noopener noreferrer">
                  Apply Now <ExternalLink className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06] hover-lift text-md h-14 rounded-xl transition-all"
                onClick={generateColdDM}
                disabled={generatingDM}
              >
                {generatingDM ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin text-primary" /> Generating...</>
                ) : (
                  <><MessageSquare className="w-5 h-5 mr-2 text-primary/80" /> Generate Cold DM</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cold DM Result Section */}
      {coldDM && (
        <Card className="border border-primary/30 bg-gradient-to-br from-primary/[0.08] via-background to-background animate-in slide-in-from-top-4 fade-in duration-500 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader className="pb-4 border-b border-primary/10 bg-primary/[0.02]">
            <CardTitle className="flex items-center gap-3 text-xl font-display">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              Cold DM Draft for {job.company}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Subject Line</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.08] px-4 py-3 rounded-xl shadow-inner flex items-center">
                <p className="text-base font-medium text-foreground">{coldDM.subject}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Message Body</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg text-xs font-medium"
                  onClick={copyDMToClipboard}
                >
                  {copiedDM ? (
                    <><Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy text</>
                  )}
                </Button>
              </div>
              <div className="relative group">
                <textarea
                  readOnly
                  className="w-full text-base bg-white/[0.01] p-5 rounded-xl border border-white/[0.08] shadow-inner resize-y focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[240px] leading-relaxed text-foreground/90 font-mono transition-colors group-hover:border-white/[0.15]"
                  value={getCleanMessage(coldDM.message)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center gap-4 justify-between">
              <p className="text-sm text-muted-foreground">
                Review and personalize the draft before sending.
              </p>
              <Button asChild variant="secondary" className="w-full sm:w-auto rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05]">
                <a
                  href={coldDM.linkedinSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Find Recruiters on LinkedIn
                  <ExternalLink className="w-4 h-4 ml-2 text-muted-foreground" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description Section */}
      <Card className="glass border-white/[0.06] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <CardHeader className="border-b border-white/[0.04] pb-5 px-6 sm:px-10 bg-white/[0.01]">
          <CardTitle className="text-2xl font-display tracking-tight flex items-center gap-3">
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-10">
          <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none">
            {job.description ? (
              <div
                className="whitespace-pre-wrap leading-relaxed text-foreground/80 font-medium"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            ) : (
              <div className="py-8 text-center border border-dashed border-white/[0.1] rounded-2xl bg-white/[0.02]">
                <p className="italic text-muted-foreground text-lg">
                  No detailed description provided by the source.
                </p>
                <p className="text-muted-foreground mt-2">
                  Please click Apply Now to view the full details on the original job board.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer CTA */}
      <div className="flex justify-center pt-8 pb-12">
        <Button asChild size="lg" className="rounded-2xl px-10 h-14 text-lg shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)] hover:shadow-[0_0_50px_-5px_rgba(var(--primary),0.5)] hover-lift">
          <a href={job.link} target="_blank" rel="noopener noreferrer">
            Apply for this Position <ExternalLink className="w-5 h-5 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
}
