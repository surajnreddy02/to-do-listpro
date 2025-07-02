
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FocusSession {
  id: string;
  date: string;
  duration: number; // in seconds
  completed: boolean;
}

interface FocusContextType {
  // Timer state
  isActive: boolean;
  isPaused: boolean;
  mode: "focus" | "break";
  timeRemaining: number;
  progress: number;
  
  // Timer settings
  focusDuration: number;
  breakDuration: number;
  
  // Timer controls
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipToBreak: () => void;
  skipToFocus: () => void;
  
  // Session stats
  sessions: FocusSession[];
  todayCompleted: number;
  totalCompleted: number;
  totalFocusTime: number; // in seconds
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  
  // Timer settings
  const [focusDuration, setFocusDuration] = useState(25 * 60); // 25 minutes in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes in seconds
  
  // Session tracking
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Load sessions from Supabase on mount
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Failed to load focus sessions", error);
        return;
      }
      
      const formattedSessions = data.map(session => ({
        id: session.id,
        date: session.start_time,
        duration: session.duration,
        completed: !!session.end_time,
      }));
      
      setSessions(formattedSessions);
    };
    
    loadSessions();
  }, [user]);
  
  // Save completed session to Supabase
  const saveSessionToSupabase = async (sessionData: FocusSession) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('focus_sessions')
      .insert({
        id: sessionData.id,
        user_id: user.id,
        start_time: sessionData.date,
        duration: sessionData.duration,
        end_time: sessionData.completed ? new Date().toISOString() : null,
      });
    
    if (error) {
      console.error("Failed to save focus session", error);
    }
  };
  
  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && !isPaused) {
      interval = window.setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            const timer = new Audio('/notification.mp3');
            timer.play().catch(e => console.log('Audio play failed:', e));
            
            // If focus mode is finished, add to completed sessions
            if (mode === "focus" && currentSessionId) {
              const updatedSession = {
                id: currentSessionId,
                date: new Date().toISOString(),
                duration: focusDuration,
                completed: true,
              };
              
              setSessions((prev) =>
                prev.map((session) =>
                  session.id === currentSessionId
                    ? updatedSession
                    : session
                )
              );
              
              saveSessionToSupabase(updatedSession);
              setCurrentSessionId(null);
            }
            
            // Switch modes
            if (mode === "focus") {
              setMode("break");
              setTimeRemaining(breakDuration);
            } else {
              setMode("focus");
              setTimeRemaining(focusDuration);
            }
            
            return mode === "focus" ? breakDuration : focusDuration;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, mode, focusDuration, breakDuration, currentSessionId]);
  
  // Timer controls
  const startTimer = () => {
    if (mode === "focus" && !currentSessionId) {
      // Create a new session when starting a focus timer
      const newSessionId = crypto.randomUUID();
      const newSession = {
        id: newSessionId,
        date: new Date().toISOString(),
        duration: 0, // Will be updated when completed
        completed: false,
      };
      setSessions((prev) => [...prev, newSession]);
      setCurrentSessionId(newSessionId);
    }
    
    setIsActive(true);
    setIsPaused(false);
  };
  
  const pauseTimer = () => {
    setIsPaused(true);
  };
  
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setMode("focus");
    setTimeRemaining(focusDuration);
    
    // Cancel the current session if it exists
    if (currentSessionId) {
      setSessions((prev) => prev.filter((session) => session.id !== currentSessionId));
      setCurrentSessionId(null);
    }
  };
  
  const skipToBreak = () => {
    if (mode === "focus" && currentSessionId) {
      // Mark the current session as completed when skipping to break
      const updatedSession = {
        id: currentSessionId,
        date: new Date().toISOString(),
        duration: focusDuration - timeRemaining,
        completed: true,
      };
      
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? updatedSession
            : session
        )
      );
      
      saveSessionToSupabase(updatedSession);
      setCurrentSessionId(null);
    }
    
    setMode("break");
    setTimeRemaining(breakDuration);
  };
  
  const skipToFocus = () => {
    setMode("focus");
    setTimeRemaining(focusDuration);
  };
  
  // Computed session stats
  const getTodayCompleted = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime() && session.completed;
    }).length;
  };
  
  const getTotalCompleted = () => {
    return sessions.filter((session) => session.completed).length;
  };
  
  const getTotalFocusTime = () => {
    return sessions
      .filter((session) => session.completed)
      .reduce((total, session) => total + (session.duration || 0), 0);
  };
  
  // Calculate progress percentage for the timer circle
  const calculateProgress = () => {
    const totalTime = mode === "focus" ? focusDuration : breakDuration;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };
  
  const value = {
    isActive,
    isPaused,
    mode,
    timeRemaining,
    progress: calculateProgress(),
    focusDuration,
    breakDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipToBreak,
    skipToFocus,
    sessions,
    todayCompleted: getTodayCompleted(),
    totalCompleted: getTotalCompleted(),
    totalFocusTime: getTotalFocusTime(),
  };
  
  return (
    <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
};
