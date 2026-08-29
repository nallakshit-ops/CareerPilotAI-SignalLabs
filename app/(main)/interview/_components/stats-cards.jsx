import { Brain, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[0];
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average Score</CardTitle>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
            <Trophy className="h-3.5 w-3.5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{getAverageScore()}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all completed quizzes
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Questions Practiced
          </CardTitle>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
            <Brain className="h-3.5 w-3.5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{getTotalQuestions()}</div>
          <p className="text-xs text-muted-foreground mt-1">Total questions attempted</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Latest Score</CardTitle>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
            <Target className="h-3.5 w-3.5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {getLatestAssessment()?.quizScore.toFixed(1) || 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Most recent assessment</p>
        </CardContent>
      </Card>
    </div>
  );
}
