"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SignalTypeBadge,
  SignalSeverityBadge,
  SignalStatusBadge,
} from "./signal-badge";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import SignalDetailModal from "./signal-detail-modal";

export default function SignalCard({ signal, onSignalUpdated }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!signal) return null;

  const actions = signal.actions || [];
  const completedActions = actions.filter((a) => a.status === "COMPLETED").length;
  const isResolved = signal.status === "RESOLVED";

  // Top evidence highlight
  const evidenceList = Array.isArray(signal.evidence) ? signal.evidence : [];
  const topEvidence = evidenceList[0];

  const timeAgo = formatDistanceToNow(new Date(signal.detectedAt || signal.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      <Card
        className={`group relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-md ${
          isResolved
            ? "border-border/50 bg-card/60 opacity-80"
            : signal.severity === "CRITICAL"
            ? "border-red-500/30 bg-gradient-to-b from-card to-red-500/5 hover:border-red-500/50"
            : signal.severity === "HIGH"
            ? "border-amber-500/30 bg-gradient-to-b from-card to-amber-500/5 hover:border-amber-500/50"
            : "border-border bg-card hover:border-primary/40"
        }`}
      >
        <CardHeader className="p-5 pb-3">
          {/* Card Top Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <SignalTypeBadge type={signal.type} />
              <SignalSeverityBadge severity={signal.severity} />
            </div>
            <span className="text-[11px] text-muted-foreground">{timeAgo}</span>
          </div>

          <CardTitle className="text-base md:text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {signal.title}
          </CardTitle>

          <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {signal.summary}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-3">
          {/* Evidence Highlight Pill */}
          {topEvidence && (
            <div className="rounded-lg bg-muted/40 p-2.5 border border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                {topEvidence.label}:
              </span>
              <span className="font-semibold text-foreground">
                {topEvidence.value}
              </span>
            </div>
          )}

          {/* Confidence & Impact Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Confidence Score</span>
              <span className="font-semibold text-foreground">
                {Math.round(signal.confidence)}%
              </span>
            </div>
            <Progress value={signal.confidence} className="h-1.5" />
          </div>

          {/* Action checklist progress */}
          {actions.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-accent" />
                {actions.length} Action Step{actions.length !== 1 ? "s" : ""}
              </span>
              <span className="font-mono text-[11px]">
                {completedActions}/{actions.length} Done
              </span>
            </div>
          )}

          {/* Quick Matching Opportunity Link for Market Shifts */}
          {(signal.type === "MARKET_CHANGE" || signal.type === "OPPORTUNITY") && (
            <div className="pt-1">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs h-7 gap-1.5 font-medium border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                asChild
              >
                <Link href="/explore?tab=jobs">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Explore Matching Opportunities →
                </Link>
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-border/40 mt-auto bg-muted/10">
          <SignalStatusBadge status={signal.status} />

          <Button
            variant="default"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="text-xs gap-1 h-8"
          >
            Investigate Signal
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </CardFooter>
      </Card>

      {/* Deep-Dive Investigation Modal */}
      <SignalDetailModal
        signal={signal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSignalUpdated={onSignalUpdated}
      />
    </>
  );
}
