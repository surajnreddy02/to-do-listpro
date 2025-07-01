
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { geminiService } from "@/services/geminiService";
import { useTask } from "@/contexts/TaskContext";

const SmartTaskInput = () => {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const { addTask } = useTask();
  const { toast } = useToast();

  const handleSmartGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    try {
      const smartTask = await geminiService.generateSmartTask(input);
      setSuggestions(smartTask);
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Could not generate smart task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!suggestions) return;

    await addTask({
      title: suggestions.title,
      description: suggestions.description,
      priority: suggestions.priority,
      status: "todo",
      dueDate: null,
      estimatedDuration: suggestions.estimatedDuration,
    });

    setSuggestions(null);
    setInput("");
    
    toast({
      title: "Smart Task Created",
      description: "AI-powered task has been added to your list!",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="mb-6 border-2 border-dashed border-primary/30 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-lg">AI Task Generator</h3>
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="Describe what you need to do... (e.g., 'Prepare presentation for next week's client meeting about our Q4 results')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[80px] resize-none"
          />

          <Button
            onClick={handleSmartGenerate}
            disabled={!input.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Generate Smart Task"}
          </Button>

          {suggestions && (
            <Card className="mt-4 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">AI Suggestions</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{suggestions.title}</h4>
                    <p className="text-muted-foreground mt-1">{suggestions.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityColor(suggestions.priority)}>
                      {suggestions.priority} priority
                    </Badge>
                    <Badge variant="outline">
                      ~{suggestions.estimatedDuration} minutes
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleCreateTask} size="sm">
                      Create Task
                    </Button>
                    <Button 
                      onClick={() => setSuggestions(null)} 
                      variant="outline" 
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartTaskInput;
