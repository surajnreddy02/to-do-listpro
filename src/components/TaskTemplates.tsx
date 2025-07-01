import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Trash2, Sparkles, Brain, Calendar, Clock } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { geminiService } from "@/services/geminiService";
import { cn } from "@/lib/utils";

interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  categoryId?: string;
  schedulingContext?: string;
  explanation?: string;
}

const TaskTemplates = () => {
  const { categories, addTask } = useTask();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState<TaskTemplate[]>([
    {
      id: 'template-1',
      name: 'Daily Standup',
      title: 'Prepare for daily standup meeting',
      description: 'Review yesterday\'s work and plan today\'s tasks',
      priority: 'medium',
      schedulingContext: 'daily'
    },
    {
      id: 'template-2',
      name: 'Code Review',
      title: 'Review pull requests',
      description: 'Check and approve pending pull requests',
      priority: 'high',
      schedulingContext: 'today'
    },
    {
      id: 'template-3',
      name: 'Weekly Report',
      title: 'Prepare weekly progress report',
      description: 'Compile achievements and goals for the week',
      priority: 'medium',
      schedulingContext: 'weekly'
    },
    {
      id: 'template-4',
      name: 'Client Follow-up',
      title: 'Follow up with client on project status',
      description: 'Send update email and schedule next meeting',
      priority: 'high',
      schedulingContext: 'today'
    },
    {
      id: 'template-5',
      name: 'Team Meeting',
      title: 'Attend team coordination meeting',
      description: 'Discuss project updates and blockers',
      priority: 'medium',
      schedulingContext: 'specific'
    },
    {
      id: 'template-6',
      name: 'Documentation',
      title: 'Update project documentation',
      description: 'Add new features and update API docs',
      priority: 'low',
      schedulingContext: 'flexible'
    }
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    categoryId: string;
  }>({
    name: '',
    title: '',
    description: '',
    priority: 'medium',
    categoryId: ''
  });

  const calculateTaskDate = (schedulingInfo: any): Date | null => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    switch (schedulingInfo.suggestedDay) {
      case 'today':
        return now;
      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return tomorrow;
      case 'weekend':
        // Find next Saturday
        const daysUntilSaturday = (6 - currentDay + 7) % 7;
        const nextSaturday = new Date(now);
        nextSaturday.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
        return nextSaturday;
      case 'monday':
        const daysUntilMonday = (1 - currentDay + 7) % 7;
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
        return nextMonday;
      case 'tuesday':
        const daysUntilTuesday = (2 - currentDay + 7) % 7;
        const nextTuesday = new Date(now);
        nextTuesday.setDate(now.getDate() + (daysUntilTuesday === 0 ? 7 : daysUntilTuesday));
        return nextTuesday;
      case 'wednesday':
        const daysUntilWednesday = (3 - currentDay + 7) % 7;
        const nextWednesday = new Date(now);
        nextWednesday.setDate(now.getDate() + (daysUntilWednesday === 0 ? 7 : daysUntilWednesday));
        return nextWednesday;
      case 'thursday':
        const daysUntilThursday = (4 - currentDay + 7) % 7;
        const nextThursday = new Date(now);
        nextThursday.setDate(now.getDate() + (daysUntilThursday === 0 ? 7 : daysUntilThursday));
        return nextThursday;
      case 'friday':
        const daysUntilFriday = (5 - currentDay + 7) % 7;
        const nextFriday = new Date(now);
        nextFriday.setDate(now.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
        return nextFriday;
      case 'next_week':
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        return nextWeek;
      default:
        return null;
    }
  };

  const createTaskFromTemplate = async (template: TaskTemplate) => {
    try {
      const schedulingInfo = await geminiService.analyzeTemplateScheduling(template);
      const taskDate = calculateTaskDate(schedulingInfo);
      
      // Set appropriate time based on timeOfDay
      if (taskDate && schedulingInfo.timeOfDay) {
        switch (schedulingInfo.timeOfDay) {
          case 'morning':
            taskDate.setHours(9, 0, 0, 0);
            break;
          case 'afternoon':
            taskDate.setHours(14, 0, 0, 0);
            break;
          case 'evening':
            taskDate.setHours(18, 0, 0, 0);
            break;
          default:
            taskDate.setHours(12, 0, 0, 0);
        }
      }

      await addTask({
        title: template.title,
        description: template.description,
        priority: template.priority,
        status: 'todo',
        dueDate: taskDate ? taskDate.toISOString() : null,
        categoryId: template.categoryId
      });

      toast({
        title: "✅ Task created from template",
        description: taskDate 
          ? `"${template.title}" scheduled for ${taskDate.toLocaleDateString()} • ${schedulingInfo.reasoning}`
          : `"${template.title}" has been added to your tasks`,
      });
    } catch (error) {
      // Fallback to simple task creation
      await addTask({
        title: template.title,
        description: template.description,
        priority: template.priority,
        status: 'todo',
        dueDate: null,
        categoryId: template.categoryId
      });

      toast({
        title: "Task created from template",
        description: `"${template.title}" has been added to your tasks`,
      });
    }
  };

  const generateAITemplate = async () => {
    if (!aiInput.trim()) return;
    
    setIsGenerating(true);
    try {
      const aiTemplate = await geminiService.generateTaskTemplate(aiInput);
      
      const template: TaskTemplate = {
        id: `template-${Date.now()}`,
        name: aiTemplate.name || 'AI Generated',
        title: aiTemplate.title || aiInput,
        description: aiTemplate.description || aiInput,
        priority: aiTemplate.priority || 'medium',
        schedulingContext: aiTemplate.schedulingContext,
        explanation: aiTemplate.explanation
      };

      setTemplates(prev => [...prev, template]);
      setAiInput('');

      toast({
        title: "🤖 AI Template created",
        description: `"${template.name}" template generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error generating template",
        description: "Please try again with a different description",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.title) return;

    const template: TaskTemplate = {
      id: `template-${Date.now()}`,
      ...newTemplate
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      title: '',
      description: '',
      priority: 'medium',
      categoryId: ''
    });
    setIsCreating(false);

    toast({
      title: "Template created",
      description: "New task template has been saved",
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template deleted",
      description: "Task template has been removed",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Template Generator */}
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Template Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe what you need and AI will create a smart template for you
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="e.g., 'Plan a weekend trip', 'Prepare for client presentation', 'Daily morning routine'..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button 
              onClick={generateAITemplate}
              disabled={!aiInput.trim() || isGenerating}
              className="gap-2"
            >
              <Brain className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Template'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Available Templates
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              {isMobile ? "Manual" : "Create Manual"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-4 pt-0" : ""}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-base truncate">{template.name}</h4>
                      <Badge className={cn("text-xs", getPriorityColor(template.priority))}>
                        {template.priority}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm mb-2 text-foreground/90 leading-relaxed">{template.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{template.description}</p>
                    {template.explanation && (
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3 text-primary" />
                        <p className="text-xs text-primary">{template.explanation}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => createTaskFromTemplate(template)}
                      className="gap-1 min-w-fit"
                    >
                      <Calendar className="w-3 h-3" />
                      Use
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {isCreating && (
              <div className="p-4 border-2 border-dashed rounded-lg space-y-3 bg-muted/30 md:col-span-2 lg:col-span-1 xl:col-span-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Template
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Template name (e.g., 'Weekly Report')"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Task title"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <Textarea
                  placeholder="Task description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="text-sm min-h-[60px] resize-none"
                />
                <div className="flex gap-2">
                  <Select
                    value={newTemplate.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewTemplate(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={newTemplate.categoryId}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate} size="sm">
                    Create Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewTemplate({
                        name: '',
                        title: '',
                        description: '',
                        priority: 'medium',
                        categoryId: ''
                      });
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTemplates;