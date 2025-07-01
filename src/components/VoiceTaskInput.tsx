
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { geminiService } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";
import { parseNaturalDate } from "@/lib/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";

// TypeScript declarations for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

const VoiceTaskInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { addTask } = useTask();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    console.log('Processing voice input:', voiceText);
    
    try {
      // First, let AI analyze and understand the voice input
      toast({
        title: "Analyzing Voice Input",
        description: "AI is processing and understanding your request...",
      });

      const smartTask = await geminiService.generateSmartTask(voiceText);
      console.log('Generated smart task:', smartTask);
      
      // Parse date from voice input
      const parsedDate = parseNaturalDate(voiceText);
      console.log('Parsed date:', parsedDate);
      
      await addTask({
        title: smartTask.title,
        description: smartTask.description,
        priority: smartTask.priority as 'low' | 'medium' | 'high',
        status: "todo",
        dueDate: parsedDate ? parsedDate.toISOString() : null,
        estimatedDuration: smartTask.estimatedDuration,
      });

      toast({
        title: "Voice Task Created Successfully",
        description: parsedDate 
          ? `"${smartTask.title}" scheduled for ${parsedDate.toLocaleDateString()}!`
          : `"${smartTask.title}" has been analyzed and added to your tasks!`,
      });

      setTranscript("");
    } catch (error) {
      console.error('Voice processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Could not analyze and create task from voice input. Please try again.",
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
    <Card className={`border-2 border-dashed border-primary/30 ${isMobile ? 'mb-4' : 'mb-4'}`}>
      <CardHeader className={isMobile ? "pb-2" : "pb-3"}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
          <Volume2 className="w-5 h-5" />
          Voice Task Input
          <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>AI Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "p-3 pt-0" : ""}>
        <div className="text-center space-y-4">
          {transcript && (
            <div className={`p-3 bg-muted rounded-lg ${isMobile ? 'p-2' : ''}`}>
              <p className={`text-muted-foreground mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>You said:</p>
              <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>"{transcript}"</p>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              size={isMobile ? "default" : "lg"}
              className={`gap-2 ${
                isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-primary hover:bg-primary/90"
              } ${isMobile ? 'text-sm' : ''}`}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
              {isProcessing 
                ? "Analyzing & Creating..." 
                : isListening 
                  ? "Stop Listening" 
                  : "Start Voice Input"
              }
            </Button>
          </div>

          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isListening 
              ? "Listening... Speak your task clearly" 
              : isProcessing
                ? "AI is analyzing your voice input..."
                : "Click to start recording. AI will analyze and create a proper task."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceTaskInput;
