"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Rocket,
  RefreshCcw,
  History,
  ArrowLeft,
  ExternalLink,
  FileText,
  BriefcaseIcon,
} from "lucide-react";

const TALENTSYNC_HISTORY_KEY = "talentsync-history-v1";
const TALENTSYNC_POLL_INTERVAL_MS = 20000;

const mergeJobsById = (incoming = [], current = []) => {
  const merged = new Map();

  [...current, ...incoming].forEach((job) => {
    if (!job?.id) return;
    const existing = merged.get(job.id);
    if (!existing) {
      merged.set(job.id, job);
      return;
    }

    const existingDate = new Date(
      existing.updatedAt || existing.createdAt || 0,
    );
    const jobDate = new Date(job.updatedAt || job.createdAt || 0);
    merged.set(
      job.id,
      jobDate >= existingDate ? { ...existing, ...job } : existing,
    );
  });

  return [...merged.values()].sort(
    (a, b) =>
      new Date(b.createdAt || b.updatedAt || 0) -
      new Date(a.createdAt || a.updatedAt || 0),
  );
};

export default function TalentSyncTool() {
  const router = useRouter();
  const pathname = usePathname();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeInputMode, setResumeInputMode] = useState("text");
  const [jobInputMode, setJobInputMode] = useState("text");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobFileName, setJobFileName] = useState("");
  const [talentSyncLoading, setTalentSyncLoading] = useState(false);
  const [talentSyncError, setTalentSyncError] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [talentSyncJobs, setTalentSyncJobs] = useState([]);
  const jobsRef = useRef([]);
  const pollingRef = useRef(false);
  const [talentSyncForm, setTalentSyncForm] = useState({
    companyName: "",
    email: "",
    eligibilityThreshold: 70,
  });

  const saveJobsToLocal = (jobs) => {
    try {
      localStorage.setItem(TALENTSYNC_HISTORY_KEY, JSON.stringify(jobs));
    } catch {
      // Ignore localStorage write failures.
    }
  };

  const syncJobs = (incomingJobs) => {
    setTalentSyncJobs((prev) => {
      const merged = mergeJobsById(incomingJobs, prev);
      const unchanged =
        prev.length === merged.length &&
        prev.every((job, index) => {
          const next = merged[index];
          return (
            job.id === next.id &&
            job.status === next.status &&
            Number(job.progress || 0) === Number(next.progress || 0) &&
            (job.updatedAt || "") === (next.updatedAt || "") &&
            (job.completedAt || "") === (next.completedAt || "") &&
            (job.message || "") === (next.message || "") &&
            (job.error || "") === (next.error || "")
          );
        });

      if (unchanged) {
        return prev;
      }

      saveJobsToLocal(merged);
      return merged;
    });
  };

  useEffect(() => {
    jobsRef.current = talentSyncJobs;
  }, [talentSyncJobs]);

  const fetchServerHistory = async () => {
    try {
      const response = await fetch("/api/growth-tools/talentsync/history", {
        cache: "no-store",
      });
      const data = await response.json();
      if (response.ok && data.jobs) {
        syncJobs(data.jobs);
      }
    } catch {
      // Keep local history if server history is unavailable.
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TALENTSYNC_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setTalentSyncJobs(parsed);
        }
      }
    } catch {
      // Ignore localStorage read failures.
    }

    fetchServerHistory();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const poll = async () => {
      if (pollingRef.current || document.hidden) return;

      const activeJobs = jobsRef.current.filter(
        (job) => job.status === "queued" || job.status === "running",
      );

      if (activeJobs.length === 0) return;

      pollingRef.current = true;

      const updates = [];

      try {
        for (const job of activeJobs) {
          try {
            const response = await fetch(
              `/api/growth-tools/talentsync/status/${job.id}`,
              { cache: "no-store" },
            );
            const data = await response.json();
            if (response.ok && data.job) {
              updates.push(data.job);
            }
          } catch {
            // Keep existing UI state and continue polling other jobs.
          }
        }

        if (!isCancelled && updates.length > 0) {
          syncJobs(updates);
        }
      } finally {
        pollingRef.current = false;
      }
    };

    poll();
    const interval = setInterval(poll, TALENTSYNC_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      pollingRef.current = false;
      clearInterval(interval);
    };
  }, []);

  const readTextFromFile = async (file, label) => {
    const isPdfFile =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isTextBasedFile =
      file.type.startsWith("text/") ||
      /\.(txt|md|csv|json|rtf)$/i.test(file.name);

    if (!isTextBasedFile && !isPdfFile) {
      throw new Error(
        `${label} file format is not supported. Upload txt, md, csv, json, rtf, or pdf.`,
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`${label} file is too large. Max allowed size is 5 MB.`);
    }

    if (isPdfFile) {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const pageTexts = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        pageTexts.push(text);
      }

      return pageTexts.join("\n").trim();
    }

    return file.text();
  };

  const handleResumeFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extractedText = await readTextFromFile(file, "Resume");
      if (!extractedText.trim()) {
        throw new Error("Resume file appears empty after extraction.");
      }
      setResumeText(extractedText);
      setResumeFileName(file.name);
      setTalentSyncError(null);
    } catch (err) {
      setTalentSyncError(err.message || "Unable to read resume file.");
      setResumeFileName("");
      event.target.value = "";
    }
  };

  const handleJobDescriptionFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extractedText = await readTextFromFile(file, "Job description");
      if (!extractedText.trim()) {
        throw new Error("JD file appears empty after extraction.");
      }
      setJobDescription(extractedText);
      setJobFileName(file.name);
      setTalentSyncError(null);
    } catch (err) {
      setTalentSyncError(err.message || "Unable to read job description file.");
      setJobFileName("");
      event.target.value = "";
    }
  };

  const handleTalentSyncSubmit = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setTalentSyncError("Resume and job description are required.");
      return;
    }

    if (!talentSyncForm.companyName.trim()) {
      setTalentSyncError("Company name is required.");
      return;
    }

    setTalentSyncLoading(true);
    setTalentSyncError(null);

    try {
      const response = await fetch("/api/growth-tools/talentsync/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "job_seeker",
          companyName: talentSyncForm.companyName,
          email: talentSyncForm.email,
          bearerToken: accessToken,
          eligibilityThreshold: Number(talentSyncForm.eligibilityThreshold),
          resumeText,
          jobDescription,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to start TalentSync job");
      }

      syncJobs([
        {
          id: data.jobId,
          status: data.status,
          progress: data.progress,
          message: data.message,
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
          completedAt: null,
          payloadSummary: {
            mode: "job_seeker",
            companyName: talentSyncForm.companyName,
            email: talentSyncForm.email,
            eligibilityThreshold: Number(talentSyncForm.eligibilityThreshold),
          },
          result: null,
          error: null,
        },
      ]);
    } catch (err) {
      setTalentSyncError(err.message || "Failed to start TalentSync AI");
    } finally {
      setTalentSyncLoading(false);
    }
  };

  const getJobStatusTone = (status) => {
    if (status === "completed")
      return "bg-[hsl(var(--success))/0.12] text-[hsl(var(--success))] border-[hsl(var(--success))/0.25]";
    if (status === "failed")
      return "bg-[hsl(var(--destructive))/0.12] text-[hsl(var(--destructive))] border-[hsl(var(--destructive))/0.25]";
    if (status === "running")
      return "bg-primary/15 text-primary border-primary/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const activeRunsCount = talentSyncJobs.filter(
    (job) => job.status === "queued" || job.status === "running",
  ).length;
  const completedRunsCount = talentSyncJobs.filter(
    (job) => job.status === "completed",
  ).length;
  const resumeWords = resumeText.split(/\s+/).filter(Boolean).length;
  const jdWords = jobDescription.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            TalentSync AI
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Automated resume-to-job matching and eligibility pipeline
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <Badge variant="outline">
              Active Runs: {activeRunsCount}
            </Badge>
            <Badge variant="outline">
              Completed: {completedRunsCount}
            </Badge>
            <Badge variant="outline">
              Polling: Every 20s
            </Badge>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Select
            value={
              pathname === "/career-simulator"
                ? "/career-simulator"
                : "/growth-tools"
            }
            onValueChange={(value) => router.push(value)}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Navigate tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/growth-tools">TalentSync AI</SelectItem>
              <SelectItem value="/career-simulator">
                Career Simulator
              </SelectItem>
            </SelectContent>
          </Select>

          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back To Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card className="border border-primary/25 xl:col-span-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Rocket className="h-5 w-5 text-primary" />
              Run External Agent
            </CardTitle>
            <CardDescription>
              Typical completion is 3-5 minutes. The run continues in
              background, so you can navigate freely and return later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Source Documents</h3>
              <p className="text-xs text-muted-foreground">
                Provide resume and job description via text paste or file
                upload.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border border-primary/20 bg-gradient-to-b from-primary/5 via-background to-background shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Resume Input
                  </CardTitle>
                  <CardDescription>
                    Choose one input method: paste text or upload a file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={resumeInputMode}
                    onValueChange={setResumeInputMode}
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="text">Paste Text</TabsTrigger>
                      <TabsTrigger value="file">Upload File</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text">
                      <Textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="min-h-[180px]"
                        placeholder="Paste resume text"
                      />
                    </TabsContent>

                    <TabsContent value="file">
                      <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
                        <label className="text-sm font-medium text-foreground">
                          Upload resume file (txt, md, csv, json, rtf, pdf)
                        </label>
                        <Input
                          type="file"
                          accept=".txt,.md,.csv,.json,.rtf,.pdf,text/plain,text/markdown,text/csv,application/json,application/rtf,text/rtf,application/pdf"
                          onChange={handleResumeFileUpload}
                          className="cursor-pointer bg-background"
                        />
                        <p className="text-xs text-muted-foreground">
                          Max 5 MB. PDF text extraction is supported.
                        </p>
                        {resumeFileName && (
                          <Badge variant="secondary" className="w-fit">
                            Loaded: {resumeFileName}
                          </Badge>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <p className="text-xs text-muted-foreground mt-2">
                    {resumeText.length > 0
                      ? `${resumeWords} words`
                      : "No content yet"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-primary/20 bg-gradient-to-b from-primary/5 via-background to-background shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BriefcaseIcon className="h-5 w-5 text-primary" />
                    Job Description Input
                  </CardTitle>
                  <CardDescription>
                    Choose one input method: paste text or upload a file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={jobInputMode} onValueChange={setJobInputMode}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="text">Paste Text</TabsTrigger>
                      <TabsTrigger value="file">Upload File</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text">
                      <Textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[180px]"
                        placeholder="Paste job description"
                      />
                    </TabsContent>

                    <TabsContent value="file">
                      <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
                        <label className="text-sm font-medium text-foreground">
                          Upload JD file (txt, md, csv, json, rtf, pdf)
                        </label>
                        <Input
                          type="file"
                          accept=".txt,.md,.csv,.json,.rtf,.pdf,text/plain,text/markdown,text/csv,application/json,application/rtf,text/rtf,application/pdf"
                          onChange={handleJobDescriptionFileUpload}
                          className="cursor-pointer bg-background"
                        />
                        <p className="text-xs text-muted-foreground">
                          Max 5 MB. PDF text extraction is supported.
                        </p>
                        {jobFileName && (
                          <Badge variant="secondary" className="w-fit">
                            Loaded: {jobFileName}
                          </Badge>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <p className="text-xs text-muted-foreground mt-2">
                    {jobDescription.length > 0
                      ? `${jdWords} words`
                      : "No content yet"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Run Settings</h3>
              <p className="text-xs text-muted-foreground">
                Configure your company details and scoring threshold.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={talentSyncForm.companyName}
                  onChange={(e) =>
                    setTalentSyncForm((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Google"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={talentSyncForm.email}
                  onChange={(e) =>
                    setTalentSyncForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Eligibility Threshold
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={talentSyncForm.eligibilityThreshold}
                  onChange={(e) =>
                    setTalentSyncForm((prev) => ({
                      ...prev,
                      eligibilityThreshold: e.target.value,
                    }))
                  }
                />
              </div>
              {/* <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">
                  Access Token (Optional)
                </label>
                <Input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Paste bearer token if server env token is not configured"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use TALENTSYNC_BEARER_TOKEN from server
                  environment.
                </p>
              </div> */}
            </div>

            {talentSyncError && (
              <div className="rounded-lg border border-[hsl(var(--destructive))/0.45] bg-[hsl(var(--destructive))/0.08] px-3 py-2 text-sm text-[hsl(var(--destructive))]">
                {talentSyncError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <Button
                onClick={handleTalentSyncSubmit}
                disabled={
                  talentSyncLoading ||
                  !resumeText.trim() ||
                  !jobDescription.trim()
                }
                className="sm:min-w-[220px]"
              >
                {talentSyncLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Start TalentSync Run
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={fetchServerHistory}
                className="sm:min-w-[180px]"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh History
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              Run continues in background. You can move to other pages and come
              back later.
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 xl:sticky xl:top-24 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Run History
            </CardTitle>
            <CardDescription>
              Latest TalentSync runs and responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {talentSyncJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs yet.</p>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                {talentSyncJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-lg border border-border p-3 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {job.payloadSummary?.companyName || "Unknown Company"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Job: {job.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started: {formatDateTime(job.createdAt)}
                        </p>
                      </div>
                      <Badge
                        className={`border ${getJobStatusTone(job.status)}`}
                      >
                        {(job.status || "queued").toUpperCase()}
                      </Badge>
                    </div>

                    {(job.status === "running" || job.status === "queued") && (
                      <div className="space-y-2">
                        <Progress
                          value={Math.max(5, Number(job.progress || 0))}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {job.message || "Processing..."}
                        </p>
                      </div>
                    )}

                    {job.status === "failed" && job.error && (
                      <p className="text-xs text-[hsl(var(--destructive))]">
                        {job.error}
                      </p>
                    )}

                    {job.status === "completed" && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Completed: {formatDateTime(job.completedAt)}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedJobId((prev) =>
                              prev === job.id ? null : job.id,
                            )
                          }
                        >
                          {expandedJobId === job.id
                            ? "Hide Result"
                            : "View Result"}
                        </Button>

                        {expandedJobId === job.id && (
                          <>
                            <pre className="text-xs overflow-auto rounded-md border border-border bg-background p-3 max-h-56">
                              {JSON.stringify(job.result, null, 2)}
                            </pre>
                            <Button
                              asChild
                              variant="link"
                              size="sm"
                              className="px-0"
                            >
                              <Link href="/dashboard">
                                <ExternalLink className="h-4 w-4" />
                                Back to CareerSync AI
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
