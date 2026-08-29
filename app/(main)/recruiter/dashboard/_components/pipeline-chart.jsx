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
  Cell,
} from "recharts";

const COLORS = [
  "hsl(217, 92%, 65%)",    // Applied - Blue
  "hsl(199, 89%, 48%)",    // Under Review - Light Blue
  "hsl(250, 89%, 67%)",    // Shortlisted - Purple
  "hsl(280, 89%, 65%)",    // Interview Invited - Magenta
  "hsl(38, 92%, 50%)",     // Human Round Scheduled - Amber
  "hsl(142, 71%, 45%)",    // Selected - Green
  "hsl(0, 84%, 60%)",      // Rejected - Red
];

const PipelineChart = ({ stats }) => {
  // If stats.statusBreakdown is completely empty (no candidates have applied yet), show placeholder values
  const hasData = stats?.statusBreakdown && Object.values(stats.statusBreakdown).some(val => val > 0);

  const pipelineData = [
    { status: "Applied", count: hasData ? (stats.statusBreakdown.applied || 0) : 15 },
    { status: "Under Review", count: hasData ? (stats.statusBreakdown.under_review || 0) : 10 },
    { status: "Shortlisted", count: hasData ? (stats.statusBreakdown.shortlisted || 0) : 8 },
    { status: "Invited", count: hasData ? ((stats.statusBreakdown.interview_invited || 0) + (stats.statusBreakdown.interview_accepted || 0) + (stats.statusBreakdown.interview_completed || 0)) : 6 },
    { status: "Scheduled", count: hasData ? (stats.statusBreakdown.human_round_scheduled || 0) : 4 },
    { status: "Selected", count: hasData ? (stats.statusBreakdown.selected || 0) : 3 },
    { status: "Rejected", count: hasData ? (stats.statusBreakdown.rejected || 0) : 5 },
  ];

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={pipelineData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="hsl(var(--border))"
            opacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="status"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            dx={-10}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "hsla(var(--primary) / 0.04)" }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glass-strong rounded-xl p-4 shadow-2xl border border-white/[0.08]">
                    <p className="font-semibold text-foreground mb-1 text-sm tracking-tight">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      <span className="text-foreground">
                        {payload[0].value}
                      </span>{" "}
                      candidates
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
            {pipelineData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PipelineChart;
