"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Quizzes
              </CardTitle>
              <CardDescription className="text-xs">
                Review your past quiz assessments and feedback
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => router.push("/interview/mock")}>
              Start New Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {assessments?.map((assessment, i) => (
              <div
                key={assessment.id}
                className="cursor-pointer rounded-lg border border-border bg-muted/20 p-3.5 hover:bg-muted/40 transition-colors"
                onClick={() => setSelectedQuiz(assessment)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">
                    Quiz {i + 1}
                  </span>
                  <span className="text-xs font-semibold text-emerald-500">
                    Score: {assessment.quizScore.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {format(
                      new Date(assessment.createdAt),
                      "MMM dd, yyyy • HH:mm"
                    )}
                  </span>
                </div>
                {assessment.improvementTip && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {assessment.improvementTip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
