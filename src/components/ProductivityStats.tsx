
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle2, 
  BarChart3
} from "lucide-react";
import { useTask } from "@/contexts/TaskContext";

const ProductivityStats = () => {
  const { tasks } = useTask();

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

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 dark:text-green-400";
    if (rate >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Show empty state if no tasks
  if (totalTasks === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <BarChart3 className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">No Statistics Yet</p>
          <p className="text-sm text-muted-foreground">
            Add some tasks to see your productivity stats
          </p>
        </CardContent>
      </Card>
    );
  }

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
