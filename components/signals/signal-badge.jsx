"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Sparkles,
  Target,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  GitBranch,
  CheckCircle2,
  Clock,
} from "lucide-react";

export function SignalTypeBadge({ type, className = "" }) {
  switch (type) {
    case "RISK":
      return (
        <Badge
          variant="outline"
          className={`border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 gap-1.5 font-medium ${className}`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          Risk Signal
        </Badge>
      );
    case "OPPORTUNITY":
      return (
        <Badge
          variant="outline"
          className={`border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 font-medium ${className}`}
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          Opportunity
        </Badge>
      );
    case "PERFORMANCE":
      return (
        <Badge
          variant="outline"
          className={`border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 font-medium ${className}`}
        >
          <Activity className="h-3.5 w-3.5 text-amber-500" />
          Performance
        </Badge>
      );
    case "IMPROVEMENT":
      return (
        <Badge
          variant="outline"
          className={`border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 font-medium ${className}`}
        >
          <Zap className="h-3.5 w-3.5 text-emerald-500" />
          Improvement
        </Badge>
      );
    case "SKILL_GAP":
      return (
        <Badge
          variant="outline"
          className={`border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1.5 font-medium ${className}`}
        >
          <Target className="h-3.5 w-3.5 text-blue-500" />
          Skill Gap
        </Badge>
      );
    case "MARKET_CHANGE":
      return (
        <Badge
          variant="outline"
          className={`border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 gap-1.5 font-medium ${className}`}
        >
          <Globe className="h-3.5 w-3.5 text-purple-500" />
          Market Shift
        </Badge>
      );
    case "CAREER_PATH":
      return (
        <Badge
          variant="outline"
          className={`border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 gap-1.5 font-medium ${className}`}
        >
          <GitBranch className="h-3.5 w-3.5 text-cyan-500" />
          Career Path
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={`gap-1.5 font-medium ${className}`}>
          Signal
        </Badge>
      );
  }
}

export function SignalSeverityBadge({ severity, className = "" }) {
  switch (severity) {
    case "CRITICAL":
      return (
        <Badge
          className={`bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-semibold tracking-wide uppercase text-[10px] px-2 py-0.5 ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping mr-1" />
          Critical
        </Badge>
      );
    case "HIGH":
      return (
        <Badge
          className={`bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold tracking-wide uppercase text-[10px] px-2 py-0.5 ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1" />
          High Priority
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge
          className={`bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-medium tracking-wide uppercase text-[10px] px-2 py-0.5 ${className}`}
        >
          Medium
        </Badge>
      );
    case "LOW":
    default:
      return (
        <Badge
          variant="secondary"
          className={`text-muted-foreground font-medium tracking-wide uppercase text-[10px] px-2 py-0.5 ${className}`}
        >
          Low
        </Badge>
      );
  }
}

export function SignalStatusBadge({ status, className = "" }) {
  switch (status) {
    case "RESOLVED":
      return (
        <Badge
          variant="outline"
          className={`border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 text-xs ${className}`}
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Resolved
        </Badge>
      );
    case "ACKNOWLEDGED":
      return (
        <Badge
          variant="outline"
          className={`border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1 text-xs ${className}`}
        >
          <Clock className="h-3 w-3 text-blue-500" />
          Acknowledged
        </Badge>
      );
    case "ACTION_STARTED":
      return (
        <Badge
          variant="outline"
          className={`border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 gap-1 text-xs ${className}`}
        >
          <Activity className="h-3 w-3 text-purple-500" />
          In Progress
        </Badge>
      );
    case "ACTIVE":
    default:
      return (
        <Badge
          variant="outline"
          className={`border-primary/20 bg-primary/5 text-foreground gap-1 text-xs ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Active
        </Badge>
      );
  }
}
