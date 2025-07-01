
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Zap, Calendar, CheckCircle } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  progress: number;
  maxProgress: number;
  earned: boolean;
  earnedAt?: string;
  icon: any;
}

const EnhancedAchievementSystem = () => {
  const { tasks } = useTask();
  const { user, isDemoUser } = useAuth();
  const isMobile = useIsMobile();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const calculateConsecutiveDays = (tasks: any[]) => {
    if (tasks.length === 0) return 0;
    
    const dates = [...new Set(tasks.map(t => new Date(t.createdAt).toDateString()))].sort();
    let maxStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currentDate = new Date(dates[i]);
      const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(maxStreak, currentStreak);
  };

  const achievementDefinitions = [
    {
      id: 'first-task',
      title: 'Getting Started',
      description: 'Create your first task',
      type: 'milestone',
      points: 10,
      maxProgress: 1,
      icon: Target,
      getProgress: (tasks: any[]) => tasks.length,
      isEarned: (tasks: any[]) => tasks.length >= 1
    },
    {
      id: 'task-master',
      title: 'Task Master',
      description: 'Create 10 tasks',
      type: 'milestone',
      points: 50,
      maxProgress: 10,
      icon: Star,
      getProgress: (tasks: any[]) => tasks.length,
      isEarned: (tasks: any[]) => tasks.length >= 10
    },
    {
      id: 'completion-champion',
      title: 'Completion Champion',
      description: 'Complete 5 tasks',
      type: 'completion',
      points: 30,
      maxProgress: 5,
      icon: CheckCircle,
      getProgress: (tasks: any[]) => tasks.filter(t => t.status === 'completed').length,
      isEarned: (tasks: any[]) => tasks.filter(t => t.status === 'completed').length >= 5
    },
    {
      id: 'weekly-warrior',
      title: 'Weekly Warrior',
      description: 'Complete 20 tasks',
      type: 'completion',
      points: 100,
      maxProgress: 20,
      icon: Trophy,
      getProgress: (tasks: any[]) => tasks.filter(t => t.status === 'completed').length,
      isEarned: (tasks: any[]) => tasks.filter(t => t.status === 'completed').length >= 20
    },
    {
      id: 'priority-pro',
      title: 'Priority Pro',
      description: 'Complete 3 high-priority tasks',
      type: 'priority',
      points: 40,
      maxProgress: 3,
      icon: Zap,
      getProgress: (tasks: any[]) => tasks.filter(t => t.status === 'completed' && t.priority === 'high').length,
      isEarned: (tasks: any[]) => tasks.filter(t => t.status === 'completed' && t.priority === 'high').length >= 3
    },
    {
      id: 'consistency-king',
      title: 'Consistency King',
      description: 'Create tasks for 7 consecutive days',
      type: 'streak',
      points: 75,
      maxProgress: 7,
      icon: Calendar,
      getProgress: (tasks: any[]) => calculateConsecutiveDays(tasks),
      isEarned: (tasks: any[]) => calculateConsecutiveDays(tasks) >= 7
    }
  ];

  const saveAchievement = async (achievement: Achievement) => {
    if (isDemoUser) return;

    try {
      await supabase.from('achievements').insert({
        user_id: user?.id,
        title: achievement.title,
        type: achievement.type,
        description: achievement.description,
        points: achievement.points
      });
    } catch (error) {
      console.error('Error saving achievement:', error);
    }
  };

  useEffect(() => {
    const updatedAchievements = achievementDefinitions.map(def => {
      const progress = Math.min(def.getProgress(tasks), def.maxProgress);
      const earned = def.isEarned(tasks);
      
      return {
        ...def,
        progress,
        earned,
        earnedAt: earned ? new Date().toISOString() : undefined
      };
    });

    // Check for newly earned achievements
    updatedAchievements.forEach((achievement, index) => {
      const previousAchievement = achievements[index];
      if (achievement.earned && (!previousAchievement || !previousAchievement.earned)) {
        saveAchievement(achievement);
      }
    });

    setAchievements(updatedAchievements);
  }, [tasks]);

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <Card className="h-fit">
      <CardHeader className={isMobile ? "pb-3" : ""}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements
          <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
            {totalPoints} pts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "p-3 pt-0" : ""}>
        <div className={`space-y-3 ${isMobile ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border transition-all ${
                achievement.earned
                  ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
                  : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <achievement.icon 
                  className={`w-5 h-5 mt-0.5 ${
                    achievement.earned ? "text-yellow-600" : "text-gray-400"
                  }`} 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>
                      {achievement.title}
                    </h4>
                    <Badge 
                      variant={achievement.earned ? "default" : "secondary"}
                      className={isMobile ? 'text-xs' : ''}
                    >
                      {achievement.points}
                    </Badge>
                  </div>
                  <p className={`text-muted-foreground mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {achievement.description}
                  </p>
                  {!achievement.earned && (
                    <div className="space-y-1">
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                      <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {achievement.progress} / {achievement.maxProgress}
                      </p>
                    </div>
                  )}
                  {achievement.earned && achievement.earnedAt && (
                    <Badge variant="outline" className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {earnedAchievements.length > 0 && (
          <div className={`mt-4 pt-3 border-t ${isMobile ? 'text-sm' : ''}`}>
            <p className="text-center text-muted-foreground">
              🎉 {earnedAchievements.length} achievement{earnedAchievements.length !== 1 ? 's' : ''} earned!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAchievementSystem;
