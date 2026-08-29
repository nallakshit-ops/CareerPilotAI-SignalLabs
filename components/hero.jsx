"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Brain,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
} from "lucide-react";

const HeroSection = () => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);

  const careerNodes = [
    {
      id: "discovery",
      label: "Career Compatibility",
      metric: "98% Match",
      subText: "Software Engineer / Product Architect",
      color: "from-blue-500 to-indigo-500",
      icon: Target,
    },
    {
      id: "simulation",
      label: "5-Year Trajectory",
      metric: "₹24L EST.",
      subText: "Tech Lead & System Architect",
      color: "from-emerald-500 to-teal-500",
      icon: TrendingUp,
    },
    {
      id: "skills",
      label: "Skill Gap Analysis",
      metric: "3 Gaps Identified",
      subText: "System Design, Microservices, CI/CD",
      color: "from-amber-500 to-orange-500",
      icon: Brain,
    },
    {
      id: "readiness",
      label: "Placement Readiness",
      metric: "Top 2% Candidate",
      subText: "ATS Resume 94/100 • 8 Mock Interviews",
      color: "from-purple-500 to-pink-500",
      icon: ShieldCheck,
    },
  ];

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-cycle through nodes if user doesn't hover
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % careerNodes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [careerNodes.length]);

  const activeNode = careerNodes[activeNodeIndex];
  const ActiveNodeIcon = activeNode.icon;
  
  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden px-4 pb-16 pt-12 md:pb-24 md:pt-20 lg:pt-24 border-b border-border/40"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Left Column: Headlines & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>Intelligent Career Operating System</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Navigate your career with data, not guesswork.
            </h1>

            <p className="max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed">
              CareerPilot AI helps candidates discover matching roles, analyze real-time skill gaps, simulate career trajectories, and master technical interviews with confidence.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button size="lg" className="h-10 px-5 font-medium gap-2">
                  <span>Open Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/career-simulator">
                <Button variant="outline" size="lg" className="h-10 px-5 font-medium">
                  Explore Career Simulator
                </Button>
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground tracking-tight">98%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Skill Match Precision</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tracking-tight">50+</p>
                <p className="text-xs text-muted-foreground mt-0.5">Industry Sectors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tracking-tight">Real-Time</p>
                <p className="text-xs text-muted-foreground mt-0.5">ATS Optimization</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Career Intelligence Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground border border-border">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Career Telemetry
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Live candidate simulation metrics
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Active System
              </Badge>
            </div>

            {/* Active Node Display Banner */}
            <div className="my-5 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background border border-border text-foreground">
                    <ActiveNodeIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {activeNode.label}
                    </p>
                    <p className="text-lg font-bold tracking-tight text-foreground">
                      {activeNode.metric}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground border-t border-border/60 pt-2">
                {activeNode.subText}
              </p>
            </div>

            {/* Interactive Node Selector Buttons */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Simulate Module
              </p>
              <div className="grid grid-cols-2 gap-2">
                {careerNodes.map((node, index) => {
                  const Icon = node.icon;
                  const isActive = activeNodeIndex === index;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActiveNodeIndex(index)}
                      className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left text-xs transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 text-foreground font-semibold shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="truncate">{node.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Next.js 15 • Gemini 2.5 • PostgreSQL</span>
              <Link href="/dashboard" className="text-xs font-medium text-foreground hover:underline inline-flex items-center gap-1">
                View Full Analysis
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
