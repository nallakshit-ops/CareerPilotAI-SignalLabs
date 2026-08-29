"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SignalTypeBadge,
  SignalSeverityBadge,
  SignalStatusBadge,
} from "./signal-badge";
import {
  Brain,
  CheckCircle2,
  Circle,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toggleActionStatus, acknowledgeSignal, resolveSignal } from "@/actions/signals";
import { toast } from "sonner";
import Link from "next/link";

export default function SignalDetailModal({
  signal,
  isOpen,
  onClose,
  onSignalUpdated,
}) {
  const [isPending, startTransition] = useTransition();
  const [localActions, setLocalActions] = useState(signal?.actions || []);
  const [localStatus, setLocalStatus] = useState(signal?.status || "ACTIVE");

  // Synchronize when signal changes
  React.useEffect(() => {
    if (signal) {
      setLocalActions(signal.actions || []);
      setLocalStatus(signal.status || "ACTIVE");
    }
  }, [signal]);

  if (!signal) return null;

  const handleToggleAction = (actionId, currentStatus) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

    // Optimistic local update
    const updated = localActions.map((a) =>
      a.id === actionId ? { ...a, status: nextStatus } : a
    );
    setLocalActions(updated);

    startTransition(async () => {
      try {
        await toggleActionStatus(actionId, nextStatus);
        toast.success(
          nextStatus === "COMPLETED"
            ? "Action marked as completed! 🎯"
            : "Action marked as pending"
        );
        if (onSignalUpdated) onSignalUpdated();
      } catch (error) {
        toast.error("Failed to update action");
        // Revert on error
        setLocalActions(localActions);
      }
    });
  };

  const handleAcknowledge = () => {
    startTransition(async () => {
      try {
        await acknowledgeSignal(signal.id);
        setLocalStatus("ACKNOWLEDGED");
        toast.success("Signal acknowledged");
        if (onSignalUpdated) onSignalUpdated();
      } catch (error) {
        toast.error("Failed to acknowledge signal");
      }
    });
  };

  const handleResolve = () => {
    startTransition(async () => {
      try {
        await resolveSignal(signal.id);
        setLocalStatus("RESOLVED");
        toast.success("Signal resolved successfully! 🌟");
        if (onSignalUpdated) onSignalUpdated();
      } catch (error) {
        toast.error("Failed to resolve signal");
      }
    });
  };

  const evidenceItems = Array.isArray(signal.evidence) ? signal.evidence : [];
  const completedActionsCount = localActions.filter((a) => a.status === "COMPLETED").length;
  const actionProgress = localActions.length > 0
    ? Math.round((completedActionsCount / localActions.length) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border bg-card">
        {/* Modal Top Banner */}
        <div className="p-6 pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <SignalTypeBadge type={signal.type} />
              <SignalSeverityBadge severity={signal.severity} />
            </div>
            <SignalStatusBadge status={localStatus} />
          </div>

          <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {signal.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            {signal.summary}
          </DialogDescription>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/60">
            <div className="rounded-lg bg-card p-2.5 border border-border">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Confidence
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-foreground">
                  {Math.round(signal.confidence)}%
                </span>
                <Progress value={signal.confidence} className="h-1.5 flex-1" />
              </div>
            </div>
            <div className="rounded-lg bg-card p-2.5 border border-border">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Career Impact
              </span>
              <span className="text-base font-bold text-foreground mt-0.5 block">
                {Math.round(signal.impact)}%
              </span>
            </div>
            <div className="rounded-lg bg-card p-2.5 border border-border">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Action Urgency
              </span>
              <span className="text-base font-bold text-foreground mt-0.5 block">
                {Math.round(signal.urgency)}%
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 text-sm">
          {/* Section 1: "Why Am I Seeing This?" (Explainability & Grounded Evidence) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <HelpCircle className="h-4 w-4 text-accent" />
              <span>Why Did CareerPilot Detect This?</span>
              <span className="text-xs text-muted-foreground font-normal ml-auto">
                Traceable Data Evidence
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {evidenceItems.map((ev, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border/70 bg-card p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {ev.label}
                    </span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {ev.value}
                    </Badge>
                  </div>
                  {ev.details && (
                    <p className="text-xs text-foreground/85 mt-2 leading-relaxed">
                      {ev.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: CareerPilot AI Hypothesis & Diagnosis */}
          {signal.hypothesis && (
            <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Brain className="h-4 w-4 text-accent animate-pulse" />
                <span>CareerPilot AI Hypothesis</span>
              </div>
              <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                {signal.hypothesis}
              </p>
            </div>
          )}

          {/* Section 2.5: Direct Matching Job Opportunities in Market */}
          {(signal.type === "MARKET_CHANGE" || signal.type === "OPPORTUNITY" || (signal.rawMetrics?.matchedJobs && signal.rawMetrics.matchedJobs.length > 0)) && (
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Matching Market Opportunities</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 border-primary/30 font-medium"
                  asChild
                >
                  <Link href="/explore?tab=jobs">
                    Explore Opportunities Tab <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>

              {Array.isArray(signal.rawMetrics?.matchedJobs) && signal.rawMetrics.matchedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {signal.rawMetrics.matchedJobs.map((job, jIdx) => (
                    <div
                      key={jIdx}
                      className="p-3 rounded-lg border border-border bg-card flex flex-col justify-between hover:border-primary/40 transition-colors"
                    >
                      <div>
                        <h5 className="font-semibold text-xs text-foreground line-clamp-1">
                          {job.title}
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {job.companyName} · {job.location || "Remote"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <Badge variant="secondary" className="text-[10px] py-0 h-4 font-normal">
                          {job.employmentType || "Full-time"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[11px] px-2 gap-1 text-primary hover:text-primary"
                          asChild
                        >
                          <Link href="/explore?tab=jobs">
                            View Opportunity <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Live Hiring Requisitions Available
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Browse open roles, track applications, and generate AI cold DMs.
                    </p>
                  </div>
                  <Button size="sm" className="h-7 text-xs font-medium" asChild>
                    <Link href="/explore?tab=jobs">Open Opportunities</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Interactive Action Plan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Target className="h-4 w-4 text-emerald-500" />
                <span>Recommended Action Plan</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {completedActionsCount} of {localActions.length} completed ({actionProgress}%)
              </span>
            </div>

            <Progress value={actionProgress} className="h-1.5" />

            <div className="space-y-2 pt-1">
              {localActions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No pending action items for this signal.
                </p>
              ) : (
                localActions.map((action) => {
                  const isDone = action.status === "COMPLETED";
                  return (
                    <div
                      key={action.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        isDone
                          ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground"
                          : "bg-card border-border hover:border-primary/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleAction(action.id, action.status)}
                        disabled={isPending}
                        className="mt-0.5 text-foreground hover:scale-110 transition-transform focus:outline-hidden"
                        title={isDone ? "Mark Pending" : "Mark Completed"}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-medium text-xs md:text-sm ${
                              isDone ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {action.title}
                          </span>
                          {action.estimatedDays && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 h-4 text-muted-foreground"
                            >
                              <Clock className="h-2.5 w-2.5 mr-1" />
                              {action.estimatedDays}d
                            </Badge>
                          )}
                        </div>

                        {action.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        )}
                      </div>

                      {action.actionUrl && (
                        <div className="shrink-0">
                          {action.actionUrl.startsWith("http") ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              asChild
                            >
                              <a
                                href={action.actionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Course <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              asChild
                            >
                              <Link href={action.actionUrl}>
                                Open Tool <ArrowRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {localStatus === "ACTIVE" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcknowledge}
                disabled={isPending}
              >
                Acknowledge Signal
              </Button>
            )}

            {localStatus !== "RESOLVED" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleResolve}
                disabled={isPending}
                className="gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                Mark Resolved
              </Button>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
