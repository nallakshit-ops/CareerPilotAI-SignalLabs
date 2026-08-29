"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LabelList,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

const tabItems = [
  { id: "simulation", label: "Career Simulation" },
  { id: "comparison", label: "Career Comparison" },
  { id: "risk", label: "Risk Prediction" },
];

const defaultSimulationData = {
  career: "Software Engineer",
  timeline: [
    {
      year: 1,
      role: "Junior Developer",
      salary: "₹6L",
      skills: ["HTML", "CSS"],
    },
    { year: 3, role: "SDE II", salary: "₹12L", skills: ["React", "Node"] },
    { year: 5, role: "Tech Lead", salary: "₹20L", skills: ["System Design"] },
  ],
};

const defaultComparisonData = [
  {
    career: "Software Engineer",
    salary: "₹12L avg",
    salaryScore: 12,
    growth: "High",
    growthScore: 9,
    demand: "High",
    demandScore: 9,
    learningCurve: "Medium",
    learningCurveScore: 6,
  },
  {
    career: "Product Manager",
    salary: "₹14L avg",
    salaryScore: 14,
    growth: "High",
    growthScore: 8,
    demand: "Medium",
    demandScore: 7,
    learningCurve: "High",
    learningCurveScore: 8,
  },
  {
    career: "Data Analyst",
    salary: "₹10L avg",
    salaryScore: 10,
    growth: "Medium",
    growthScore: 7,
    demand: "High",
    demandScore: 8,
    learningCurve: "Low",
    learningCurveScore: 4,
  },
  {
    career: "UX Designer",
    salary: "₹9L avg",
    salaryScore: 9,
    growth: "Medium",
    growthScore: 6,
    demand: "Medium",
    demandScore: 6,
    learningCurve: "Medium",
    learningCurveScore: 5,
  },
  {
    career: "Cloud Engineer",
    salary: "₹16L avg",
    salaryScore: 16,
    growth: "High",
    growthScore: 9,
    demand: "High",
    demandScore: 9,
    learningCurve: "High",
    learningCurveScore: 8,
  },
  {
    career: "Cybersecurity Analyst",
    salary: "₹13L avg",
    salaryScore: 13,
    growth: "High",
    growthScore: 8,
    demand: "High",
    demandScore: 9,
    learningCurve: "Medium",
    learningCurveScore: 7,
  },
  {
    career: "DevOps Engineer",
    salary: "₹15L avg",
    salaryScore: 15,
    growth: "High",
    growthScore: 8,
    demand: "High",
    demandScore: 8,
    learningCurve: "High",
    learningCurveScore: 8,
  },
];

const defaultRiskData = [
  {
    career: "Data Entry",
    risk: "High",
    automationRisk: 90,
    marketDemandRisk: 78,
    skillObsolescenceRisk: 88,
    outlook: "Declining",
    reason: "Highly automatable with AI tools",
    suggestion: "Transition to Data Analysis",
    skillsToLearn: ["Advanced Excel", "SQL", "Data Visualization"],
    alternativeCareers: ["Data Analyst", "Operations Analyst"],
    aiInsight:
      "This role has high automation exposure. Upskilling toward analytical decision support is the safest path.",
  },
  {
    career: "Software Engineer",
    risk: "Medium",
    automationRisk: 62,
    marketDemandRisk: 34,
    skillObsolescenceRisk: 58,
    outlook: "Growing",
    reason: "Routine coding tasks are increasingly assisted by AI",
    suggestion:
      "Build depth in architecture, product thinking, and AI integration",
    skillsToLearn: ["System Design", "LLM Integration", "Cloud Architecture"],
    alternativeCareers: ["ML Engineer", "Platform Engineer"],
    aiInsight:
      "This career is moderately safe but requires continuous upskilling in AI-assisted development workflows.",
  },
  {
    career: "Product Manager",
    risk: "Low",
    automationRisk: 28,
    marketDemandRisk: 36,
    skillObsolescenceRisk: 42,
    outlook: "Stable",
    reason: "Requires cross-functional strategy and human decision-making",
    suggestion: "Strengthen leadership and data-informed decision skills",
    skillsToLearn: [
      "Product Analytics",
      "AI Product Strategy",
      "Experiment Design",
    ],
    alternativeCareers: ["Growth PM", "Program Manager"],
    aiInsight:
      "The role remains resilient due to high human judgment requirements, but AI fluency improves long-term competitiveness.",
  },
  {
    career: "Cloud Engineer",
    risk: "Low",
    automationRisk: 26,
    marketDemandRisk: 30,
    skillObsolescenceRisk: 44,
    outlook: "Growing",
    reason:
      "Cloud adoption is accelerating and requires deep platform knowledge.",
    suggestion:
      "Strengthen IaC, distributed systems, and cloud security skills.",
    skillsToLearn: ["Terraform", "Kubernetes", "Cloud Security"],
    alternativeCareers: ["Platform Engineer", "Site Reliability Engineer"],
    aiInsight:
      "This role is comparatively safe with strong long-term demand, especially for engineers who can automate cloud operations.",
  },
  {
    career: "Cybersecurity Analyst",
    risk: "Low",
    automationRisk: 24,
    marketDemandRisk: 28,
    skillObsolescenceRisk: 46,
    outlook: "Growing",
    reason:
      "Security threats evolve rapidly, requiring human-led investigation and response.",
    suggestion:
      "Learn threat modeling, SOC workflows, and cloud-native security.",
    skillsToLearn: ["Threat Detection", "SIEM", "Incident Response"],
    alternativeCareers: ["Security Engineer", "Cloud Security Specialist"],
    aiInsight:
      "Security remains resilient because organizations need continuous human decision-making to handle complex threats.",
  },
  {
    career: "DevOps Engineer",
    risk: "Medium",
    automationRisk: 48,
    marketDemandRisk: 35,
    skillObsolescenceRisk: 56,
    outlook: "Stable",
    reason:
      "Automation helps with pipelines, but platform reliability expertise is still essential.",
    suggestion:
      "Deepen skills in observability, SRE principles, and platform engineering.",
    skillsToLearn: ["Observability", "SRE Practices", "GitOps"],
    alternativeCareers: [
      "Site Reliability Engineer",
      "Cloud Platform Engineer",
    ],
    aiInsight:
      "This career remains strong when paired with advanced reliability engineering and cloud architecture skills.",
  },
];

const levelToScoreMap = {
  Low: 45,
  Medium: 70,
  High: 88,
};

const comparisonProsCons = {
  "Software Engineer": {
    pros: [
      "Strong hiring demand across industries",
      "Fast salary growth through specialization",
    ],
    cons: [
      "Requires constant upskilling",
      "Can involve long release cycles and deadlines",
    ],
  },
  "Product Manager": {
    pros: [
      "High business impact and visibility",
      "Great cross-functional leadership growth",
    ],
    cons: [
      "Ambiguous scope can be stressful",
      "Heavy stakeholder alignment workload",
    ],
  },
  "Data Analyst": {
    pros: [
      "Clear entry route into data careers",
      "High demand for decision support",
    ],
    cons: [
      "Some repetitive reporting work",
      "Salary ceiling lower than advanced data roles",
    ],
  },
  "UX Designer": {
    pros: [
      "Strong creative and product influence",
      "Growing demand in digital-first teams",
    ],
    cons: [
      "Portfolio quality drives opportunities heavily",
      "Feedback loops can be subjective",
    ],
  },
  "Cloud Engineer": {
    pros: [
      "High enterprise demand with strong salary bands",
      "Clear progression into platform and architecture roles",
    ],
    cons: [
      "Requires broad infra and networking fundamentals",
      "On-call ownership can increase pressure",
    ],
  },
  "Cybersecurity Analyst": {
    pros: [
      "Demand continues to rise across sectors",
      "Strong pathway into high-impact specialist roles",
    ],
    cons: [
      "Incident response can be stressful and time-critical",
      "Needs constant learning as threats evolve",
    ],
  },
  "DevOps Engineer": {
    pros: [
      "Excellent compensation and cross-team influence",
      "High leverage through automation and reliability work",
    ],
    cons: [
      "Requires deep ownership of production systems",
      "Tooling landscape changes quickly",
    ],
  },
};

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const mockCareerSimulations = {
  "Software Engineer": {
    career: "Software Engineer",
    aiInsight: [
      "Strong growth in the first 5 years with leadership upside.",
      "System design and architecture become critical after year 3.",
    ],
    timeline: [
      {
        year: 1,
        role: "Junior Developer",
        icon: "👨‍💻",
        salary: "₹6L",
        salaryValue: 6,
        promotionProbability: 68,
        timeToNextLevel: "12-18 months",
        skills: [
          { name: "HTML", level: "Beginner" },
          { name: "CSS", level: "Beginner" },
          { name: "JavaScript", level: "Beginner" },
        ],
      },
      {
        year: 3,
        role: "SDE II",
        icon: "🧠",
        salary: "₹12L",
        salaryValue: 12,
        promotionProbability: 74,
        timeToNextLevel: "18-24 months",
        skills: [
          { name: "React", level: "Intermediate" },
          { name: "Node.js", level: "Intermediate" },
          { name: "Testing", level: "Intermediate" },
        ],
      },
      {
        year: 5,
        role: "Tech Lead",
        icon: "🚀",
        salary: "₹20L",
        salaryValue: 20,
        promotionProbability: 81,
        timeToNextLevel: "24+ months",
        skills: [
          { name: "System Design", level: "Advanced" },
          { name: "Mentoring", level: "Advanced" },
          { name: "Architecture", level: "Advanced" },
        ],
      },
    ],
  },
  "Data Scientist": {
    career: "Data Scientist",
    aiInsight: [
      "Data storytelling accelerates promotion probability after year 3.",
      "Model deployment and MLOps become key differentiators by year 5.",
    ],
    timeline: [
      {
        year: 1,
        role: "Data Analyst",
        icon: "👨‍💻",
        salary: "₹7L",
        salaryValue: 7,
        promotionProbability: 64,
        timeToNextLevel: "12-18 months",
        skills: [
          { name: "SQL", level: "Beginner" },
          { name: "Excel", level: "Beginner" },
          { name: "Python", level: "Beginner" },
        ],
      },
      {
        year: 3,
        role: "ML Engineer",
        icon: "🧠",
        salary: "₹14L",
        salaryValue: 14,
        promotionProbability: 72,
        timeToNextLevel: "18-24 months",
        skills: [
          { name: "Pandas", level: "Intermediate" },
          { name: "Scikit-learn", level: "Intermediate" },
          { name: "Experimentation", level: "Intermediate" },
        ],
      },
      {
        year: 5,
        role: "Senior Data Scientist",
        icon: "🚀",
        salary: "₹24L",
        salaryValue: 24,
        promotionProbability: 79,
        timeToNextLevel: "24+ months",
        skills: [
          { name: "MLOps", level: "Advanced" },
          { name: "Forecasting", level: "Advanced" },
          { name: "Business Strategy", level: "Advanced" },
        ],
      },
    ],
  },
  "Product Manager": {
    career: "Product Manager",
    aiInsight: [
      "Cross-functional communication gives the highest early growth boost.",
      "Decision quality and roadmap ownership are critical after year 3.",
    ],
    timeline: [
      {
        year: 1,
        role: "Associate PM",
        icon: "👨‍💻",
        salary: "₹8L",
        salaryValue: 8,
        promotionProbability: 62,
        timeToNextLevel: "12-18 months",
        skills: [
          { name: "User Research", level: "Beginner" },
          { name: "PRD Writing", level: "Beginner" },
          { name: "Analytics", level: "Beginner" },
        ],
      },
      {
        year: 3,
        role: "Product Manager",
        icon: "🧠",
        salary: "₹15L",
        salaryValue: 15,
        promotionProbability: 71,
        timeToNextLevel: "18-24 months",
        skills: [
          { name: "Roadmapping", level: "Intermediate" },
          { name: "Prioritization", level: "Intermediate" },
          { name: "Stakeholder Mgmt", level: "Intermediate" },
        ],
      },
      {
        year: 5,
        role: "Senior PM",
        icon: "🚀",
        salary: "₹25L",
        salaryValue: 25,
        promotionProbability: 78,
        timeToNextLevel: "24+ months",
        skills: [
          { name: "Product Strategy", level: "Advanced" },
          { name: "Leadership", level: "Advanced" },
          { name: "P&L Thinking", level: "Advanced" },
        ],
      },
    ],
  },
  "Cloud Engineer": {
    career: "Cloud Engineer",
    aiInsight: [
      "Cloud platform expertise compounds rapidly after year 3.",
      "Infrastructure security and reliability skills drive senior promotions.",
    ],
    timeline: [
      {
        year: 1,
        role: "Cloud Support Engineer",
        icon: "👨‍💻",
        salary: "₹9L",
        salaryValue: 9,
        promotionProbability: 66,
        timeToNextLevel: "12-18 months",
        skills: [
          { name: "Linux", level: "Beginner" },
          { name: "Networking", level: "Beginner" },
          { name: "AWS Fundamentals", level: "Beginner" },
        ],
      },
      {
        year: 3,
        role: "Cloud Engineer",
        icon: "🧠",
        salary: "₹16L",
        salaryValue: 16,
        promotionProbability: 75,
        timeToNextLevel: "18-24 months",
        skills: [
          { name: "Terraform", level: "Intermediate" },
          { name: "Kubernetes", level: "Intermediate" },
          { name: "CI/CD", level: "Intermediate" },
        ],
      },
      {
        year: 5,
        role: "Senior Cloud Architect",
        icon: "🚀",
        salary: "₹28L",
        salaryValue: 28,
        promotionProbability: 82,
        timeToNextLevel: "24+ months",
        skills: [
          { name: "Architecture", level: "Advanced" },
          { name: "Cloud Security", level: "Advanced" },
          { name: "Cost Optimization", level: "Advanced" },
        ],
      },
    ],
  },
  "Cybersecurity Analyst": {
    career: "Cybersecurity Analyst",
    aiInsight: [
      "Threat analysis expertise grows in value with experience.",
      "Specialization in cloud security boosts long-term career resilience.",
    ],
    timeline: [
      {
        year: 1,
        role: "Security Operations Analyst",
        icon: "👨‍💻",
        salary: "₹8L",
        salaryValue: 8,
        promotionProbability: 63,
        timeToNextLevel: "12-18 months",
        skills: [
          { name: "SOC Basics", level: "Beginner" },
          { name: "SIEM", level: "Beginner" },
          { name: "Network Security", level: "Beginner" },
        ],
      },
      {
        year: 3,
        role: "Cybersecurity Analyst",
        icon: "🧠",
        salary: "₹13L",
        salaryValue: 13,
        promotionProbability: 72,
        timeToNextLevel: "18-24 months",
        skills: [
          { name: "Threat Hunting", level: "Intermediate" },
          { name: "Incident Response", level: "Intermediate" },
          { name: "Vulnerability Mgmt", level: "Intermediate" },
        ],
      },
      {
        year: 5,
        role: "Security Engineer",
        icon: "🚀",
        salary: "₹23L",
        salaryValue: 23,
        promotionProbability: 80,
        timeToNextLevel: "24+ months",
        skills: [
          { name: "Cloud Security", level: "Advanced" },
          { name: "Threat Modeling", level: "Advanced" },
          { name: "Security Automation", level: "Advanced" },
        ],
      },
    ],
  },
};

function extractSalaryValue(salary) {
  if (!salary) return 0;
  const str = String(salary).toUpperCase();
  
  // Try to match explicitly marked LPA/Lakh values (e.g. "12L", "12 LPA")
  const lpaMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:L|LPA|LAKHS?)/);
  if (lpaMatch) {
    return Number(lpaMatch[1]);
  }
  
  // If not explicitly marked, extract the first valid number
  const nums = str.match(/\d+(?:,\d+)*(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return 0;
  
  let val = Number(nums[0].replace(/,/g, ""));
  
  // If it's a raw large number (e.g. 800000), convert it to Lakhs
  if (val > 1000) {
    val = val / 100000;
  }
  
  return Number.isFinite(val) ? Number(val.toFixed(1)) : 0;
}

function normalizeTo100(value, min, max) {
  if (max === min) return 100;
  return Math.round(((value - min) / (max - min)) * 100);
}

function normalizeComparisonItem(item) {
  const salaryScore =
    item.salaryScore ??
    (Number(String(item.salary).replace(/[^\d]/g, "")) || 0);
  const growthScore = item.growthScore ?? levelToScoreMap[item.growth] ?? 60;
  const demandScore = item.demandScore ?? levelToScoreMap[item.demand] ?? 60;
  const learningCurveScore =
    item.learningCurveScore ?? levelToScoreMap[item.learningCurve] ?? 60;

  return {
    ...item,
    salaryScore,
    growthScore,
    demandScore,
    learningCurveScore,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getRiskLevelFromScore(score) {
  if (score >= 67) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function normalizeRiskItem(item, index = 0) {
  const automationRisk = clamp(
    Number(item.automationRisk ?? 65 + index * 4),
    0,
    100,
  );
  const marketDemandRisk = clamp(
    Number(
      item.marketDemandRisk ??
        (item.risk === "Low" ? 30 : item.risk === "Medium" ? 55 : 80),
    ),
    0,
    100,
  );
  const skillObsolescenceRisk = clamp(
    Number(
      item.skillObsolescenceRisk ??
        (item.risk === "Low" ? 35 : item.risk === "Medium" ? 60 : 85),
    ),
    0,
    100,
  );

  const riskScore = Math.round(
    (automationRisk + marketDemandRisk + skillObsolescenceRisk) / 3,
  );

  return {
    ...item,
    risk: item.risk ?? getRiskLevelFromScore(riskScore),
    automationRisk,
    marketDemandRisk,
    skillObsolescenceRisk,
    riskScore,
    outlook:
      item.outlook ??
      (riskScore >= 67 ? "Declining" : riskScore >= 40 ? "Stable" : "Growing"),
    skillsToLearn: item.skillsToLearn ?? [
      "AI Tools",
      "Data Literacy",
      "Domain Specialization",
    ],
    alternativeCareers: item.alternativeCareers ?? [
      "Business Analyst",
      "Data Analyst",
    ],
    aiInsight:
      item.aiInsight ??
      "Risk can be reduced significantly through focused upskilling and role repositioning.",
  };
}

function getRiskTone(riskLevel) {
  if (riskLevel === "High") {
    return {
      stroke: "#ef4444",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      track: "#3a1f24",
    };
  }
  if (riskLevel === "Medium") {
    return {
      stroke: "#eab308",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      track: "#3b341f",
    };
  }
  return {
    stroke: "#22c55e",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    track: "#1e3a2a",
  };
}

function getOutlookTone(outlook) {
  if (outlook === "Growing")
    return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (outlook === "Declining")
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  return "text-amber-400 border-amber-500/30 bg-amber-500/10";
}

function RiskGauge({ value = 0, level = "Medium" }) {
  const size = 170;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = clamp(value, 0, 100);
  const offset = circumference - (progress / 100) * circumference;
  const tone = getRiskTone(level);

  return (
    <div className="relative mx-auto h-[170px] w-[170px]">
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{progress}</span>
        <span
          className={`text-xs font-medium uppercase tracking-wide ${tone.text}`}
        >
          {level} Risk
        </span>
      </div>
    </div>
  );
}

function formatCareerTick(value) {
  if (value === "Software Engineer") return "Software Eng.";
  if (value === "Product Manager") return "Product Mgmt";
  if (value === "Data Analyst") return "Data Analyst";
  if (value === "UX Designer") return "UX Designer";
  if (value === "Cloud Engineer") return "Cloud Eng.";
  if (value === "Cybersecurity Analyst") return "Cybersecurity";
  if (value === "DevOps Engineer") return "DevOps Eng.";
  return value;
}

function PremiumComparisonTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-md">
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      <div className="space-y-1 text-xs">
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-3"
          >
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.dataKey}
            </span>
            <span className="text-foreground">{entry.value}/100</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function inferRoleIcon(role) {
  const text = String(role ?? "").toLowerCase();
  if (text.includes("lead") || text.includes("senior")) return "🚀";
  if (
    text.includes("sde") ||
    text.includes("engineer") ||
    text.includes("developer")
  )
    return "👨‍💻";
  return "🧠";
}

function normalizeApiSimulation(raw) {
  if (!raw || !Array.isArray(raw.timeline) || raw.timeline.length === 0) {
    return null;
  }

  const timeline = raw.timeline.map((stage, index) => {
    const level = SKILL_LEVELS[Math.min(index, SKILL_LEVELS.length - 1)];
    const normalizedSkills = (stage.skills ?? []).map((skill) => {
      if (typeof skill === "string") {
        return { name: skill, level };
      }

      return {
        name: skill?.name ?? "Skill",
        level: skill?.level ?? level,
      };
    });

    return {
      year: stage.year,
      role: stage.role,
      icon: stage.icon ?? inferRoleIcon(stage.role),
      salary: stage.salary,
      salaryValue: stage.salaryValue ?? extractSalaryValue(stage.salary),
      promotionProbability:
        stage.promotionProbability ?? Math.min(90, 64 + index * 8),
      timeToNextLevel:
        stage.timeToNextLevel ??
        (index === raw.timeline.length - 1 ? "24+ months" : "12-18 months"),
      skills: normalizedSkills,
    };
  });

  return {
    career: raw.career ?? "Software Engineer",
    aiInsight: [
      "Strong growth in first 5 years with consistent skill depth.",
      "Architecture and decision-making become critical after year 3.",
    ],
    timeline,
  };
}

function getSkillLevelTone(level) {
  if (level === "Advanced") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  }
  if (level === "Intermediate") {
    return "border-sky-500/40 bg-sky-500/10 text-sky-400";
  }
  return "border-amber-500/40 bg-amber-500/10 text-amber-400";
}

function SimulationSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-full max-w-sm rounded-xl bg-muted/60" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-border/60 bg-card/50 p-5 space-y-3"
          >
            <div className="h-4 w-1/3 rounded bg-muted/60" />
            <div className="h-5 w-3/5 rounded bg-muted/60" />
            <div className="h-4 w-2/5 rounded bg-muted/60" />
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-muted/60" />
              <div className="h-6 w-24 rounded-full bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 rounded-2xl border border-border/60 bg-card/50" />
    </div>
  );
}

function getRiskBadgeVariant(risk) {
  if (risk === "High") return "destructive";
  if (risk === "Medium") return "secondary";
  return "default";
}

export default function CareerSimulatorPage() {
  const [activeTab, setActiveTab] = useState("simulation");
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [simulationData, setSimulationData] = useState(defaultSimulationData);
  const [comparisonData, setComparisonData] = useState(defaultComparisonData);
  const [riskData, setRiskData] = useState(defaultRiskData);
  const [careerSimulations, setCareerSimulations] = useState(
    mockCareerSimulations,
  );
  const [selectedSimulationCareer, setSelectedSimulationCareer] =
    useState("Software Engineer");
  const [isSimulationSwitching, setIsSimulationSwitching] = useState(false);
  const [isComparisonSwitching, setIsComparisonSwitching] = useState(false);
  const [isRiskSwitching, setIsRiskSwitching] = useState(false);
  const [selectedCareers, setSelectedCareers] = useState([
    "Software Engineer",
    "Product Manager",
  ]);
  const [riskCareer, setRiskCareer] = useState("Data Entry");
  const [profileRoles, setProfileRoles] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCareerDashboardData() {
      try {
        setIsApiLoading(true);
        setApiError("");

        const [simulationRes, comparisonRes, riskRes] = await Promise.all([
          fetch("/api/career-simulate", { cache: "no-store" }),
          fetch("/api/career-compare", { cache: "no-store" }),
          fetch("/api/career-risk", { cache: "no-store" }),
        ]);

        if (!simulationRes.ok || !comparisonRes.ok || !riskRes.ok) {
          throw new Error("Failed to fetch one or more career datasets");
        }

        const [simulationJson, comparisonJson, riskJson] = await Promise.all([
          simulationRes.json(),
          comparisonRes.json(),
          riskRes.json(),
        ]);

        if (!isMounted) return;

        setSimulationData(simulationJson?.data ?? defaultSimulationData);
        const normalizedApiSimulation = normalizeApiSimulation(
          simulationJson?.data,
        );
        if (normalizedApiSimulation) {
          setCareerSimulations((prev) => ({
            ...prev,
            [normalizedApiSimulation.career]: normalizedApiSimulation,
          }));
          setSelectedSimulationCareer((prev) =>
            prev && prev.length > 0 ? prev : normalizedApiSimulation.career,
          );
        }
        setComparisonData(
          (comparisonJson?.data ?? defaultComparisonData).map(
            normalizeComparisonItem,
          ),
        );
        setRiskData((riskJson?.data ?? defaultRiskData).map(normalizeRiskItem));
      } catch (error) {
        if (!isMounted) return;

        setSimulationData(defaultSimulationData);
        setComparisonData(defaultComparisonData.map(normalizeComparisonItem));
        setRiskData(defaultRiskData.map(normalizeRiskItem));
        setApiError(error?.message || "Using local mock data");
      } finally {
        if (isMounted) {
          setIsApiLoading(false);
        }
      }
    }

    // Fetch dashboard insights to get profile-relevant roles
    async function loadProfileRoles() {
      try {
        const res = await fetch("/api/explore?type=roles", { cache: "no-store" });
        if (!res.ok) throw new Error("roles fetch failed");
        const json = await res.json();
        if (isMounted && Array.isArray(json?.roles) && json.roles.length > 0) {
          setProfileRoles(json.roles);
        }
      } catch {
        // Silently fall back to API-provided / static roles
      }
    }

    loadCareerDashboardData();
    loadProfileRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableCareers = useMemo(
    () => comparisonData.map((item) => item.career),
    [comparisonData],
  );

  const simulationCareerOptions = useMemo(
    () => Object.keys(careerSimulations),
    [careerSimulations],
  );

  const activeSimulation = useMemo(
    () =>
      careerSimulations[selectedSimulationCareer] ??
      careerSimulations[simulationCareerOptions[0]],
    [careerSimulations, selectedSimulationCareer, simulationCareerOptions],
  );

  const salaryGrowthData = useMemo(
    () =>
      (activeSimulation?.timeline ?? []).map((stage) => ({
        year: `Year ${stage.year}`,
        salaryValue: stage.salaryValue,
      })),
    [activeSimulation],
  );

  const selectedComparisonRows = useMemo(
    () =>
      comparisonData.filter((item) => selectedCareers.includes(item.career)),
    [comparisonData, selectedCareers],
  );

  const comparisonRowsWithScore = useMemo(() => {
    if (selectedComparisonRows.length === 0) return [];

    const salaryValues = selectedComparisonRows.map((row) => row.salaryScore);
    const salaryMin = Math.min(...salaryValues);
    const salaryMax = Math.max(...salaryValues);

    return selectedComparisonRows.map((row) => {
      const salaryNormalized = normalizeTo100(
        row.salaryScore,
        salaryMin,
        salaryMax,
      );
      const demandNormalized = Math.min(100, Math.max(0, row.demandScore * 10));
      const growthNormalized = Math.min(100, Math.max(0, row.growthScore * 10));
      const learningNormalized = Math.min(
        100,
        Math.max(0, row.learningCurveScore * 10),
      );

      const careerScore = Math.round(
        salaryNormalized * 0.4 +
          demandNormalized * 0.3 +
          growthNormalized * 0.3,
      );

      return {
        ...row,
        salaryNormalized,
        demandNormalized,
        growthNormalized,
        learningNormalized,
        careerScore,
        pros: comparisonProsCons[row.career]?.pros ?? [
          "Strong potential with focused upskilling",
        ],
        cons: comparisonProsCons[row.career]?.cons ?? [
          "Requires consistency to stay competitive",
        ],
      };
    });
  }, [selectedComparisonRows]);

  const comparisonExtremes = useMemo(() => {
    if (comparisonRowsWithScore.length === 0) {
      return null;
    }

    const metricValues = {
      salaryNormalized: comparisonRowsWithScore.map(
        (row) => row.salaryNormalized,
      ),
      demandNormalized: comparisonRowsWithScore.map(
        (row) => row.demandNormalized,
      ),
      growthNormalized: comparisonRowsWithScore.map(
        (row) => row.growthNormalized,
      ),
      learningNormalized: comparisonRowsWithScore.map(
        (row) => row.learningNormalized,
      ),
      careerScore: comparisonRowsWithScore.map((row) => row.careerScore),
    };

    return {
      salaryNormalized: {
        best: Math.max(...metricValues.salaryNormalized),
        worst: Math.min(...metricValues.salaryNormalized),
      },
      demandNormalized: {
        best: Math.max(...metricValues.demandNormalized),
        worst: Math.min(...metricValues.demandNormalized),
      },
      growthNormalized: {
        best: Math.max(...metricValues.growthNormalized),
        worst: Math.min(...metricValues.growthNormalized),
      },
      learningNormalized: {
        best: Math.max(...metricValues.learningNormalized),
        worst: Math.min(...metricValues.learningNormalized),
      },
      careerScore: {
        best: Math.max(...metricValues.careerScore),
        worst: Math.min(...metricValues.careerScore),
      },
    };
  }, [comparisonRowsWithScore]);

  const comparisonChartData = useMemo(
    () =>
      comparisonRowsWithScore.map((row) => ({
        career: row.career,
        Salary: row.salaryNormalized,
        Demand: row.demandNormalized,
        Growth: row.growthNormalized,
      })),
    [comparisonRowsWithScore],
  );

  const bestComparisonCareer = useMemo(() => {
    if (comparisonRowsWithScore.length === 0) return null;
    return [...comparisonRowsWithScore].sort(
      (a, b) => b.careerScore - a.careerScore,
    )[0];
  }, [comparisonRowsWithScore]);

  const selectedRisk = useMemo(
    () => riskData.find((item) => item.career === riskCareer) ?? riskData[0],
    [riskCareer, riskData],
  );

  const riskCareers = useMemo(
    () => riskData.map((item) => item.career),
    [riskData],
  );

  useEffect(() => {
    if (availableCareers.length === 0) return;

    setSelectedCareers((prev) => {
      const filtered = prev.filter((career) =>
        availableCareers.includes(career),
      );

      let next;
      if (filtered.length >= 1) {
        next = filtered.slice(0, 3);
      } else {
        const extras = availableCareers.filter(
          (career) => !filtered.includes(career),
        );
        next = [...filtered, ...extras].slice(
          0,
          Math.min(3, Math.max(1, availableCareers.length)),
        );
      }

      if (
        prev.length === next.length &&
        prev.every((career, index) => career === next[index])
      ) {
        return prev;
      }

      return next;
    });
  }, [availableCareers]);

  useEffect(() => {
    if (!riskData.some((item) => item.career === riskCareer) && riskData[0]) {
      setRiskCareer(riskData[0].career);
    }
  }, [riskCareer, riskData]);

  useEffect(() => {
    if (!simulationCareerOptions.includes(selectedSimulationCareer)) {
      setSelectedSimulationCareer(simulationCareerOptions[0] ?? "");
    }
  }, [selectedSimulationCareer, simulationCareerOptions]);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;

    setIsLoading(true);
    setActiveTab(tabId);

    window.setTimeout(() => {
      setIsLoading(false);
    }, 220);
  };

  const toggleCareer = (career) => {
    setIsComparisonSwitching(true);

    const isSelected = selectedCareers.includes(career);

    if (isSelected) {
      if (selectedCareers.length <= 1) {
        window.setTimeout(() => {
          setIsComparisonSwitching(false);
        }, 220);
        return;
      }
      setSelectedCareers((prev) => prev.filter((item) => item !== career));
      window.setTimeout(() => {
        setIsComparisonSwitching(false);
      }, 220);
      return;
    }

    if (selectedCareers.length >= 3) {
      window.setTimeout(() => {
        setIsComparisonSwitching(false);
      }, 220);
      return;
    }
    setSelectedCareers((prev) => [...prev, career]);
    window.setTimeout(() => {
      setIsComparisonSwitching(false);
    }, 220);
  };

  const getMetricCellTone = (metric, value) => {
    const stat = comparisonExtremes?.[metric];
    if (!stat) return "text-foreground";

    if (value === stat.best && stat.best !== stat.worst) {
      return "text-emerald-400 font-semibold";
    }

    if (value === stat.worst && stat.best !== stat.worst) {
      return "text-rose-400 font-semibold";
    }

    return "text-foreground";
  };

  const handleSimulationCareerChange = (career) => {
    if (career === selectedSimulationCareer) return;

    setIsSimulationSwitching(true);
    setSelectedSimulationCareer(career);

    window.setTimeout(() => {
      setIsSimulationSwitching(false);
    }, 250);
  };

  const handleRiskCareerChange = (career) => {
    if (career === riskCareer) return;

    setIsRiskSwitching(true);
    setRiskCareer(career);

    window.setTimeout(() => {
      setIsRiskSwitching(false);
    }, 260);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Career Simulator
          </h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-sm">
            Model trajectory growth paths, compare market metrics, and assess automation risk.
          </p>
          {isApiLoading && (
            <p className="mt-1.5 text-xs text-muted-foreground animate-pulse">
              Syncing career insights...
            </p>
          )}
          {!!apiError && !isApiLoading && (
            <p className="mt-1 text-xs text-muted-foreground">
              Using cached benchmark data
            </p>
          )}
        </div>

        <div className="flex gap-1 bg-muted/40 border border-border p-1 rounded-lg">
          {tabItems.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              size="sm"
              className={`rounded-md text-xs font-medium ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
          <div
            className={`transition-all duration-300 ${
              isLoading
                ? "opacity-40 translate-y-1"
                : "opacity-100 translate-y-0"
            }`}
          >
            {activeTab === "simulation" && (
              <section className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-display font-semibold tracking-tight">Career Simulation</h2>
                    <p className="text-sm text-muted-foreground">
                      Explore milestones, compensation growth, and promotion realism.
                    </p>
                  </div>
                  <div className="w-full sm:w-[260px]">
                    <Select
                      value={selectedSimulationCareer}
                      onValueChange={handleSimulationCareerChange}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                        <SelectValue placeholder="Select career" />
                      </SelectTrigger>
                      <SelectContent>
                        {simulationCareerOptions.map((career) => (
                          <SelectItem key={career} value={career}>
                            {career}
                          </SelectItem>
                        ))}
                        {profileRoles.filter(r => !simulationCareerOptions.includes(r)).map((role) => (
                          <SelectItem key={`profile-${role}`} value={role} disabled className="text-muted-foreground">
                            {role} (profile)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isApiLoading ? (
                  <SimulationSkeleton />
                ) : (
                  <div
                    className={`space-y-6 transition-all duration-300 ${
                      isSimulationSwitching
                        ? "opacity-30 translate-y-1"
                        : "opacity-100 translate-y-0"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-white/[0.03] border-white/[0.06]">
                        {activeSimulation?.career}
                      </Badge>
                      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        5-Year Journey
                      </Badge>
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-5 h-[calc(100%-32px)] w-[2px] bg-gradient-to-b from-primary to-emerald-400/50 lg:left-0 lg:right-0 lg:top-10 lg:h-[2px] lg:w-full" />

                      <div className="grid gap-5 lg:grid-cols-3">
                        {(activeSimulation?.timeline ?? []).map((stage) => (
                          <Card
                            key={stage.year}
                            className="relative glass group hover-lift"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Year {stage.year}
                                  </p>
                                  <CardTitle className="mt-1 text-base sm:text-lg flex items-center gap-2">
                                    <span aria-hidden>{stage.icon}</span>
                                    {stage.role}
                                  </CardTitle>
                                </div>
                                <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                                  {stage.salary}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {(stage.skills ?? []).map((skill) => (
                                  <Badge
                                    key={`${stage.year}-${skill.name}`}
                                    variant="outline"
                                    className={getSkillLevelTone(skill.level)}
                                  >
                                    {skill.name} - {skill.level}
                                  </Badge>
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                                <div>
                                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                    Promotion
                                  </p>
                                  <p className="text-sm font-bold text-foreground font-display tracking-tight">
                                    {stage.promotionProbability}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                    Next Level
                                  </p>
                                  <p className="text-sm font-bold text-foreground font-display tracking-tight">
                                    {stage.timeToNextLevel}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-5">
                      <Card className="glass xl:col-span-3">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base sm:text-lg font-display tracking-tight">
                            Salary Growth Trajectory
                          </CardTitle>
                          <CardDescription>
                            Year milestones vs Salary in LPA
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salaryGrowthData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                              <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="hsl(var(--border))"
                                opacity={0.3}
                                vertical={false}
                              />
                              <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
                              <Tooltip
                                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                content={({ active, payload }) => {
                                  if (active && payload?.length) {
                                    return (
                                      <div className="glass-strong rounded-xl p-3 shadow-2xl border border-white/[0.08]">
                                        <p className="text-sm font-semibold text-foreground tracking-tight">
                                          ₹{payload[0].value}L
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {payload[0].payload.year}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="salaryValue"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2.5}
                                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                                activeDot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))', r: 6 }}
                                isAnimationActive
                                animationDuration={700}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card className="glass relative overflow-hidden xl:col-span-2">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                        <CardHeader className="relative z-10">
                          <CardTitle className="text-base sm:text-lg font-display tracking-tight">
                            AI Insight
                          </CardTitle>
                          <CardDescription>
                            Opportunity signals from progression patterns
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 relative z-10">
                          {(activeSimulation?.aiInsight ?? []).map(
                            (insight) => (
                              <div
                                key={insight}
                                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-foreground/90"
                              >
                                {insight}
                              </div>
                            ),
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="glass">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base sm:text-lg font-display tracking-tight">
                          Skill Progression View
                        </CardTitle>
                        <CardDescription>
                          Beginner to Advanced evolution across milestone years
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(activeSimulation?.timeline ?? []).map((stage) => (
                          <div
                            key={`progress-${stage.year}`}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge variant="outline">Year {stage.year}</Badge>
                              <span className="text-sm font-medium">
                                {stage.role}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(stage.skills ?? []).map((skill) => (
                                <Badge
                                  key={`progress-${stage.year}-${skill.name}`}
                                  variant="outline"
                                  className={getSkillLevelTone(skill.level)}
                                >
                                  {skill.level} - {skill.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </section>
            )}

            {activeTab === "comparison" && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-display font-semibold tracking-tight">Career Comparison</h2>
                  <p className="text-sm text-muted-foreground">
                    Compare up to 3 careers with normalized scoring and
                    recommendation insights.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                      >
                        Select Careers ({selectedCareers.length}/3)
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="start">
                      <DropdownMenuLabel>
                        Choose up to 3 careers
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {availableCareers.map((career) => {
                        const checked = selectedCareers.includes(career);
                        const disableSelection =
                          !checked && selectedCareers.length >= 3;

                        return (
                          <DropdownMenuCheckboxItem
                            key={career}
                            checked={checked}
                            disabled={disableSelection}
                            onCheckedChange={() => toggleCareer(career)}
                          >
                            {career}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex flex-wrap gap-2">
                    {selectedCareers.map((career) => (
                      <Badge
                        key={career}
                        variant="outline"
                        className="bg-white/[0.03] border-white/[0.06]"
                      >
                        {career}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div
                  className={`space-y-6 transition-all duration-300 ${
                    isComparisonSwitching
                      ? "opacity-50 translate-y-1"
                      : "opacity-100 translate-y-0"
                  }`}
                >
                  <div className="overflow-x-auto rounded-xl glass">
                    <table className="w-full min-w-[780px] text-sm">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-left">
                        <tr>
                          <th className="px-4 py-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Career</th>
                          <th
                            className="px-4 py-4 font-medium text-muted-foreground tracking-wide text-xs uppercase"
                            title="Normalized salary metric (0-100)"
                          >
                            Salary
                          </th>
                          <th
                            className="px-4 py-4 font-medium text-muted-foreground tracking-wide text-xs uppercase"
                            title="Growth trend metric (0-100)"
                          >
                            Growth
                          </th>
                          <th
                            className="px-4 py-4 font-medium text-muted-foreground tracking-wide text-xs uppercase"
                            title="Market demand metric (0-100)"
                          >
                            Demand
                          </th>
                          <th className="px-4 py-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">
                            Learning Curve
                          </th>
                          <th
                            className="px-4 py-4 font-medium text-muted-foreground tracking-wide text-xs uppercase"
                            title="Weighted score using salary, demand and growth"
                          >
                            Career Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRowsWithScore.map((row) => (
                          <tr
                            key={row.career}
                            className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] last:border-0"
                          >
                            <td className="px-4 py-3 font-medium">
                              {row.career}
                            </td>
                            <td
                              className={`px-4 py-3 ${getMetricCellTone("salaryNormalized", row.salaryNormalized)}`}
                              title={`${row.salaryNormalized}/100`}
                            >
                              {row.salary} ({row.salaryNormalized})
                            </td>
                            <td
                              className={`px-4 py-3 ${getMetricCellTone("growthNormalized", row.growthNormalized)}`}
                              title={`${row.growthNormalized}/100`}
                            >
                              {row.growth} ({row.growthNormalized})
                            </td>
                            <td
                              className={`px-4 py-3 ${getMetricCellTone("demandNormalized", row.demandNormalized)}`}
                              title={`${row.demandNormalized}/100`}
                            >
                              {row.demand} ({row.demandNormalized})
                            </td>
                            <td
                              className={`px-4 py-3 ${getMetricCellTone("learningNormalized", row.learningNormalized)}`}
                              title={`${row.learningNormalized}/100`}
                            >
                              {row.learningCurve} ({row.learningNormalized})
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <span
                                  className={`text-sm ${getMetricCellTone("careerScore", row.careerScore)}`}
                                >
                                  {row.careerScore}/100
                                </span>
                                <Progress
                                  value={row.careerScore}
                                  className="h-2"
                                  indicatorClassName={
                                    row.careerScore >= 80
                                      ? "bg-emerald-500"
                                      : row.careerScore >= 65
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg font-display tracking-tight">
                        Comparison Snapshot
                      </CardTitle>
                      <CardDescription>
                        Animated bars for Salary, Demand, and Growth (0-100)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 rounded-xl border border-white/[0.06] bg-white/[0.01] p-3 sm:p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={comparisonChartData}
                          margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
                          barGap={8}
                          barCategoryGap="24%"
                        >
                          <defs>
                            <linearGradient
                              id="salaryGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#34d399"
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor="#059669"
                                stopOpacity={0.9}
                              />
                            </linearGradient>
                            <linearGradient
                              id="demandGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#60a5fa"
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor="#2563eb"
                                stopOpacity={0.9}
                              />
                            </linearGradient>
                            <linearGradient
                              id="growthGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#c084fc"
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor="#9333ea"
                                stopOpacity={0.9}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="hsl(var(--border))"
                            strokeOpacity={0.45}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="career"
                            tick={{
                              fontSize: 12,
                              fill: "hsl(var(--muted-foreground))",
                            }}
                            tickFormatter={formatCareerTick}
                            interval={0}
                            angle={-8}
                            height={52}
                            tickLine={false}
                            axisLine={{
                              stroke: "hsl(var(--border))",
                              strokeOpacity: 0.6,
                            }}
                          />
                          <YAxis
                            tick={{
                              fontSize: 12,
                              fill: "hsl(var(--muted-foreground))",
                            }}
                            ticks={[0, 20, 40, 60, 80, 100]}
                            domain={[0, 100]}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            content={<PremiumComparisonTooltip />}
                            cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                          />
                          <Legend
                            verticalAlign="top"
                            height={28}
                            wrapperStyle={{
                              fontSize: "12px",
                              color: "hsl(var(--muted-foreground))",
                            }}
                          />
                          <Bar
                            dataKey="Salary"
                            fill="url(#salaryGradient)"
                            radius={[10, 10, 0, 0]}
                            animationDuration={700}
                            maxBarSize={34}
                          />
                          <Bar
                            dataKey="Demand"
                            fill="url(#demandGradient)"
                            radius={[10, 10, 0, 0]}
                            animationDuration={900}
                            maxBarSize={34}
                          />
                          <Bar
                            dataKey="Growth"
                            fill="url(#growthGradient)"
                            radius={[10, 10, 0, 0]}
                            animationDuration={1100}
                            maxBarSize={34}
                          >
                            <LabelList
                              dataKey="Growth"
                              position="top"
                              fill="hsl(var(--muted-foreground))"
                              fontSize={11}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {bestComparisonCareer && (
                    <Card className="glass-strong border-emerald-500/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-base sm:text-lg font-display tracking-tight text-emerald-400">
                          Best Career for You
                        </CardTitle>
                        <CardDescription>
                          AI recommendation from weighted demand, growth, and
                          salary metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm relative z-10">
                        <p className="text-foreground/90 leading-relaxed">
                          Based on your comparison profile,{" "}
                          <span className="font-semibold text-emerald-400">
                            {bestComparisonCareer.career}
                          </span>{" "}
                          is the strongest fit with a score of{" "}
                          <span className="font-semibold text-emerald-400">
                            {bestComparisonCareer.careerScore}/100
                          </span>
                          .
                        </p>
                        <p className="text-muted-foreground">
                          It stands out due to higher salary trajectory and
                          strong market demand growth.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {comparisonRowsWithScore.map((row) => (
                      <Card
                        key={`pros-cons-${row.career}`}
                        className="glass group hover-lift"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-display tracking-tight">
                            {row.career}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <p className="mb-1 font-medium text-emerald-400">
                              Pros
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                              {row.pros.map((pro) => (
                                <li key={`${row.career}-pro-${pro}`}>
                                  + {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="mb-1 font-medium text-rose-400">
                              Cons
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                              {row.cons.map((con) => (
                                <li key={`${row.career}-con-${con}`}>
                                  - {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "risk" && (
              <section className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-xl font-display font-semibold tracking-tight">Risk Prediction</h2>
                    <p className="text-sm text-muted-foreground">
                      Understand long-term risk and get guided career safety
                      actions.
                    </p>
                  </div>

                  <div className="w-full sm:w-[280px]">
                    <Select
                      value={riskCareer}
                      onValueChange={handleRiskCareerChange}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                        <SelectValue placeholder="Select career" />
                      </SelectTrigger>
                      <SelectContent>
                        {riskCareers.map((career) => (
                          <SelectItem key={career} value={career}>
                            {career}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div
                  className={`space-y-6 transition-all duration-300 ${
                    isRiskSwitching
                      ? "opacity-45 translate-y-1"
                      : "opacity-100 translate-y-0"
                  }`}
                >
                  <div className="grid gap-5 lg:grid-cols-5">
                    <Card className="glass lg:col-span-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="text-base sm:text-lg font-display tracking-tight">
                            {selectedRisk.career}
                          </CardTitle>
                          <Badge
                            variant={getRiskBadgeVariant(selectedRisk.risk)}
                          >
                            {selectedRisk.risk}
                          </Badge>
                        </div>
                        <CardDescription>Visual risk indicator</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <RiskGauge
                          value={selectedRisk.riskScore}
                          level={selectedRisk.risk}
                        />
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-muted-foreground">
                          5-Year Outlook:{" "}
                          <span
                            className={`ml-1 rounded-md border px-2 py-1 text-xs font-medium ${getOutlookTone(selectedRisk.outlook)}`}
                          >
                            {selectedRisk.outlook}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass lg:col-span-3">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg font-display tracking-tight">
                          Detailed Risk Breakdown
                        </CardTitle>
                        <CardDescription>
                          Automation, demand, and skill relevance risk (0-100)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Automation Risk</span>
                            <span>{selectedRisk.automationRisk}%</span>
                          </div>
                          <Progress
                            value={selectedRisk.automationRisk}
                            indicatorClassName="bg-rose-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Market Demand Risk</span>
                            <span>{selectedRisk.marketDemandRisk}%</span>
                          </div>
                          <Progress
                            value={selectedRisk.marketDemandRisk}
                            indicatorClassName="bg-amber-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Skill Obsolescence Risk</span>
                            <span>{selectedRisk.skillObsolescenceRisk}%</span>
                          </div>
                          <Progress
                            value={selectedRisk.skillObsolescenceRisk}
                            indicatorClassName="bg-blue-500"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg font-display tracking-tight">
                          Why this risk?
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                        <p>{selectedRisk.reason}</p>
                        <p>{selectedRisk.suggestion}</p>
                      </CardContent>
                    </Card>

                    <Card className="glass relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-base sm:text-lg font-display tracking-tight">
                          AI Insight
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-foreground/90 leading-relaxed relative z-10">
                        {selectedRisk.aiInsight}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-border bg-card shadow-xs">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">
                        Smart Suggestions
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Reduce risk through targeted upskilling and adjacent
                        role options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Skills to learn
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedRisk.skillsToLearn ?? []).map((skill) => (
                            <Badge
                              key={`${selectedRisk.career}-skill-${skill}`}
                              variant="success"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Alternative careers
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedRisk.alternativeCareers ?? []).map(
                            (career) => (
                              <Badge
                                key={`${selectedRisk.career}-alt-${career}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {career}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}
          </div>
      </div>
    </div>
  );
}
