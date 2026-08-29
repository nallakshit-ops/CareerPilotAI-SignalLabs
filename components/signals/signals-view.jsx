"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Sparkles,
  Target,
  Activity,
  CheckCircle2,
  RefreshCw,
  Brain,
  Layers,
  Clock,
  ShieldCheck,
  Zap,
  Flame,
  ArrowRight,
  BarChart3,
  Compass,
} from "lucide-react";
import SignalCard from "./signal-card";
import SignalTimeline from "./signal-timeline";
import { refreshCandidateSignals } from "@/actions/signals";
import { toast } from "sonner";

export default function SignalsView({ initialData }) {
  const [data, setData] = useState(initialData || { signals: [], summary: {} });
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "timeline"
  const [isScanning, startScanTransition] = useTransition();

  const signals = data?.signals || [];
  const summary = data?.summary || {};

  // Auto-scan on first mount if candidate has 0 signals
  useEffect(() => {
    if (signals.length === 0 && !isScanning) {
      handleScan(false);
    }
  }, []);

  const handleScan = (forceRefresh = true) => {
    startScanTransition(async () => {
      try {
        const res = await refreshCandidateSignals(forceRefresh);
        if (res && res.signals) {
          setData(res);
          toast.success(
            res.signals.length > 0
              ? `Career Intelligence scan complete! ${res.signals.length} signals evaluated.`
              : "Scan complete. Profile up to date."
          );
        }
      } catch (error) {
        console.error("Signal scan error:", error);
        toast.error("Failed to run signal scan. Please try again.");
      }
    });
  };

  const handleSignalUpdated = async () => {
    try {
      const res = await fetch("/api/signals");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter signals based on active filter
  const filteredSignals = signals.filter((signal) => {
    if (filter === "all") return signal.status !== "RESOLVED" && signal.status !== "EXPIRED";
    if (filter === "critical") return signal.severity === "CRITICAL" && signal.status !== "RESOLVED";
    if (filter === "risks") return (signal.type === "RISK" || signal.type === "SKILL_GAP") && signal.status !== "RESOLVED";
    if (filter === "opportunities") return signal.type === "OPPORTUNITY" && signal.status !== "RESOLVED";
    if (filter === "performance") return (signal.type === "PERFORMANCE" || signal.type === "IMPROVEMENT") && signal.status !== "RESOLVED";
    if (filter === "resolved") return signal.status === "RESOLVED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── Hero Intelligence Header ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card via-card to-accent/5 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Brain className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span>AI-Native Career Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Career Signals
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Continuous monitoring of your skills, interview trends, and job market dynamics.
              Here is what matters for your career right now.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleScan(true)}
              disabled={isScanning}
              size="lg"
              className="gap-2 shadow-xs font-semibold"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? "animate-spin text-accent" : ""}`} />
              {isScanning ? "Scanning Ecosystem..." : "Run Signal Scan"}
            </Button>
          </div>
        </div>

        {/* ─── Intelligence Metric Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-border/60">
          <Card className="border-border bg-card/80 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Active Signals
                </span>
                <span className="text-2xl font-bold tracking-tight text-foreground mt-0.5 block">
                  {summary.activeSignals ?? 0}
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Brain className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Critical Risks
                </span>
                <span className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 mt-0.5 block">
                  {summary.critical ?? 0}
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Opportunities
                </span>
                <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {summary.opportunities ?? 0}
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Sparkles className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Action Progress
                </span>
                <span className="text-2xl font-bold tracking-tight text-foreground mt-0.5 block">
                  {summary.completionRate ?? 0}%
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Target className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Filter Bar & View Mode Toggle ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs h-8"
          >
            All Active ({summary.activeSignals ?? 0})
          </Button>

          <Button
            variant={filter === "critical" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("critical")}
            className="text-xs h-8 gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Critical ({summary.critical ?? 0})
          </Button>

          <Button
            variant={filter === "risks" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("risks")}
            className="text-xs h-8"
          >
            Risks & Gaps ({summary.skillGaps ?? 0})
          </Button>

          <Button
            variant={filter === "opportunities" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("opportunities")}
            className="text-xs h-8"
          >
            Opportunities ({summary.opportunities ?? 0})
          </Button>

          <Button
            variant={filter === "performance" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("performance")}
            className="text-xs h-8"
          >
            Performance ({summary.performance ?? 0})
          </Button>

          <Button
            variant={filter === "resolved" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("resolved")}
            className="text-xs h-8"
          >
            Resolved ({summary.resolvedSignals ?? 0})
          </Button>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border border-border self-end sm:self-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="text-xs h-7 gap-1"
          >
            <Layers className="h-3.5 w-3.5" />
            Cards
          </Button>
          <Button
            variant={viewMode === "timeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("timeline")}
            className="text-xs h-7 gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            Timeline
          </Button>
        </div>
      </div>

      {/* ─── Loading Skeleton Overlay ─── */}
      {isScanning && signals.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border bg-card p-6 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-muted rounded-md" />
                <div className="h-5 w-16 bg-muted rounded-md" />
              </div>
              <div className="h-6 w-3/4 bg-muted rounded-md" />
              <div className="h-12 w-full bg-muted rounded-md" />
              <div className="h-2 w-full bg-muted rounded-md" />
            </Card>
          ))}
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!isScanning && filteredSignals.length === 0 && (
        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {filter === "resolved" ? "No Resolved Signals Yet" : "No Active Signals in this Category"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
            {filter === "resolved"
              ? "When you complete recommended actions or upskill in missing areas, your resolved signals will appear here."
              : "CareerPilot will detect new risk factors, performance patterns, and opportunities as you take quizzes and update your profile."}
          </p>
          <Button
            onClick={() => handleScan(true)}
            size="sm"
            className="mt-5"
          >
            Re-Scan Career Ecosystem
          </Button>
        </Card>
      )}

      {/* ─── Grid View ─── */}
      {viewMode === "grid" && filteredSignals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSignals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onSignalUpdated={handleSignalUpdated}
            />
          ))}
        </div>
      )}

      {/* ─── Timeline View ─── */}
      {viewMode === "timeline" && (
        <div className="mt-4">
          <SignalTimeline
            signals={filter === "all" ? signals : filteredSignals}
            onSignalUpdated={handleSignalUpdated}
          />
        </div>
      )}
    </div>
  );
}
