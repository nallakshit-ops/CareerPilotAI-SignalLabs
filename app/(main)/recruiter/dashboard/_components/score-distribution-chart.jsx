"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "hsl(142, 71%, 45%)", // Excellent (90+) - Green
  "hsl(217, 92%, 65%)", // Good (80-89) - Blue
  "hsl(38, 92%, 50%)",  // Fair (70-79) - Amber
  "hsl(0, 84%, 60%)",   // Poor (<70) - Red
];

const ScoreDistributionChart = ({ stats }) => {
  const hasData = stats?.scoreDistribution && Object.values(stats.scoreDistribution).some(val => val > 0);

  const data = [
    { name: "Excellent (90+)", value: hasData ? (stats.scoreDistribution.excellent || 0) : 10 },
    { name: "Good (80-89)", value: hasData ? (stats.scoreDistribution.good || 0) : 25 },
    { name: "Fair (70-79)", value: hasData ? (stats.scoreDistribution.fair || 0) : 15 },
    { name: "Poor (<70)", value: hasData ? (stats.scoreDistribution.poor || 0) : 8 },
  ];

  return (
    <div className="h-[350px] w-full flex flex-col justify-between">
      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-strong rounded-xl p-3 shadow-2xl border border-white/[0.08]">
                      <p className="font-semibold text-foreground text-sm">
                        {payload[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Candidates: <span className="font-semibold text-foreground">{payload[0].value}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value, entry) => (
                <span className="text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors mr-2">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreDistributionChart;
