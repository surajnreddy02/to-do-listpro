
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  CheckCircle2,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TaskOverview = () => {
  const { getTasksByFilter } = useTask();
  const navigate = useNavigate();

  const todayTasks = getTasksByFilter("today");
  const upcomingTasks = getTasksByFilter("upcoming");
  const completedTasks = getTasksByFilter("completed");

  const overviewData = [
    {
      title: "Today's Tasks",
      count: todayTasks.length,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Tasks due today",
      onClick: () => navigate('/dashboard')
    },
    {
      title: "Upcoming",
      count: upcomingTasks.length,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "Future tasks",
      onClick: () => navigate('/calendar')
    },
    {
      title: "Completed",
      count: completedTasks.length,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Finished tasks",
      onClick: () => navigate('/analytics')
    }
  ];

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Task Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overviewData.map((item) => (
            <div
              key={item.title}
              className="group cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={item.onClick}
            >
              <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${item.bgColor}`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{item.count}</p>
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {todayTasks.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's Priority Tasks
            </h4>
            <div className="space-y-2">
              {todayTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <span className="text-sm font-medium truncate">{task.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.status}
                  </Badge>
                </div>
              ))}
              {todayTasks.length > 3 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="w-full">
                  View {todayTasks.length - 3} more tasks
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskOverview;
