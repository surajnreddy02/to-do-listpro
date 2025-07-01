import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Define task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  dueDate: string | null;
  createdAt: string;
  userId: string;
  categoryId?: string;
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  aiPriorityScore?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
}

// Define task context interface
interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  subtasks: { [taskId: string]: Subtask[] };
  addTask: (task: Omit<Task, "id" | "createdAt" | "userId">) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addCategory: (category: Omit<Category, "id" | "userId">) => void;
  updateCategory: (id: string, categoryData: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  updateSubtask: (id: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (id: string) => void;
  getTasksByFilter: (filter: "today" | "upcoming" | "completed" | "all") => Task[];
  isLoading: boolean;
}

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subtasks, setSubtasks] = useState<{ [taskId: string]: Subtask[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated, isDemoUser } = useAuth();

  // Load demo data for demo users - NO DUMMY DATA
  const loadDemoData = () => {
    const demoTasks = JSON.parse(localStorage.getItem('demoTasks') || '[]');
    const demoCategories = [
      { id: 'demo-cat-1', name: 'Work', color: '#3B82F6', userId: 'demo-user-id' },
      { id: 'demo-cat-2', name: 'Personal', color: '#10B981', userId: 'demo-user-id' },
      { id: 'demo-cat-3', name: 'Learning', color: '#8B5CF6', userId: 'demo-user-id' }
    ];

    setTasks(demoTasks.map((task: any) => ({
      ...task,
      userId: 'demo-user-id'
    })));
    setCategories(demoCategories);
    setIsLoading(false);
  };

  // Function to transform Supabase task format to our app format
  const transformTask = (task: any): Task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    priority: task.priority as "low" | "medium" | "high",
    status: task.status as "todo" | "in-progress" | "completed",
    dueDate: task.due_date,
    createdAt: task.created_at,
    userId: task.user_id,
    categoryId: task.category_id,
    tags: task.tags || [],
    estimatedDuration: task.estimated_duration,
    actualDuration: task.actual_duration,
    aiPriorityScore: task.ai_priority_score,
  });

  // Load tasks from Supabase when authenticated
  useEffect(() => {
    if (isDemoUser) {
      loadDemoData();
      return;
    }

    const fetchTasks = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoriesError) throw categoriesError;

        // Fetch subtasks
        const { data: subtasksData, error: subtasksError } = await supabase
          .from("subtasks")
          .select("*")
          .order("created_at");

        if (subtasksError) throw subtasksError;

        if (tasksData) {
          setTasks(tasksData.map(transformTask));
        }
        
        if (categoriesData) {
          setCategories(categoriesData.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            userId: cat.user_id
          })));
        }

        if (subtasksData) {
          const groupedSubtasks: { [taskId: string]: Subtask[] } = {};
          subtasksData.forEach(subtask => {
            if (!groupedSubtasks[subtask.task_id]) {
              groupedSubtasks[subtask.task_id] = [];
            }
            groupedSubtasks[subtask.task_id].push({
              id: subtask.id,
              taskId: subtask.task_id,
              title: subtask.title,
              completed: subtask.completed || false
            });
          });
          setSubtasks(groupedSubtasks);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          description: "There was an error loading your data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();

    if (!isDemoUser) {
      // Set up realtime subscription for tasks
      const channel = supabase
        .channel("public:tasks")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks" },
          (payload) => {
            console.log('Real-time task update:', payload);
            fetchTasks(); // Refresh all data when changes occur
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, user, isDemoUser, toast]);

  // Demo task operations
  const updateDemoTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('demoTasks', JSON.stringify(updatedTasks));
  };

  // Add a new task - ENHANCED FOR REAL-TIME SYNC
  const addTask = async (task: Omit<Task, "id" | "createdAt" | "userId">) => {
    if (isDemoUser) {
      const newTask: Task = {
        ...task,
        id: `demo-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userId: 'demo-user-id'
      };
      const updatedTasks = [newTask, ...tasks];
      updateDemoTasks(updatedTasks);
      toast({
        title: "Task added",
        description: "Your task has been added successfully",
      });
      return;
    }

    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add tasks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.from("tasks").insert({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.dueDate,
        user_id: user.id,
        category_id: task.categoryId,
        tags: task.tags,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        ai_priority_score: task.aiPriorityScore,
      }).select().single();

      if (error) throw error;

      if (data) {
        const newTask = transformTask(data);
        setTasks((prev) => [newTask, ...prev]);
        console.log('Task added to local state:', newTask);
        toast({
          title: "Task added",
          description: "Your task has been added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error adding task",
        description: "There was an error adding your task.",
        variant: "destructive",
      });
    }
  };

  // Update an existing task - ENHANCED FOR REAL-TIME SYNC
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    if (isDemoUser) {
      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, ...taskData } : task
      );
      updateDemoTasks(updatedTasks);
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update tasks.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert from our app's format to Supabase format
      const supabaseTaskData: any = {};
      if (taskData.title !== undefined) supabaseTaskData.title = taskData.title;
      if (taskData.description !== undefined) supabaseTaskData.description = taskData.description;
      if (taskData.priority !== undefined) supabaseTaskData.priority = taskData.priority;
      if (taskData.status !== undefined) supabaseTaskData.status = taskData.status;
      if (taskData.dueDate !== undefined) supabaseTaskData.due_date = taskData.dueDate;
      if (taskData.categoryId !== undefined) supabaseTaskData.category_id = taskData.categoryId;
      if (taskData.tags !== undefined) supabaseTaskData.tags = taskData.tags;
      if (taskData.estimatedDuration !== undefined) supabaseTaskData.estimated_duration = taskData.estimatedDuration;
      if (taskData.actualDuration !== undefined) supabaseTaskData.actual_duration = taskData.actualDuration;
      if (taskData.aiPriorityScore !== undefined) supabaseTaskData.ai_priority_score = taskData.aiPriorityScore;

      const { error } = await supabase
        .from("tasks")
        .update(supabaseTaskData)
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately for better UX
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, ...taskData } : task
        )
      );
      
      console.log('Task updated in local state:', { id, ...taskData });
      
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error updating task",
        description: "There was an error updating your task.",
        variant: "destructive",
      });
    }
  };

  // Delete a task - ENHANCED FOR REAL-TIME SYNC
  const deleteTask = async (id: string) => {
    if (isDemoUser) {
      const updatedTasks = tasks.filter(task => task.id !== id);
      updateDemoTasks(updatedTasks);
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete tasks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      // Update local state immediately
      setTasks((prev) => prev.filter((task) => task.id !== id));
      
      console.log('Task deleted from local state:', id);
      
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error deleting task",
        description: "There was an error deleting your task.",
        variant: "destructive",
      });
    }
  };

  // Category operations
  const addCategory = async (category: Omit<Category, "id" | "userId">) => {
    if (isDemoUser) {
      const newCategory: Category = {
        ...category,
        id: `demo-cat-${Date.now()}`,
        userId: 'demo-user-id'
      };
      setCategories(prev => [...prev, newCategory]);
      return;
    }

    if (!isAuthenticated || !user) return;

    try {
      const { data, error } = await supabase.from("categories").insert({
        name: category.name,
        color: category.color,
        user_id: user.id,
      }).select().single();

      if (error) throw error;

      if (data) {
        setCategories(prev => [...prev, {
          id: data.id,
          name: data.name,
          color: data.color,
          userId: data.user_id
        }]);
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    if (isDemoUser) {
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...categoryData } : cat
      ));
      return;
    }

    if (!isAuthenticated) return;

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: categoryData.name,
          color: categoryData.color,
        })
        .eq("id", id);

      if (error) throw error;

      setCategories(prev => prev.map(cat =>
        cat.id === id ? { ...cat, ...categoryData } : cat
      ));
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (isDemoUser) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return;
    }

    if (!isAuthenticated) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Subtask operations
  const addSubtask = async (taskId: string, title: string) => {
    if (isDemoUser) {
      const newSubtask: Subtask = {
        id: `demo-sub-${Date.now()}`,
        taskId,
        title,
        completed: false
      };
      setSubtasks(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), newSubtask]
      }));
      return;
    }

    if (!isAuthenticated) return;

    try {
      const { data, error } = await supabase.from("subtasks").insert({
        task_id: taskId,
        title,
        completed: false,
      }).select().single();

      if (error) throw error;

      if (data) {
        const newSubtask: Subtask = {
          id: data.id,
          taskId: data.task_id,
          title: data.title,
          completed: data.completed || false
        };
        
        setSubtasks(prev => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), newSubtask]
        }));
      }
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  };

  const updateSubtask = async (id: string, updates: Partial<Subtask>) => {
    if (isDemoUser) {
      setSubtasks(prev => {
        const newSubtasks = { ...prev };
        Object.keys(newSubtasks).forEach(taskId => {
          newSubtasks[taskId] = newSubtasks[taskId].map(sub =>
            sub.id === id ? { ...sub, ...updates } : sub
          );
        });
        return newSubtasks;
      });
      return;
    }

    if (!isAuthenticated) return;

    try {
      const { error } = await supabase
        .from("subtasks")
        .update({
          title: updates.title,
          completed: updates.completed,
        })
        .eq("id", id);

      if (error) throw error;

      setSubtasks(prev => {
        const newSubtasks = { ...prev };
        Object.keys(newSubtasks).forEach(taskId => {
          newSubtasks[taskId] = newSubtasks[taskId].map(sub =>
            sub.id === id ? { ...sub, ...updates } : sub
          );
        });
        return newSubtasks;
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const deleteSubtask = async (id: string) => {
    if (isDemoUser) {
      setSubtasks(prev => {
        const newSubtasks = { ...prev };
        Object.keys(newSubtasks).forEach(taskId => {
          newSubtasks[taskId] = newSubtasks[taskId].filter(sub => sub.id !== id);
        });
        return newSubtasks;
      });
      return;
    }

    if (!isAuthenticated) return;

    try {
      const { error } = await supabase.from("subtasks").delete().eq("id", id);
      if (error) throw error;

      setSubtasks(prev => {
        const newSubtasks = { ...prev };
        Object.keys(newSubtasks).forEach(taskId => {
          newSubtasks[taskId] = newSubtasks[taskId].filter(sub => sub.id !== id);
        });
        return newSubtasks;
      });
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  // Get tasks filtered by criteria - ENHANCED FILTERING
  const getTasksByFilter = (filter: "today" | "upcoming" | "completed" | "all") => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case "today":
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime() && task.status !== "completed";
        });
      case "upcoming":
        return tasks.filter((task) => {
          if (!task.dueDate) return task.status !== "completed"; // Include tasks without due dates
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() > today.getTime() && task.status !== "completed";
        });
      case "completed":
        return tasks.filter((task) => task.status === "completed");
      case "all":
      default:
        return tasks;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        subtasks,
        addTask,
        updateTask,
        deleteTask,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        getTasksByFilter,
        isLoading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
