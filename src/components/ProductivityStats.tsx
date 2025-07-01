
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  Sparkles,
  Loader2
} from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { geminiService } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

const ProductivityStats = () => {
  const { tasks } = useTask();
  const { toast } = useToast();
  const [aiInsights, setAiInsights] = useState<string>("");
  const [nextTaskSuggestion, setNextTaskSuggestion] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate productivity streak
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return date.toDateString();
  });

  const completedInLast7Days = tasks.filter(task => {
    if (task.status !== 'completed') return false;
    const taskDate = new Date(task.createdAt).toDateString();
    return last7Days.includes(taskDate);
  }).length;

  // High priority tasks
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

  // Average estimated duration
  const tasksWithDuration = tasks.filter(t => t.estimatedDuration);
  const avgDuration = tasksWithDuration.length > 0 
    ? Math.round(tasksWithDuration.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0) / tasksWithDuration.length)
    : 0;

  const generateAIInsights = async () => {
    if (tasks.length === 0) return;

    setIsLoadingInsights(true);
    try {
      const [insights, nextTask] = await Promise.all([
        geminiService.generateProductivityInsights(tasks, completedTasks, totalTasks),
        geminiService.suggestNextTask(tasks)
      ]);

      setAiInsights(insights);
      setNextTaskSuggestion(nextTask);
    } catch (error) {
      toast({
        title: "AI Insights Error",
        description: "Could not generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0 && !aiInsights) {
      generateAIInsights();
    }
  }, [tasks.length]);

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 dark:text-green-400";
    if (rate >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              {todoTasks} Todo
            </Badge>
            <Badge variant="outline" className="text-xs">
              {inProgressTasks} In Progress
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getCompletionRateColor(completionRate)}`}>
            {completionRate}%
          </div>
          <p className="text-xs text-muted-foreground">
            {completedTasks} of {totalTasks} completed
          </p>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedInLast7Days}</div>
          <p className="text-xs text-muted-foreground">
            Tasks completed
          </p>
        </CardContent>
      </Card>

      {/* High Priority */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {highPriorityTasks}
          </div>
          <p className="text-xs text-muted-foreground">
            Pending urgent tasks
          </p>
        </CardContent>
      </Card>

      {/* AI Insights Card */}
      {aiInsights && (
        <Card className="md:col-span-2 lg:col-span-4 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{aiInsights}</p>
              </div>
              
              {nextTaskSuggestion && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">🎯 Recommended Next Task</h4>
                  <p className="text-sm leading-relaxed">{nextTaskSuggestion}</p>
                </div>
              )}

              <Button 
                onClick={generateAIInsights} 
                disabled={isLoadingInsights}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                {isLoadingInsights ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isLoadingInsights ? "Generating..." : "Refresh AI Insights"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Average Duration */}
      {avgDuration > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Task Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration}min</div>
            <p className="text-xs text-muted-foreground">
              Based on {tasksWithDuration.length} estimated tasks
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductivityStats;
