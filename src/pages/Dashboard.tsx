
import React, { useState } from "react";
import { useTask, Task } from "@/contexts/TaskContext";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import SmartTaskInput from "@/components/SmartTaskInput";
import ProductivityStats from "@/components/ProductivityStats";
import AchievementSystem from "@/components/AchievementSystem";
import AdvancedTaskFilters from "@/components/AdvancedTaskFilters";
import VoiceTaskInput from "@/components/VoiceTaskInput";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import TaskOverview from "@/components/TaskOverview";
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
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { getTasksByFilter, updateTask, deleteTask } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [currentFilter, setCurrentFilter] = useState<
    "today" | "upcoming" | "completed" | "all"
  >("today");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { toast } = useToast();

  const baseTasks = getTasksByFilter(currentFilter);
  const displayTasks = showAdvancedFilters ? filteredTasks : baseTasks;

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="w-8 h-8 text-primary" />
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your tasks and track your productivity
            </p>
          </div>
          <Button onClick={handleAddTask} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Stats Section */}
        <ProductivityStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <QuoteOfTheDay />
            <AchievementSystem />
          </div>

          {/* Center Column */}
          <div className="space-y-6">
            {/* Task Input Methods */}
            <div className="space-y-4">
              <SmartTaskInput />
              <VoiceTaskInput />
            </div>

            {/* Task Overview */}
            <TaskOverview />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Advanced Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              {showAdvancedFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAdvancedFilters(false);
                    setFilteredTasks([]);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {showAdvancedFilters && (
              <AdvancedTaskFilters onFiltersChange={setFilteredTasks} />
            )}

            {/* Task Tabs */}
            <Tabs
              defaultValue="today"
              value={currentFilter}
              onValueChange={(value) => {
                setCurrentFilter(value as typeof currentFilter);
                if (showAdvancedFilters) {
                  setShowAdvancedFilters(false);
                  setFilteredTasks([]);
                }
              }}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="today" className="gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Today</span>
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Soon</span>
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

              <TabsContent value="today" className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {displayTasks.length > 0 ? (
                    displayTasks.map((task) => (
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
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {displayTasks.length > 0 ? (
                    displayTasks.map((task) => (
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
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {displayTasks.length > 0 ? (
                    displayTasks.map((task) => (
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
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {displayTasks.length > 0 ? (
                    displayTasks.map((task) => (
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
          </div>
        </div>

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
