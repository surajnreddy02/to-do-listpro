
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, FileText, Trash2, CalendarIcon, Clock } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  categoryId?: string;
}

const TaskTemplates = () => {
  const { categories, addTask } = useTask();
  const isMobile = useIsMobile();
  const [templates, setTemplates] = useState<TaskTemplate[]>([
    {
      id: 'template-1',
      name: 'Daily Standup',
      title: 'Prepare for daily standup meeting',
      description: 'Review yesterday\'s work and plan today\'s tasks',
      priority: 'medium'
    },
    {
      id: 'template-2',
      name: 'Code Review',
      title: 'Review pull requests',
      description: 'Check and approve pending pull requests',
      priority: 'high'
    },
    {
      id: 'template-3',
      name: 'Weekly Report',
      title: 'Prepare weekly progress report',
      description: 'Compile achievements and goals for the week',
      priority: 'medium'
    },
    {
      id: 'template-4',
      name: 'Client Follow-up',
      title: 'Follow up with client on project status',
      description: 'Send update email and schedule next meeting',
      priority: 'high'
    },
    {
      id: 'template-5',
      name: 'Team Meeting',
      title: 'Attend team coordination meeting',
      description: 'Discuss project updates and blockers',
      priority: 'medium'
    },
    {
      id: 'template-6',
      name: 'Documentation',
      title: 'Update project documentation',
      description: 'Add new features and update API docs',
      priority: 'low'
    }
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
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
  const { toast } = useToast();

  const createTaskFromTemplate = async (template: TaskTemplate) => {
    let taskDate: Date | null = null;
    
    if (selectedDate) {
      taskDate = new Date(selectedDate);
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        taskDate.setHours(hours, minutes);
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
      title: "Task created from template",
      description: taskDate 
        ? `"${template.title}" scheduled for ${taskDate.toLocaleDateString()}`
        : `"${template.title}" has been added to your tasks`,
    });

    // Reset selections
    setSelectedDate(undefined);
    setSelectedTime("");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className={`font-bold tracking-tight flex items-center gap-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            <FileText className={`text-primary ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            Task Templates
          </h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Create and manage reusable task templates for faster task creation
          </p>
        </div>
      </div>

      {/* Date and Time Selection */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
        <CardContent className={isMobile ? "p-4" : "p-6"}>
          <h3 className={`font-semibold mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>Schedule Template Tasks</h3>
          <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row items-center'}`}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    `justify-start text-left font-normal ${isMobile ? 'w-full' : 'w-[240px]'}`,
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={isMobile ? 'flex-1' : 'w-32'}
              />
            </div>

            {(selectedDate || selectedTime) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(undefined);
                  setSelectedTime("");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              {isMobile ? "Create" : "Create Template"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-4 pt-0" : ""}>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{template.name}</h4>
                      <Badge
                        variant={template.priority === 'high' ? 'destructive' : 
                                 template.priority === 'medium' ? 'default' : 'secondary'}
                        className={isMobile ? 'text-xs' : ''}
                      >
                        {template.priority}
                      </Badge>
                    </div>
                    <p className={`font-medium mb-1 ${isMobile ? 'text-sm' : ''}`}>{template.title}</p>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{template.description}</p>
                  </div>
                  <div className={`flex gap-1 ${isMobile ? 'flex-col' : ''}`}>
                    <Button
                      size="sm"
                      onClick={() => createTaskFromTemplate(template)}
                      className={isMobile ? 'text-xs px-2' : ''}
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className={isMobile ? 'text-xs px-2' : ''}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {isCreating && (
              <div className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800 col-span-full">
                <Input
                  placeholder="Template name (e.g., 'Weekly Report')"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className={isMobile ? 'text-sm' : ''}
                />
                <Input
                  placeholder="Task title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                  className={isMobile ? 'text-sm' : ''}
                />
                <Textarea
                  placeholder="Task description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className={isMobile ? 'text-sm min-h-[60px]' : ''}
                />
                <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                  <Select
                    value={newTemplate.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewTemplate(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className={isMobile ? 'w-full' : 'w-32'}>
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
                    <SelectTrigger className={isMobile ? 'w-full' : 'flex-1'}>
                      <SelectValue placeholder="Select category (optional)" />
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
                <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                  <Button onClick={handleCreateTemplate} size={isMobile ? 'sm' : 'default'}>
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
                    size={isMobile ? 'sm' : 'default'}
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
