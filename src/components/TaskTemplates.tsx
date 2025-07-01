
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Template, Trash2 } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { useToast } from "@/hooks/use-toast";

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
    }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    title: '',
    description: '',
    priority: 'medium' as const,
    categoryId: ''
  });
  const { toast } = useToast();

  const createTaskFromTemplate = async (template: TaskTemplate) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Template className="w-5 h-5" />
            Task Templates
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge
                      variant={template.priority === 'high' ? 'destructive' : 
                               template.priority === 'medium' ? 'default' : 'secondary'}
                    >
                      {template.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{template.title}</p>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => createTaskFromTemplate(template)}
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {isCreating && (
            <div className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800">
              <Input
                placeholder="Template name (e.g., 'Weekly Report')"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Task title"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Task description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
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
              <div className="flex gap-2">
                <Button onClick={handleCreateTemplate}>
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
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTemplates;
