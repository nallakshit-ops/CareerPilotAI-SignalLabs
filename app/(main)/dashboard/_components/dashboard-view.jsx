"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Send,
  PhoneCall,
  Award,
  Trophy,
  FileCheck,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardView = ({ insights, growthStats }) => {
  // Transform salary data for the chart
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-[hsl(var(--success))]";
      case "medium":
        return "bg-[hsl(var(--warning))]";
      case "low":
        return "bg-[hsl(var(--destructive))]";
      default:
        return "bg-muted";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-[hsl(var(--success))]" };
      case "neutral":
        return { icon: LineChart, color: "text-[hsl(var(--warning))]" };
      case "negative":
        return { icon: TrendingDown, color: "text-[hsl(var(--destructive))]" };
      default:
        return { icon: LineChart, color: "text-muted-foreground" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color;

  // Format dates using date-fns
  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true },
  );

  return (
    <div className="space-y-6">
      {/* Personal Growth & Application metrics */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Application & Readiness Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Applications
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {growthStats?.applicationsSent ?? 0}
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                <Send className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Shortlist Rate
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {growthStats?.shortlistRate ?? 0}%
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                <Award className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Success Rate
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {growthStats?.successRate ?? 0}%
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                <Trophy className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Invites
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {growthStats?.interviewsCount ?? 0}
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
                <PhoneCall className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs col-span-2 md:col-span-1">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Assessments
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {growthStats?.assessmentsCount ?? 0}
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                <FileCheck className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Industry & Market Outlook
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Market Outlook */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Market Outlook
              </CardTitle>
              <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-muted ${outlookColor}`}>
                <OutlookIcon className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {insights.marketOutlook}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Updated {nextUpdateDistance}
              </p>
            </CardContent>
          </Card>

          {/* Industry Growth */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Industry Growth
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {insights.growthRate.toFixed(1)}%
              </div>
              <Progress value={insights.growthRate} className="mt-2 h-1.5" />
            </CardContent>
          </Card>

          {/* Demand Level */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Demand Level
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
                <BriefcaseIcon className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {insights.demandLevel}
              </div>
              <div
                className={`h-1.5 w-full rounded-full mt-2 ${getDemandLevelColor(
                  insights.demandLevel,
                )}`}
              />
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Top Skills
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
                <Brain className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {insights.topSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs font-medium"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Salary Ranges Chart */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Salary Ranges by Role
          </CardTitle>
          <CardDescription className="text-xs">
            Displaying minimum, median, and maximum salaries (in thousands USD)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salaryData}
                margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}k`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-popover text-popover-foreground p-3 shadow-md border border-border">
                          <p className="font-semibold mb-1.5 text-xs">
                            {label}
                          </p>
                          <div className="space-y-1">
                            {payload.map((item) => (
                              <div
                                key={item.name}
                                className="flex items-center justify-between gap-6 text-xs"
                              >
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  {item.name}
                                </span>
                                <span className="font-semibold text-foreground">
                                  ${item.value}k
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="min"
                  fill="hsl(var(--muted-foreground) / 0.4)"
                  name="Min Salary"
                  radius={[3, 3, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="median"
                  fill="hsl(var(--primary))"
                  name="Median Salary"
                  radius={[3, 3, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="max"
                  fill="hsl(var(--accent))"
                  name="Max Salary"
                  radius={[3, 3, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Industry Trends & Recommended Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Key Industry Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Current market dynamics shaping technical requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insights.keyTrends.map((trend, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-2.5 text-xs text-muted-foreground leading-relaxed"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-foreground/90">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Recommended Skills
            </CardTitle>
            <CardDescription className="text-xs">High-demand skills to build for this role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="px-2.5 py-1 text-xs"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
