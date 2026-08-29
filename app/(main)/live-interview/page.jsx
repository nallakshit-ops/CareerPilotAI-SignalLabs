"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
  Mic,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  XSquare,
  Trophy,
  Zap,
  Brain,
  Target,
  BarChart3,
  TrendingUp,
  Sparkles,
  Waves,
  Quote,
  Building2,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import WebcamAnalyzer from "@/components/WebcamAnalyzer";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getInterviewCallDetails, saveVirtualInterviewResult } from "@/actions/candidate";

// ============================================================================
// Animated Counter Hook
// ============================================================================
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;

    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + (target - startValue) * eased));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target, duration]);

  return count;
}

// ============================================================================
// Score Ring Component (SVG-based progress ring)
// ============================================================================
function ScoreRing({ score, size = 160, strokeWidth = 10, label }) {
  const animatedScore = useCountUp(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return "hsl(142, 76%, 40%)"; // green
    if (s >= 50) return "hsl(45, 93%, 50%)"; // yellow
    return "hsl(0, 84%, 60%)"; // red
  };

  return (
    <div className="relative inline-flex items-center justify-center p-2">
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all ease-out"
          style={{ transitionDuration: "1500ms" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground">
          {animatedScore}
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          {label || "/ 100"}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Score Badge (Excellent / Good / Needs Improvement)
// ============================================================================
function StatusBadge({ score }) {
  if (score >= 80) {
    return (
      <Badge className="bg-green-500/15 text-green-500 border-green-500/25 hover:bg-green-500/20 text-sm px-3 py-1">
        <Trophy className="w-3.5 h-3.5 mr-1.5" /> Excellent
      </Badge>
    );
  }
  if (score >= 50) {
    return (
      <Badge className="bg-yellow-500/15 text-yellow-500 border-yellow-500/25 hover:bg-yellow-500/20 text-sm px-3 py-1">
        <Zap className="w-3.5 h-3.5 mr-1.5" /> Good
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/15 text-red-500 border-red-500/25 hover:bg-red-500/20 text-sm px-3 py-1">
      <Target className="w-3.5 h-3.5 mr-1.5" /> Needs Improvement
    </Badge>
  );
}

// ============================================================================
// Animated Score Card
// ============================================================================
function ScoreCard({ icon: Icon, label, score, color }) {
  const animatedScore = useCountUp(score);

  const colorMap = {
    blue: { text: "text-blue-500", bg: "bg-blue-500/10", bar: "bg-blue-500" },
    purple: {
      text: "text-purple-500",
      bg: "bg-purple-500/10",
      bar: "bg-purple-500",
    },
    amber: {
      text: "text-amber-500",
      bg: "bg-amber-500/10",
      bar: "bg-amber-500",
    },
    green: {
      text: "text-green-500",
      bg: "bg-green-500/10",
      bar: "bg-green-500",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-6 md:p-6 pt-6 md:pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${c.bg}`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
          <span className={`text-2xl font-bold ${c.text}`}>
            {animatedScore}
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-medium mb-2">
          {label}
        </p>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full ${c.bar} transition-all ease-out`}
            style={{ width: `${animatedScore}%`, transitionDuration: "1500ms" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================
function LiveInterviewContent() {
  const searchParams = useSearchParams();
  const callId = searchParams.get("callId");

  const { user, isLoaded } = useUser();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [finalReport, setFinalReport] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [enableCameraFeedback, setEnableCameraFeedback] = useState(false);
  const [cameraWasUsed, setCameraWasUsed] = useState(false);
  const [cameraSummary, setCameraSummary] = useState(null);
  const [interviewMode, setInterviewMode] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const recognitionChunksRef = useRef([]);
  const cameraSnapshotsRef = useRef([]);

  useEffect(() => {
    if (callId) {
      const fetchCallDetails = async () => {
        try {
          const call = await getInterviewCallDetails(callId);
          setCompanyName(call.companyName || "Unknown Company");
          setJobDescription(call.jobDescription || "");
          setInterviewMode("company");
          setInterviewStarted(true); // Bypass the interview type selection screen completely!
        } catch (error) {
          console.error("Error loading interview call details:", error);
          toast.error("Failed to load interview invitation details.");
        }
      };
      fetchCallDetails();
    }
  }, [callId]);

  // ---- Speech APIs (unchanged) ----
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          // Update only changed indices and keep a stable buffer.
          // This avoids repeated accumulation from interim re-emissions.
          const chunkBuffer = recognitionChunksRef.current;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const chunk = event.results[i][0]?.transcript?.trim() || "";
            chunkBuffer[i] = chunk;
          }

          chunkBuffer.length = event.results.length;

          const combinedTranscript = chunkBuffer
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

          setCurrentAnswer(combinedTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      } else {
        toast.warning("Speech recognition is not supported in your browser.");
      }
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (
      isLoaded &&
      user &&
      interviewStarted &&
      questions.length === 0 &&
      !finalReport
    ) {
      startInterview();
    }
  }, [isLoaded, user, interviewStarted]);

  // ---- Business logic (completely unchanged) ----
  const startInterview = async () => {
    setIsAIThinking(true);
    try {
      const industry = user?.publicMetadata?.industry || "Software Engineering";
      const role = "Candidate";
      const payload = { industry, role, skills: [] };

      if (interviewMode === "company") {
        payload.company = companyName.trim();
        payload.jobDescription = jobDescription.trim();
      }

      const res = await fetch("/api/generate-interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      setQuestions(data.questions);
      setIsAIThinking(false);

      if (data.questions.length > 0) {
        speak(data.questions[0]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not start interview.");
      setIsAIThinking(false);
    }
  };

  const beginInterview = () => {
    if (!interviewMode) {
      toast.error("Please select an interview type.");
      return;
    }

    if (interviewMode === "company") {
      if (!companyName.trim()) {
        toast.error("Please enter a company name.");
        return;
      }
      if (!jobDescription.trim()) {
        toast.error("Please paste a job description.");
        return;
      }
    }

    setCameraWasUsed(false);
    setCameraSummary(null);
    cameraSnapshotsRef.current = [];
    setInterviewStarted(true);
  };

  const handleToggleCameraFeedback = () => {
    setEnableCameraFeedback((prev) => {
      const next = !prev;
      if (next) {
        setCameraWasUsed(true);
      }
      return next;
    });
  };

  const handleCameraSnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    cameraSnapshotsRef.current = [
      ...cameraSnapshotsRef.current,
      snapshot,
    ].slice(-180);
  }, []);

  const buildCameraSummary = useCallback(() => {
    const samples = cameraSnapshotsRef.current;
    if (!cameraWasUsed || samples.length === 0) return null;

    const faceRate = Math.round(
      (samples.filter((s) => s.faceDetected).length / samples.length) * 100,
    );
    const eyeRate = Math.round(
      (samples.filter((s) => s.eyeContact).length / samples.length) * 100,
    );
    const avgConfidence = Math.round(
      samples.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) /
        samples.length,
    );

    const emotionCounts = samples.reduce((acc, s) => {
      const key = s.emotionState || "Calm";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const dominantEmotion =
      Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Calm";

    let recommendation =
      "Your camera behavior was stable. Keep practicing with concise, structured responses.";

    if (eyeRate < 55) {
      recommendation =
        "Improve eye contact by keeping your face centered and looking toward the camera while speaking.";
    } else if (dominantEmotion === "Stressed") {
      recommendation =
        "Stress signals were frequent. Slow your pace, pause between points, and use short breathing resets.";
    }

    return {
      sampleCount: samples.length,
      facePresenceRate: faceRate,
      eyeContactRate: eyeRate,
      dominantEmotion,
      averageConfidence: avgConfidence,
      recommendation,
    };
  }, [cameraWasUsed]);

  const speak = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsAISpeaking(true);
      utterance.onend = () => setIsAISpeaking(false);
      utterance.onerror = () => setIsAISpeaking(false);

      const voices = synthRef.current.getVoices();
      const preferredVoice =
        voices.find(
          (v) => v.name.includes("Google") && v.lang.includes("en"),
        ) || voices.find((v) => v.lang.includes("en"));
      if (preferredVoice) utterance.voice = preferredVoice;

      synthRef.current.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        setCurrentAnswer("");
        recognitionChunksRef.current = [];
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        toast.error("Speech recognition not supported.");
      }
    }
  };

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer before continuing.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsAISpeaking(false);
    }

    const newTranscript = [
      ...transcript,
      { question: questions[currentIndex], answer: currentAnswer.trim() },
    ];
    setTranscript(newTranscript);
    setCurrentAnswer("");

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      speak(questions[nextIndex]);
    } else {
      evaluateInterview(newTranscript);
    }
  };

  const handleEndEarly = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsAISpeaking(false);
    }

    let finalTranscript = [...transcript];
    if (currentAnswer.trim()) {
      finalTranscript.push({
        question: questions[currentIndex],
        answer: currentAnswer.trim(),
      });
    }

    if (finalTranscript.length === 0) {
      toast.error("You must answer at least one question before ending.");
      return;
    }

    evaluateInterview(finalTranscript);
  };

  const evaluateInterview = async (fullTranscript) => {
    setIsAIThinking(true);
    try {
      const industry = user?.publicMetadata?.industry || "Software Engineering";
      const role = "Candidate";

      const res = await fetch("/api/evaluate-live-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, role, fullTranscript }),
      });

      if (!res.ok) throw new Error("Failed to evaluate interview");
      const data = await res.json();
      setFinalReport(data);
      setCameraSummary(buildCameraSummary());

      if (callId) {
        try {
          // Format transcript to [{question, answer, score, confidence}]
          const formattedTranscript = fullTranscript.map((item) => ({
            question: item.question,
            answer: item.answer,
            score: 85, // General placeholder since detail evaluate is overall
            confidence: 90,
          }));

          await saveVirtualInterviewResult({
            callId,
            transcript: formattedTranscript,
            technicalScore: data.technicalScore || data.overallScore || 0,
            communicationScore: data.communicationScore || data.overallScore || 0,
            confidenceScore: data.confidenceScore || data.overallScore || 0,
            recommendation: data.improvementPlan || "",
            summary: data.fillerWordAnalysis?.improvementSuggestion || "AI interview assessment synced.",
          });
          toast.success("Interview completed! Results synced with Recruiter Dashboard.");
        } catch (saveErr) {
          console.error("Failed to sync interview results:", saveErr);
          toast.error("Evaluation finished but database sync failed. Recruiter may not see update.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not generate final report.");
    } finally {
      setIsAIThinking(false);
    }
  };

  // ========================================================================
  //  RENDER: Final Report
  // ========================================================================
  if (finalReport) {
    // Radar chart data
    const radarData = [
      {
        subject: "Technical",
        value: finalReport.technicalScore,
        fullMark: 100,
      },
      {
        subject: "Communication",
        value: finalReport.communicationScore,
        fullMark: 100,
      },
      {
        subject: "Confidence",
        value: finalReport.confidenceScore,
        fullMark: 100,
      },
      {
        subject: "Problem Solving",
        value: Math.round(
          (finalReport.technicalScore + finalReport.overallScore) / 2,
        ),
        fullMark: 100,
      },
      {
        subject: "Clarity",
        value: Math.round(
          (finalReport.communicationScore + finalReport.confidenceScore) / 2,
        ),
        fullMark: 100,
      },
    ];

    // Bar chart data
    const barData = [
      { name: "Technical", score: finalReport.technicalScore },
      { name: "Communication", score: finalReport.communicationScore },
      { name: "Confidence", score: finalReport.confidenceScore },
    ];

    const getBarColor = (score) => {
      if (score >= 80) return "hsl(142, 76%, 40%)";
      if (score >= 50) return "hsl(45, 93%, 50%)";
      return "hsl(217, 91%, 60%)";
    };

    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Performance Evaluation
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Interview Evaluation Complete
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Detailed technical, communication, and behavioral breakdown
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <div className="rounded-lg border border-border bg-card p-3 text-left shadow-xs">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Overall Score
                </p>
                <p className="text-lg font-bold text-foreground">
                  {finalReport.overallScore}/100
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 text-left shadow-xs">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Recommendation
                </p>
                <p className="text-sm font-semibold text-emerald-500 truncate">
                  {finalReport.recommendation || "Completed"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 text-left shadow-xs">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Questions Answered
                </p>
                <p className="text-lg font-bold text-foreground">
                  {finalReport.questionReviews?.length || transcript.length}
                </p>
              </div>
            </div>
          </div>

          {/* Hero Score Section */}
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <Card className="overflow-hidden border-primary/20 shadow-[0_24px_60px_-32px_hsl(var(--primary)/0.45)] backdrop-blur-sm bg-card/80">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Score Ring */}
                  <div className="flex flex-col items-center gap-4">
                    <ScoreRing
                      score={finalReport.overallScore}
                      size={180}
                      strokeWidth={12}
                      label="Overall"
                    />
                    <StatusBadge score={finalReport.overallScore} />
                    <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                      Based on industry standards for{" "}
                      {user?.publicMetadata?.industry || "Software Engineering"}
                    </p>
                  </div>

                  {/* Radar Chart */}
                  <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData} outerRadius="70%" margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 10,
                          }}
                        />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-150">
            <ScoreCard
              icon={Brain}
              label="Technical Skills"
              score={finalReport.technicalScore}
              color="blue"
            />
            <ScoreCard
              icon={MessageSquare}
              label="Communication"
              score={finalReport.communicationScore}
              color="purple"
            />
            <ScoreCard
              icon={Zap}
              label="Confidence Level"
              score={finalReport.confidenceScore}
              color="amber"
            />
          </div>

          {/* Bar Chart */}
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
            <Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      layout="vertical"
                      margin={{ top: 10, right: 34, left: 12, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient
                          id="scoreGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity="0.85"
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity="0.45"
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.5}
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickCount={6}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={13}
                        width={120}
                      />
                      <ReferenceLine
                        x={80}
                        stroke="hsl(var(--primary))"
                        strokeDasharray="5 5"
                        opacity={0.6}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "10px",
                          color: "#f8fafc",
                          boxShadow: "0 16px 35px -20px rgba(2, 6, 23, 0.85)",
                        }}
                        itemStyle={{ color: "#f8fafc", fontWeight: 600 }}
                        labelStyle={{ color: "#cbd5e1", fontSize: 12 }}
                        formatter={(value) => [`${value}/100`, "Score"]}
                        wrapperStyle={{ zIndex: 40 }}
                      />
                      <Bar
                        dataKey="score"
                        radius={[0, 10, 10, 0]}
                        barSize={30}
                        fill="url(#scoreGradient)"
                        animationDuration={900}
                      >
                        <LabelList
                          dataKey="score"
                          position="right"
                          formatter={(value) => `${value}`}
                          fill="hsl(var(--foreground))"
                          fontSize={12}
                          fontWeight={600}
                        />
                        {barData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry.score)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Dashed line indicates strong performance benchmark (80+).
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-500">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-green-500/20 bg-green-500/[0.03]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Strengths
                  <Badge className="ml-auto bg-green-500/15 text-green-500 border-green-500/25">
                    {finalReport.strengths?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {finalReport.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                        {s}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-amber-500/20 bg-amber-500/[0.03]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Areas to Improve
                  <Badge className="ml-auto bg-amber-500/15 text-amber-500 border-amber-500/25">
                    {finalReport.weaknesses?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {finalReport.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                        {w}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Filler Analysis + Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-700">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/15 bg-card/85">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Filler Word Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">
                    Total Fillers Detected
                  </span>
                  <Badge variant="secondary" className="font-bold">
                    {finalReport.fillerWordAnalysis?.fillerCount ?? 0}
                  </Badge>
                </div>
                {finalReport.fillerWordAnalysis?.repeatedPhrases?.length >
                  0 && (
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block font-medium">
                      Repeated Phrases
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {finalReport.fillerWordAnalysis.repeatedPhrases.map(
                        (p, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="font-normal"
                          >
                            {p}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {finalReport.fillerWordAnalysis?.improvementSuggestion && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {finalReport.fillerWordAnalysis.improvementSuggestion}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/15 bg-card/85">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Personalized Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {finalReport.improvementPlan}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {cameraWasUsed && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-900">
              <Card className="border-primary/20 bg-card/85 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Waves className="w-5 h-5 text-primary" />
                    Behavioral Analysis Summary
                  </CardTitle>
                </CardHeader>
                {cameraSummary ? (
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          Face Presence
                        </p>
                        <p className="text-xl font-semibold">
                          {cameraSummary.facePresenceRate}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          Eye Contact
                        </p>
                        <p className="text-xl font-semibold">
                          {cameraSummary.eyeContactRate}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          Dominant Emotion
                        </p>
                        <p className="text-xl font-semibold">
                          {cameraSummary.dominantEmotion}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          Avg Confidence
                        </p>
                        <p className="text-xl font-semibold">
                          {cameraSummary.averageConfidence}/100
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {cameraSummary.recommendation}
                      </p>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent>
                    <div className="rounded-lg border border-border/70 bg-background/60 p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Camera feedback was enabled, but not enough camera
                        samples were captured to produce a behavioral summary.
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in-50 duration-700 delay-1000">
            <Button
              onClick={() => window.location.reload()}
              size="lg"
              className="px-8"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Retry Interview
            </Button>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="px-8 w-full sm:w-auto"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!interviewStarted) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Interview Configuration
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Select Interview Mode
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
            Choose between a general industry-based interview or a customized company/job-specific interview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            onClick={() => setInterviewMode("general")}
            className={`cursor-pointer transition-colors border ${
              interviewMode === "general"
                ? "border-primary bg-primary/5 shadow-xs"
                : "border-border bg-card hover:bg-muted/30"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-1">
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  Standard
                </Badge>
                {interviewMode === "general" && (
                  <Badge variant="default" className="text-xs">
                    Selected
                  </Badge>
                )}
              </div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Waves className="w-4 h-4 text-accent" />
                General Live Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                Adaptive interview based on your profile industry with behavioral, technical, and situational questions.
              </p>
              <div className="pt-2 border-t border-border space-y-1">
                <p>• Quick start without extra inputs</p>
                <p>• Standard question progression</p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setInterviewMode("company")}
            className={`cursor-pointer transition-colors border ${
              interviewMode === "company"
                ? "border-primary bg-primary/5 shadow-xs"
                : "border-border bg-card hover:bg-muted/30"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-1">
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  Targeted
                </Badge>
                {interviewMode === "company" && (
                  <Badge variant="default" className="text-xs">
                    Selected
                  </Badge>
                )}
              </div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="w-4 h-4 text-accent" />
                Company-Specific Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                Tailored interview aligned to a specific company culture and job description requirements.
              </p>
              <div className="pt-2 border-t border-border space-y-1">
                <p>• Aligned to target company style</p>
                <p>• JD-focused technical questions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {interviewMode === "company" && (
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Target Company & Role Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Company Name
                </label>
                <Input
                  placeholder="e.g. Google, Stripe, Microsoft, OpenAI"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Job Description
                </label>
                <Textarea
                  placeholder="Paste the job description, required technical qualifications, and responsibilities..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="resize-none text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {interviewMode
              ? interviewMode === "company"
                ? "Company-specific mode active. AI questions will align to the provided JD."
                : "General interview mode active. Questions will calibrate to your primary industry."
              : "Select a mode above to begin."}
          </p>
          <Button
            onClick={beginInterview}
            size="sm"
            className="px-6"
            disabled={!interviewMode}
          >
            Start Interview
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ========================================================================
  //  RENDER: Interview Room
  // ========================================================================
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch gap-0 min-h-[680px]">
            {/* Main Interview Area */}
            <div
              className={`flex-1 flex flex-col items-center justify-start md:justify-center p-1 md:p-2 relative z-10 w-full ${
                enableCameraFeedback && !isAIThinking && questions.length > 0
                  ? "md:flex-[0_0_68%]"
                  : "md:flex-[1_1_100%]"
              } min-h-[68vh] md:min-h-[calc(100vh-8rem)]`}
            >
              {isAIThinking || questions.length === 0 ? (
                <div className="w-full max-w-xl rounded-3xl border border-primary/20 bg-card/80 backdrop-blur-xl p-8 flex flex-col items-center justify-center space-y-6 shadow-[0_22px_65px_-34px_hsl(var(--primary)/0.6)]">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-[3px] border-muted border-t-primary animate-spin" />
                    <Waves className="w-8 h-8 text-primary absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-primary font-semibold text-lg tracking-wide text-center">
                    {questions.length === 0
                      ? "Preparing your custom interview..."
                      : "Evaluating your answers..."}
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    We are calibrating this session to your role and industry so
                    the interview feels realistic and actionable.
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-2xl rounded-3xl border border-primary/20 bg-card/85 backdrop-blur-xl shadow-[0_28px_70px_-36px_hsl(var(--primary)/0.55)] p-5 md:p-6 flex flex-col items-center space-y-7">
                  {/* Question counter + End Early */}
                  <div className="w-full flex justify-between items-center px-4">
                    <Badge
                      variant="outline"
                      className="bg-background/70 border-primary/20"
                    >
                      Question {currentIndex + 1} of {questions.length}
                    </Badge>
                    <div className="hidden md:flex items-center gap-2">
                      <Button
                        variant={enableCameraFeedback ? "default" : "outline"}
                        size="sm"
                        onClick={handleToggleCameraFeedback}
                        className="border-primary/25"
                      >
                        {enableCameraFeedback
                          ? "AI Camera Feedback On"
                          : "Enable AI Camera Feedback"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEndEarly}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <XSquare className="w-4 h-4 mr-2" /> End Early
                      </Button>
                    </div>
                  </div>

                  <div className="w-full px-4 md:hidden">
                    <Button
                      variant={enableCameraFeedback ? "default" : "outline"}
                      size="sm"
                      onClick={handleToggleCameraFeedback}
                      className="border-primary/25 w-full"
                    >
                      {enableCameraFeedback
                        ? "AI Camera Feedback On"
                        : "Enable AI Camera Feedback"}
                    </Button>
                  </div>

                  {/* Progress bar segments */}
                  <div className="w-full px-4 flex space-x-1.5">
                    {[...Array(questions.length)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-full rounded-full transition-all duration-500 ${
                          i <= currentIndex ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* AI Avatar */}
                  {/* AI Avatar */}
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => speak(questions[currentIndex])}
                  >
                    {/* Glow Effect */}
                    <div
                      className={`absolute inset-0 rounded-full bg-primary/20 blur-2xl transition-all duration-500 ${
                        isAISpeaking
                          ? "scale-125 opacity-100"
                          : "scale-100 opacity-0 group-hover:opacity-60"
                      }`}
                    />

                    {/* Avatar Circle */}
                    <div
                      className={`relative w-44 h-44 rounded-full 
    bg-gradient-to-br from-primary/10 to-primary/5
    border border-primary/20 
    shadow-[0_0_70px_hsl(var(--primary)/0.33)]
    flex items-center justify-center
    overflow-hidden
    transition-all duration-500
    ${isAISpeaking ? "scale-110" : ""}
    `}
                    >
                      {isAISpeaking ? (
                        <div className="flex space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-10 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Image
                          src="/ai.png"
                          alt="AI Assistant"
                          fill
                          className="object-contain p-10 transition-transform duration-300 group-hover:scale-105"
                          priority
                        />
                      )}
                    </div>
                  </div>

                  {/* Question text */}
                  <div className="text-center w-full px-5 py-4 min-h-[90px] flex items-center justify-center rounded-2xl border border-primary/15 bg-background/60">
                    <h2 className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
                      <Quote className="inline-block w-6 h-6 mr-2 text-primary/65 -translate-y-1" />
                      {questions[currentIndex]}
                    </h2>
                  </div>

                  {/* Recording Controls */}
                  <div className="mt-4 flex flex-col items-center space-y-5 w-full">
                    <button
                      onClick={toggleRecording}
                      className={`relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isRecording
                          ? "bg-destructive/10 border-2 border-destructive shadow-destructive/20"
                          : "bg-card border border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
                          <div className="relative flex items-center justify-center">
                            <div className="w-6 h-6 rounded-sm bg-destructive animate-pulse" />
                          </div>
                        </>
                      ) : (
                        <Mic className="w-7 h-7 text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}
                    </button>

                    <div className="flex flex-col items-center space-y-2">
                      <p
                        className={`text-sm tracking-wide ${isRecording ? "text-destructive animate-pulse" : "text-muted-foreground"}`}
                      >
                        {isRecording ? "Listening..." : "Tap Mic to Answer"}
                      </p>

                      <textarea
                        className="mt-3 bg-background/70 border border-primary/20 rounded-xl text-foreground p-3 w-72 md:w-[28rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all resize-none"
                        placeholder="Or type your answer here..."
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Next / Complete Button */}
                  {currentAnswer.trim() && !isRecording && (
                    <Button
                      onClick={handleNextQuestion}
                      size="lg"
                      className="px-8 py-6 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
                    >
                      {currentIndex < questions.length - 1
                        ? "Next Question"
                        : "Complete Interview"}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {enableCameraFeedback && !isAIThinking && questions.length > 0 && (
              <div className="hidden md:flex md:flex-[0_0_32%] border-l border-primary/20 pl-3 md:pl-4">
                <div className="w-full h-full animate-in fade-in-50 slide-in-from-right-3 duration-500">
                  <WebcamAnalyzer
                    className="h-full"
                    onSnapshot={handleCameraSnapshot}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      {enableCameraFeedback && !isAIThinking && questions.length > 0 && (
        <div className="md:hidden w-full px-4 pb-6 relative z-10">
          <WebcamAnalyzer onSnapshot={handleCameraSnapshot} />
        </div>
      )}

      {/* Transcript Toggle */}
      {!isAIThinking && questions.length > 0 && (
        <div className="fixed right-5 bottom-5 z-[80]">
          <Button
            variant="outline"
            className="backdrop-blur-md border-primary/30 bg-card/90 hover:bg-card shadow-lg"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            {showTranscript ? (
              <>
                <PanelRightClose className="w-4 h-4 mr-2" />
                <span>Hide Transcript</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-4 h-4 mr-2" />
                <span>Show Transcript</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* End Early Mobile */}
      {!isAIThinking && questions.length > 0 && (
        <div className="fixed top-24 left-5 z-[80] md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEndEarly}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-card/75 border-destructive/30"
          >
            <XSquare className="w-4 h-4 mr-2" /> End
          </Button>
        </div>
      )}

      {/* Side Transcript Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-[85vw] sm:w-[50vw] md:w-[420px] bg-card/96 backdrop-blur-xl border-l border-primary/20 p-6 flex flex-col h-full overflow-y-auto transition-transform duration-500 ease-in-out z-40 transform ${
          showTranscript ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h3 className="text-muted-foreground font-medium tracking-wider uppercase text-xs mb-6 flex items-center sticky top-0 bg-card/90 py-2 z-10 w-full">
          <MessageSquare className="w-3 h-3 mr-2" /> Live Transcript
        </h3>

        <div className="flex-1 space-y-6">
          {transcript.map((item, idx) => (
            <div
              key={idx}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex justify-start">
                <div className="bg-muted text-foreground text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] border">
                  {item.question}
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary/10 text-foreground text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-primary/20">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}

          {(currentAnswer || (questions.length > 0 && !isAIThinking)) && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-start">
                <div className="bg-muted text-foreground text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] border">
                  {questions[currentIndex]}
                </div>
              </div>
              {currentAnswer ? (
                <div className="flex justify-end">
                  <div className="bg-primary/5 text-muted-foreground text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-primary/10">
                    {currentAnswer}
                    {isRecording && (
                      <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse rounded-full" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="bg-primary/5 text-muted-foreground/80 text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-primary/10 italic">
                    Waiting for your answer...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LiveInterviewContent />
    </Suspense>
  );
}

