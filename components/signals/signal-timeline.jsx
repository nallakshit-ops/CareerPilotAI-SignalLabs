"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  SignalTypeBadge,
  SignalSeverityBadge,
  SignalStatusBadge,
} from "./signal-badge";
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Activity,
  Target,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SignalDetailModal from "./signal-detail-modal";

export default function SignalTimeline({ signals = [], onSignalUpdated }) {
  const [selectedSignal, setSelectedSignal] = useState(null);

  if (!signals || signals.length === 0) {
    return (
      <div className="rounded-xl border border-border p-8 text-center bg-card">
        <p className="text-sm text-muted-foreground">
          No signal timeline events recorded yet. Run a signal scan to start your timeline.
        </p>
      </div>
    );
  }

  // Sort chronologically newest first
  const sortedSignals = [...signals].sort(
    (a, b) =>
      new Date(b.detectedAt || b.createdAt).getTime() -
      new Date(a.detectedAt || a.createdAt).getTime()
  );

  const getTimelineIcon = (signal) => {
    if (signal.status === "RESOLVED") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
    switch (signal.type) {
      case "RISK":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "OPPORTUNITY":
      case "IMPROVEMENT":
        return <Sparkles className="h-4 w-4 text-emerald-500" />;
      case "PERFORMANCE":
        return <Activity className="h-4 w-4 text-amber-500" />;
      case "SKILL_GAP":
        return <Target className="h-4 w-4 text-blue-500" />;
      default:
        return <Globe className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <>
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
        {sortedSignals.map((signal) => {
          const dateStr = format(
            new Date(signal.detectedAt || signal.createdAt),
            "MMM dd, yyyy"
          );

          return (
            <div key={signal.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-xs group-hover:border-primary transition-colors">
                {getTimelineIcon(signal)}
              </div>

              {/* Timeline Item Box */}
              <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all hover:shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <SignalTypeBadge type={signal.type} />
                    <SignalSeverityBadge severity={signal.severity} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{dateStr}</span>
                    <SignalStatusBadge status={signal.status} />
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-foreground tracking-tight mt-1">
                  {signal.title}
                </h4>

                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {signal.summary}
                </p>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Score: {Math.round(signal.score)}/100 · Confidence: {Math.round(signal.confidence)}%
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSignal(signal)}
                    className="h-7 text-xs gap-1 text-primary hover:text-primary"
                  >
                    View Details <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SignalDetailModal
        signal={selectedSignal}
        isOpen={!!selectedSignal}
        onClose={() => setSelectedSignal(null)}
        onSignalUpdated={onSignalUpdated}
      />
    </>
  );
}
