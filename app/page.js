import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Brain,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Zap,
  BookOpen,
  Award,
  Layers,
  BarChart3,
  FileCheck2,
} from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import Reveal from "@/components/ui/reveal";

export default function LandingPage() {
  const problemPoints = [
    {
      title: "Unclear Career Trajectory",
      description: "Students struggle to choose between tech roles, product paths, and specialized engineering careers without data-driven guidance.",
      icon: Target,
    },
    {
      title: "Invisible Skill Gaps",
      description: "Traditional syllabi leave major gaps between academic learning and high-paying industry requirements.",
      icon: Brain,
    },
    {
      title: "ATS Resume Rejections",
      description: "Over 75% of student resumes fail automated ATS screening before a human recruiter ever sees them.",
      icon: FileCheck2,
    },
    {
      title: "Interview Performance Anxiety",
      description: "Technical interviews require real-time system design and problem-solving practice that textbooks can't provide.",
      icon: ShieldCheck,
    },
  ];

  const corePillars = [
    {
      step: "01",
      title: "Career Intelligence & Discovery",
      description: "Analyze market demand across 50+ industries to uncover role compatibilities matched to your exact profile and skills.",
      href: "/dashboard",
      icon: Target,
    },
    {
      step: "02",
      title: "5-Year Career Simulation",
      description: "Predict your 5-year trajectory, role promotions, salary growth curves, and skill evolution before taking a job offer.",
      href: "/career-simulator",
      icon: TrendingUp,
    },
    {
      step: "03",
      title: "Real-Time Skill Gap & ATS Coach",
      description: "Compare your resume against real job descriptions to identify missing keywords and get real-time score optimization.",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      step: "04",
      title: "AI Technical & Voice Mock Interviews",
      description: "Practice company-specific interview questions with real-time scoring, confidence metrics, and constructive feedback.",
      href: "/interview",
      icon: ShieldCheck,
    },
  ];

  const journeySteps = [
    { step: "1", title: "Understand Potential", desc: "Profile assessment & industry alignment" },
    { step: "2", title: "Discover Matching Paths", desc: "AI compatibility scoring across top roles" },
    { step: "3", title: "Bridge Skill Gaps", desc: "Targeted learning roadmaps & ATS resume tuning" },
    { step: "4", title: "Master Interviews", desc: "Voice mock interviews & technical quizzes" },
    { step: "5", title: "Placement Ready", desc: "Confident application to high-growth roles" },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      <div>
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. The Student Career Dilemma (Problem Statement) */}
        <section className="w-full py-16 md:py-20 border-b border-border/40">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Career Challenges
              </span>
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-foreground mt-2">
                Why traditional career preparation falls short
              </h2>
              <p className="mt-3 text-sm text-muted-foreground md:text-base leading-relaxed">
                Modern hiring has evolved. Static advice and guesswork leave students unprepared for competitive technical roles.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {problemPoints.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Reveal key={index} delay={index * 0.05}>
                    <Card className="h-full border-border bg-card p-5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="h-9 w-9 rounded-md bg-muted text-foreground flex items-center justify-center mb-3.5 border border-border">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1.5">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. The CareerPilot Ecosystem (4 Core Pillars) */}
        <section className="w-full py-16 md:py-20 border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Core Capabilities
              </span>
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-foreground mt-2">
                An integrated platform for structured career acceleration
              </h2>
              <p className="mt-3 text-sm text-muted-foreground md:text-base leading-relaxed">
                Four purpose-built tools designed to guide you from foundational learning to high-tier placement.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {corePillars.map((pillar, index) => {
                const IconComponent = pillar.icon;
                return (
                  <Reveal key={index} delay={index * 0.08}>
                    <Card className="h-full border-border bg-card p-6 flex flex-col justify-between shadow-xs group">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-10 w-10 rounded-md bg-muted text-foreground flex items-center justify-center border border-border">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-mono font-medium text-muted-foreground">
                            {pillar.step}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {pillar.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                          {pillar.description}
                        </p>
                      </div>
                      <Link href={pillar.href} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline">
                        Open Module
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Interactive Student Trajectory Flow */}
        <section className="w-full py-16 md:py-20 border-b border-border/40">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Placement Journey
              </span>
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-foreground mt-2">
                Five stages to interview readiness
              </h2>
              <p className="mt-3 text-sm text-muted-foreground md:text-base leading-relaxed">
                A methodical progression from skill assessment to confident execution.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 max-w-6xl mx-auto">
              {journeySteps.map((step, index) => (
                <Reveal key={index} delay={index * 0.05}>
                  <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between h-full shadow-xs">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-foreground font-semibold text-xs border border-border mb-3">
                      {step.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        {step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5. FAQ */}
        <section className="w-full py-16 md:py-20 border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <Reveal className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Questions & Answers
              </span>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground mt-2">
                Frequently Asked Questions
              </h2>
            </Reveal>

            <Accordion type="single" collapsible className="w-full space-y-2.5">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-lg border border-border bg-card px-5 transition-colors"
                >
                  <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 6. High-Impact Final CTA */}
        <section className="w-full py-16 md:py-20">
          <Reveal className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="rounded-xl border border-border bg-card p-8 md:p-12 text-center shadow-sm">
              <div className="flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                  Ready to accelerate your career preparation?
                </h2>
                <p className="text-sm text-muted-foreground md:text-base leading-relaxed">
                  Join candidates who use CareerPilot AI to identify skill gaps, optimize resumes, and master technical interviews.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link href="/dashboard">
                    <Button size="lg" className="h-10 px-5 font-medium gap-2">
                      Get Started Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/career-simulator">
                    <Button variant="outline" size="lg" className="h-10 px-5 font-medium">
                      Try Career Simulator
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
