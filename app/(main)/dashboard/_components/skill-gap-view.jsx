"use client";

import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  Clock,
  ExternalLink,
  Sparkles,
  FileText,
  BriefcaseIcon,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import ATSResumeButton from "./ats-resume-button";

const SkillGapView = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeInputMode, setResumeInputMode] = useState("text");
  const [jobInputMode, setJobInputMode] = useState("text");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobFileName, setJobFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to read resume file.");
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
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to read job description file.");
      setJobFileName("");
      event.target.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume text and a job description.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/skill/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze skills");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeText("");
    setJobDescription("");
    setResumeInputMode("text");
    setJobInputMode("text");
    setResumeFileName("");
    setJobFileName("");
    setResult(null);
    setError(null);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "[&>div]:bg-green-500";
    if (percentage >= 50) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Resume Input */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Your Resume
              </CardTitle>
              <CardDescription className="text-xs">
                Paste text or upload your resume document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={resumeInputMode} onValueChange={setResumeInputMode}>
                <TabsList className="grid w-full grid-cols-2 mb-3 h-8">
                  <TabsTrigger value="text" className="text-xs">Paste Text</TabsTrigger>
                  <TabsTrigger value="file" className="text-xs">Upload File</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-0">
                  <Textarea
                    id="resume-input"
                    placeholder="Paste your resume content here (skills, experience, projects, education)..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[220px] resize-none text-xs font-mono"
                  />
                </TabsContent>

                <TabsContent value="file" className="mt-0">
                  <label
                    htmlFor="resume-file-input"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/20 p-8 cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background border border-border">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-foreground">Click to upload resume</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">txt, md, csv, json, rtf, pdf — Max 5 MB</p>
                    </div>
                    <Input
                      id="resume-file-input"
                      type="file"
                      accept=".txt,.md,.csv,.json,.rtf,.pdf,text/plain,text/markdown,text/csv,application/json,application/rtf,text/rtf,application/pdf"
                      onChange={handleResumeFileUpload}
                      className="hidden"
                    />
                    {resumeFileName && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">{resumeFileName}</span>
                      </div>
                    )}
                  </label>
                </TabsContent>
              </Tabs>
              <p className="text-[11px] text-muted-foreground mt-2">
                {resumeText.length > 0
                  ? `${resumeText.split(/\s+/).filter(Boolean).length} words parsed`
                  : "No resume loaded"}
              </p>
            </CardContent>
          </Card>

          {/* Job Description Input */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                Target Job Description
              </CardTitle>
              <CardDescription className="text-xs">
                Paste job details or upload the job posting file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={jobInputMode} onValueChange={setJobInputMode}>
                <TabsList className="grid w-full grid-cols-2 mb-3 h-8">
                  <TabsTrigger value="text" className="text-xs">Paste Text</TabsTrigger>
                  <TabsTrigger value="file" className="text-xs">Upload File</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-0">
                  <Textarea
                    id="job-input"
                    placeholder="Paste the target job description, responsibilities, and requirements here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[220px] resize-none text-xs font-mono"
                  />
                </TabsContent>

                <TabsContent value="file" className="mt-0">
                  <label
                    htmlFor="job-file-input"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/20 p-8 cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background border border-border">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-foreground">Click to upload job description</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">txt, md, csv, json, rtf, pdf — Max 5 MB</p>
                    </div>
                    <Input
                      id="job-file-input"
                      type="file"
                      accept=".txt,.md,.csv,.json,.rtf,.pdf,text/plain,text/markdown,text/csv,application/json,application/rtf,text/rtf,application/pdf"
                      onChange={handleJobDescriptionFileUpload}
                      className="hidden"
                    />
                    {jobFileName && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">{jobFileName}</span>
                      </div>
                    )}
                  </label>
                </TabsContent>
              </Tabs>
              <p className="text-[11px] text-muted-foreground mt-2">
                {jobDescription.length > 0
                  ? `${jobDescription.split(/\s+/).filter(Boolean).length} words parsed`
                  : "No job description loaded"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 px-4">
            <p className="text-destructive text-xs flex items-center gap-2 font-medium">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analyze / Reset Buttons */}
      <div className="flex gap-3 justify-center">
        {!result ? (
          <Button
            id="analyze-button"
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim() || !jobDescription.trim()}
            className="px-6 h-9 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Skill Fit...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze Skill Gap
              </>
            )}
          </Button>
        ) : (
          <Button
            id="reset-button"
            onClick={handleReset}
            variant="outline"
            size="sm"
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Analyze Another Job
          </Button>
        )}
      </div>

      {/* Results Section */}
      {result && result.analysis && (
        <div className="space-y-5">
          {/* Match Percentage Hero */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="text-center pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Skill Match Compatibility
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-6">
              <div
                className={`text-5xl md:text-6xl font-bold tracking-tight ${getMatchColor(result.analysis.matchPercentage)}`}
              >
                {result.analysis.matchPercentage}%
              </div>
              <div className="w-full max-w-sm">
                <Progress
                  value={result.analysis.matchPercentage}
                  className={`h-2 ${getProgressColor(result.analysis.matchPercentage)}`}
                />
              </div>
              {result.analysis.confidenceScore !== undefined && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-md">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Model Confidence:
                  <span className="font-semibold text-foreground">
                    {result.analysis.confidenceScore}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="h-4 w-4 text-accent" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm leading-relaxed text-foreground/90">
                {result.analysis.summary}
              </p>
            </CardContent>
          </Card>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Matched Skills
                  <Badge variant="success" className="ml-auto text-xs">
                    {result.analysis.matchedSkills.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">Skills verified in your profile</CardDescription>
              </CardHeader>
              <CardContent>
                {result.analysis.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.analysis.matchedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="success"
                        className="text-xs"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No exact matching skills found.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Missing Skills */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <XCircle className="h-4 w-4 text-destructive" />
                  Missing Skills
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {result.analysis.missingSkills.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">Requirements not found in your resume</CardDescription>
              </CardHeader>
              <CardContent>
                {result.analysis.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.analysis.missingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="destructive"
                        className="text-xs"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-500 font-medium">
                    You meet all required skill criteria!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ATS Resume Generator - Only show if there are missing skills */}
          {result.analysis.missingSkills.length > 0 && (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Generate ATS-Optimized Resume
                </CardTitle>
                <CardDescription className="text-xs">
                  Incorporate relevant keywords and tailored bullet points for Applicant Tracking Systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ATSResumeButton
                  resumeText={resumeText}
                  jobDescription={jobDescription}
                  missingSkills={result.analysis.missingSkills}
                />
              </CardContent>
            </Card>
          )}

          {/* Course Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <BookOpen className="h-4 w-4 text-accent" />
                  Recommended Learning Resources
                </CardTitle>
                <CardDescription className="text-xs">
                  Targeted courses to bridge identified skill gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.recommendations.map((rec, index) => (
                    <Card
                      key={index}
                      className="border-border bg-muted/20 shadow-none hover:bg-muted/40 transition-colors"
                    >
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div>
                          <Badge variant="outline" className="mb-2 text-[11px]">
                            {rec.skill || rec.skillName}
                          </Badge>
                          <h4 className="font-medium text-xs leading-snug text-foreground">
                            {rec.url ? (
                              <a
                                href={rec.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {rec.course_name || rec.courseName}
                              </a>
                            ) : (
                              <span>{rec.course_name || rec.courseName}</span>
                            )}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{rec.platform || "Online Course"}</span>
                          {rec.url && (
                            <a
                              href={rec.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <span>Open</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Footer */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border bg-card shadow-xs text-center p-4">
              <div className="text-xl font-bold tracking-tight">
                {result.analysis.matchedSkills.length +
                  result.analysis.missingSkills.length}
              </div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Total Skills
              </p>
            </Card>
            <Card className="border-border bg-card shadow-xs text-center p-4">
              <div className="text-xl font-bold tracking-tight text-emerald-500">
                {result.analysis.matchedSkills.length}
              </div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Matched</p>
            </Card>
            <Card className="border-border bg-card shadow-xs text-center p-4">
              <div className="text-xl font-bold tracking-tight text-accent">
                {result.recommendations?.length || 0}
              </div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Courses
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapView;
