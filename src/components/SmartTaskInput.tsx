
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { geminiService } from "@/services/geminiService";
import { useTask } from "@/contexts/TaskContext";
import { parseNaturalDate } from "@/lib/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";

const SmartTaskInput = () => {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const { addTask } = useTask();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSmartGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    console.log('Generating smart task from input:', input);
    
    try {
      toast({
        title: "Analyzing Input",
        description: "AI is analyzing your input to create the perfect task...",
      });

      const smartTask = await geminiService.generateSmartTask(input);
      console.log('Generated smart task:', smartTask);
      
      // Parse date from input
      const parsedDate = parseNaturalDate(input);
      console.log('Parsed date from input:', parsedDate);
      
      setSuggestions({
        ...smartTask,
        parsedDate
      });

      toast({
        title: "Task Analysis Complete",
        description: "Review the AI-generated task suggestions below!",
      });
    } catch (error) {
      console.error('Smart task generation error:', error);
      toast({
        title: "AI Analysis Failed",
        description: "Could not analyze and generate smart task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!suggestions) return;

    console.log('Creating task with suggestions:', suggestions);

    await addTask({
      title: suggestions.title,
      description: suggestions.description,
      priority: suggestions.priority,
      status: "todo",
      dueDate: suggestions.parsedDate ? suggestions.parsedDate.toISOString() : null,
      estimatedDuration: suggestions.estimatedDuration,
    });

    setSuggestions(null);
    setInput("");
    
    toast({
      title: "Smart Task Created Successfully",
      description: suggestions.parsedDate 
        ? `Task scheduled for ${suggestions.parsedDate.toLocaleDateString()}!`
        : "AI-analyzed task has been added to your list!",
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
    <Card className={`border-2 border-dashed border-primary/30 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 ${isMobile ? 'mb-4' : 'mb-6'}`}>
      <CardContent className={isMobile ? "p-3" : "p-4"}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>AI Task Generator</h3>
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="Describe what you need to do... (e.g., 'I need to prepare for tomorrow's client presentation' or 'Buy groceries this evening')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`resize-none ${isMobile ? 'min-h-[60px] text-sm' : 'min-h-[80px]'}`}
          />

          <Button
            onClick={handleSmartGenerate}
            disabled={!input.trim() || isGenerating}
            className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 ${isMobile ? 'text-sm' : ''}`}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? "Analyzing & Generating..." : "Analyze & Generate Task"}
          </Button>

          {suggestions && (
            <Card className="mt-4 border-purple-200 dark:border-purple-800">
              <CardContent className={isMobile ? "p-3" : "p-4"}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>AI Analysis Results</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>{suggestions.title}</h4>
                    <p className={`text-muted-foreground mt-1 ${isMobile ? 'text-sm' : ''}`}>{suggestions.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityColor(suggestions.priority)}>
                      {suggestions.priority} priority
                    </Badge>
                    <Badge variant="outline">
                      ~{suggestions.estimatedDuration} minutes
                    </Badge>
                    {suggestions.parsedDate && (
                      <Badge variant="secondary">
                        Due: {suggestions.parsedDate.toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  <div className={`flex gap-2 pt-2 ${isMobile ? 'flex-col' : ''}`}>
                    <Button onClick={handleCreateTask} size={isMobile ? "sm" : "default"}>
                      Create Task
                    </Button>
                    <Button 
                      onClick={() => setSuggestions(null)} 
                      variant="outline" 
                      size={isMobile ? "sm" : "default"}
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
