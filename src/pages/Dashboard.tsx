
import React, { useState } from "react";
import { useTask, Task } from "@/contexts/TaskContext";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import SmartTaskInput from "@/components/SmartTaskInput";
import ProductivityStats from "@/components/ProductivityStats";
import EnhancedAchievementSystem from "@/components/EnhancedAchievementSystem";
import VoiceTaskInput from "@/components/VoiceTaskInput";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import TaskOverview from "@/components/TaskOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { tasks, getTasksByFilter, updateTask, deleteTask } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const todayTasks = getTasksByFilter("today");
  const upcomingTasks = getTasksByFilter("upcoming");
  const completedTasks = getTasksByFilter("completed");

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleStatusChange = (id: string, status: Task["status"]) => {
    updateTask(id, { status });

    const statusMessages = {
      todo: "Task marked as To Do",
      "in-progress": "Task marked as In Progress",
      completed: "Task marked as Completed",
    };

    toast({
      title: statusMessages[status],
      description: "Task status updated successfully",
    });
  };

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setIsModalOpen(true);
  };

  const TaskSection = ({ title, tasks, icon: Icon, emptyMessage }: {
    title: string;
    tasks: Task[];
    icon: any;
    emptyMessage: string;
  }) => (
    <Card>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-2' : 'pb-4'}`}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <Badge variant="outline" className={isMobile ? 'text-xs' : ''}>
          {tasks.length}
        </Badge>
      </CardHeader>
      <CardContent className={isMobile ? "p-3 pt-0" : ""}>
        <div className={`space-y-3 ${isMobile ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
          {tasks.length > 0 ? (
            tasks.slice(0, isMobile ? 3 : 4).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-4">
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>{emptyMessage}</p>
            </div>
          )}
          {tasks.length > (isMobile ? 3 : 4) && (
            <p className={`text-center text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
              +{tasks.length - (isMobile ? 3 : 4)} more tasks
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className={`container mx-auto space-y-6 ${isMobile ? 'px-2 py-4' : 'px-4 py-6'}`}>
        {/* Header */}
        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h1 className={`font-bold tracking-tight flex items-center gap-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              <Target className={`text-primary ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              Dashboard
            </h1>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Manage your tasks and track your productivity
            </p>
          </div>
          <Button onClick={handleAddTask} className={`gap-1 ${isMobile ? 'text-sm' : ''}`}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Stats Section */}
        <ProductivityStats />

        {/* Main Content */}
        {isMobile ? (
          /* Mobile Layout - Single Column */
          <div className="space-y-4">
            <QuoteOfTheDay />
            <EnhancedAchievementSystem />
            <SmartTaskInput />
            <VoiceTaskInput />
            <TaskOverview />
            <TaskSection
              title="Today's Tasks"
              tasks={todayTasks}
              icon={Calendar}
              emptyMessage="No tasks scheduled for today"
            />
            <TaskSection
              title="Upcoming Tasks"
              tasks={upcomingTasks}
              icon={Clock}
              emptyMessage="No upcoming tasks"
            />
            <TaskSection
              title="Completed Tasks"
              tasks={completedTasks}
              icon={CheckCircle2}
              emptyMessage="No completed tasks yet"
            />
          </div>
        ) : (
          /* Desktop Layout - Three Columns */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <QuoteOfTheDay />
              <EnhancedAchievementSystem />
              <TaskSection
                title="Today's Tasks"
                tasks={todayTasks}
                icon={Calendar}
                emptyMessage="No tasks scheduled for today"
              />
            </div>

            {/* Center Column */}
            <div className="space-y-6">
              <SmartTaskInput />
              <VoiceTaskInput />
              <TaskOverview />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <TaskSection
                title="Upcoming Tasks"
                tasks={upcomingTasks}
                icon={Clock}
                emptyMessage="No upcoming tasks"
              />
              <TaskSection
                title="Completed Tasks"
                tasks={completedTasks}
                icon={CheckCircle2}
                emptyMessage="No completed tasks yet"
              />
            </div>
          </div>
        )}

        <TaskModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          task={selectedTask}
        />
      </div>
    </div>
  );
};

export default Dashboard;
