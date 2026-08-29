"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Target, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardView from "./dashboard-view";
import SkillGapView from "./skill-gap-view";
import SignalsView from "@/components/signals/signals-view";

const DashboardTabs = ({ insights, growthStats, signalData }) => {
    const activeSignalCount = signalData?.summary?.activeSignals ?? 0;

    return (
        <div>
            <Tabs defaultValue="signals" className="w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            Career Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Proactive career signals, market analytics, and AI skill gap intelligence.
                        </p>
                    </div>
                    <TabsList className="h-9">
                        <TabsTrigger value="signals" className="gap-2 text-xs md:text-sm">
                            <Brain className="h-4 w-4 text-accent" />
                            Career Signals
                            {activeSignalCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 px-1.5 py-0 text-[10px] bg-accent/20 text-accent font-semibold"
                                >
                                    {activeSignalCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="gap-2 text-xs md:text-sm">
                            <BarChart3 className="h-4 w-4" />
                            Market Insights
                        </TabsTrigger>
                        <TabsTrigger value="skill-gap" className="gap-2 text-xs md:text-sm">
                            <Target className="h-4 w-4" />
                            Skill Gap Analysis
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="signals">
                    <SignalsView initialData={signalData} />
                </TabsContent>

                <TabsContent value="insights">
                    <DashboardView insights={insights} growthStats={growthStats} />
                </TabsContent>

                <TabsContent value="skill-gap">
                    <SkillGapView />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DashboardTabs;

