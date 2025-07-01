
import React, { useState } from "react";
import { useTask, Task } from "@/contexts/TaskContext";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import SmartTaskInput from "@/components/SmartTaskInput";
import ProductivityStats from "@/components/ProductivityStats";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  Filter,
  CalendarDays,
  CheckCircle2,
  CircleSlash,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { getTasksByFilter, updateTask, deleteTask } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [currentFilter, setCurrentFilter] = useState<
    "today" | "upcoming" | "completed" | "all"
  >("today");
  const { toast } = useToast();

  const filteredTasks = getTasksByFilter(currentFilter);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleStatusChange = (id: string, status: Task["status"]) => {
    updateTask(id, { status });

    // Show toast notification
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

  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <CircleSlash className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button onClick={handleAddTask} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Smart Dashboard
          </h1>
          <p className="text-muted-foreground">
            AI-powered task management and productivity insights
          </p>
        </div>
        <Button onClick={handleAddTask} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Productivity Stats */}
      <ProductivityStats />

      {/* Smart Task Input */}
      <SmartTaskInput />

      {/* Task Tabs */}
      <Tabs
        defaultValue="today"
        value={currentFilter}
        onValueChange={(value) =>
          setCurrentFilter(value as typeof currentFilter)
        }
        className="space-y-4"
      >
        <div className="flex justify-between">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="today" className="gap-1">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Today</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Done</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <EmptyState 
                title="No tasks for today"
                description="Add a new task or set due dates to see your daily tasks"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <EmptyState 
                title="No upcoming tasks"
                description="All caught up! Add a new task if needed."
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <EmptyState 
                title="No completed tasks"
                description="Complete some tasks to see them here"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <EmptyState 
                title="No tasks found"
                description="Add a new task to get started"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={selectedTask}
      />
    </div>
  );
};

export default Dashboard;
