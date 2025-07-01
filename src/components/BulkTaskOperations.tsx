
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckSquare, Square, Edit, Tag } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { useToast } from "@/hooks/use-toast";

interface BulkTaskOperationsProps {
  tasks: any[];
  onTasksUpdate: () => void;
}

const BulkTaskOperations: React.FC<BulkTaskOperationsProps> = ({ tasks, onTasksUpdate }) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const { updateTask, deleteTask, categories } = useTask();
  const { toast } = useToast();

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    setSelectedTasks(selectedTasks.length === tasks.length ? [] : tasks.map(t => t.id));
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selectedTasks.length === 0) return;

    try {
      switch (bulkAction) {
        case 'delete':
          for (const taskId of selectedTasks) {
            await deleteTask(taskId);
          }
          toast({
            title: "Bulk Delete Complete",
            description: `${selectedTasks.length} tasks deleted successfully`,
          });
          break;

        case 'complete':
          for (const taskId of selectedTasks) {
            await updateTask(taskId, { status: 'completed' });
          }
          toast({
            title: "Bulk Complete",
            description: `${selectedTasks.length} tasks marked as completed`,
          });
          break;

        case 'todo':
          for (const taskId of selectedTasks) {
            await updateTask(taskId, { status: 'todo' });
          }
          toast({
            title: "Bulk Status Update",
            description: `${selectedTasks.length} tasks marked as To Do`,
          });
          break;

        case 'in-progress':
          for (const taskId of selectedTasks) {
            await updateTask(taskId, { status: 'in-progress' });
          }
          toast({
            title: "Bulk Status Update",
            description: `${selectedTasks.length} tasks marked as In Progress`,
          });
          break;

        case 'high-priority':
          for (const taskId of selectedTasks) {
            await updateTask(taskId, { priority: 'high' });
          }
          toast({
            title: "Bulk Priority Update",
            description: `${selectedTasks.length} tasks set to high priority`,
          });
          break;

        case 'medium-priority':
          for (const taskId of selectedTasks) {
            await updateTask(taskId, { priority: 'medium' });
          }
          toast({
            title: "Bulk Priority Update",
            description: `${selectedTasks.length} tasks set to medium priority`,
          });
          break;

        case 'low-priority':
          for (const taskId of selectedTasks) {
            await updateTask(taskId, { priority: 'low' });
          }
          toast({
            title: "Bulk Priority Update",
            description: `${selectedTasks.length} tasks set to low priority`,
          });
          break;
      }

      setSelectedTasks([]);
      setBulkAction("");
      onTasksUpdate();

    } catch (error) {
      toast({
        title: "Bulk Operation Failed",
        description: "Some operations may have failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (tasks.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Bulk Operations
            {selectedTasks.length > 0 && (
              <Badge variant="secondary">{selectedTasks.length} selected</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllTasks}
            className="gap-1"
          >
            {selectedTasks.length === tasks.length ? (
              <>
                <Square className="w-4 h-4" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                Select All
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Task Selection */}
        <div className="grid gap-2 mb-4 max-h-40 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
            >
              <Checkbox
                id={`task-${task.id}`}
                checked={selectedTasks.includes(task.id)}
                onCheckedChange={() => toggleTaskSelection(task.id)}
              />
              <label htmlFor={`task-${task.id}`} className="flex-1 text-sm cursor-pointer">
                {task.title}
              </label>
              <Badge
                variant={task.priority === 'high' ? 'destructive' : 
                         task.priority === 'medium' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="flex gap-2 items-center">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complete">Mark as Completed</SelectItem>
                <SelectItem value="todo">Mark as To Do</SelectItem>
                <SelectItem value="in-progress">Mark as In Progress</SelectItem>
                <SelectItem value="high-priority">Set High Priority</SelectItem>
                <SelectItem value="medium-priority">Set Medium Priority</SelectItem>
                <SelectItem value="low-priority">Set Low Priority</SelectItem>
                <SelectItem value="delete" className="text-destructive">
                  Delete Tasks
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={executeBulkAction}
              disabled={!bulkAction}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              className="gap-1"
            >
              {bulkAction === 'delete' ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
              Apply to {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkTaskOperations;
