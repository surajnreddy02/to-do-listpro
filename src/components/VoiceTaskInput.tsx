
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { geminiService } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

const VoiceTaskInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { addTask } = useTask();
  const { toast } = useToast();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        processVoiceInput(transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setTranscript("");
      recognition.start();
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const processVoiceInput = async (voiceText: string) => {
    setIsProcessing(true);
    try {
      const smartTask = await geminiService.generateSmartTask(voiceText);
      
      await addTask({
        title: smartTask.title,
        description: smartTask.description,
        priority: smartTask.priority,
        status: "todo",
        dueDate: null,
        estimatedDuration: smartTask.estimatedDuration,
      });

      toast({
        title: "Voice Task Created",
        description: `"${smartTask.title}" has been added from your voice input!`,
      });

      setTranscript("");
    } catch (error) {
      console.error('Voice processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Could not create task from voice input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isSupported) {
    return (
      <Card className="mb-4 border-dashed border-2">
        <CardContent className="p-4 text-center">
          <Volume2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Voice input is not supported in your browser
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Voice Task Input
          <Badge variant="secondary">AI Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">You said:</p>
              <p className="font-medium">"{transcript}"</p>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              size="lg"
              className={`gap-2 ${
                isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
              {isProcessing 
                ? "Creating Task..." 
                : isListening 
                  ? "Stop Listening" 
                  : "Start Voice Input"
              }
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {isListening 
              ? "Listening... Speak your task clearly" 
              : "Click to start recording your task description"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceTaskInput;
