
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Zap, Award, Medal, Crown } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  earned: boolean;
  progress?: number;
  target?: number;
  icon: typeof Trophy;
}

const AchievementSystem = () => {
  const { tasks } = useTask();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const achievementTemplates: Omit<Achievement, 'earned' | 'progress'>[] = [
    {
      id: 'first-task',
      type: 'milestone',
      title: 'Getting Started',
      description: 'Complete your first task',
      points: 10,
      icon: Star,
      target: 1
    },
    {
      id: 'task-streak-3',
      type: 'streak',
      title: 'On a Roll',
      description: 'Complete tasks for 3 consecutive days',
      points: 25,
      icon: Zap,
      target: 3
    },
    {
      id: 'task-master-10',
      type: 'completion',
      title: 'Task Master',
      description: 'Complete 10 tasks',
      points: 50,
      icon: Trophy,
      target: 10
    },
    {
      id: 'high-priority-hero',
      type: 'priority',
      title: 'Priority Hero',
      description: 'Complete 5 high priority tasks',
      points: 35,
      icon: Target,
      target: 5
    },
    {
      id: 'productivity-legend',
      type: 'completion',
      title: 'Productivity Legend',
      description: 'Complete 50 tasks',
      points: 100,
      icon: Crown,
      target: 50
    },
    {
      id: 'perfectionist',
      type: 'quality',
      title: 'Perfectionist',
      description: 'Complete 10 tasks with AI priority score > 0.8',
      points: 75,
      icon: Medal,
      target: 10
    }
  ];

  useEffect(() => {
    checkAchievements();
  }, [tasks]);

  const checkAchievements = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high');
    const highQualityTasks = completedTasks.filter(t => (t.aiPriorityScore || 0) > 0.8);

    // Calculate streaks (simplified - in real app would check dates properly)
    const currentStreak = Math.min(completedTasks.length, 7); // Mock streak

    const updatedAchievements = achievementTemplates.map(template => {
      let progress = 0;
      let earned = false;

      switch (template.type) {
        case 'milestone':
        case 'completion':
          progress = completedTasks.length;
          earned = progress >= (template.target || 0);
          break;
        case 'priority':
          progress = highPriorityCompleted.length;
          earned = progress >= (template.target || 0);
          break;
        case 'quality':
          progress = highQualityTasks.length;
          earned = progress >= (template.target || 0);
          break;
        case 'streak':
          progress = currentStreak;
          earned = progress >= (template.target || 0);
          break;
      }

      return {
        ...template,
        earned,
        progress: Math.min(progress, template.target || progress)
      };
    });

    // Check for newly earned achievements
    const previouslyEarned = achievements.filter(a => a.earned).map(a => a.id);
    const newlyEarned = updatedAchievements.filter(a => 
      a.earned && !previouslyEarned.includes(a.id)
    );

    if (newlyEarned.length > 0) {
      newlyEarned.forEach(achievement => {
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${achievement.title} - ${achievement.points} points earned!`,
        });
      });
    }

    setAchievements(updatedAchievements);
    setTotalPoints(updatedAchievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0));
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const unlockedAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Achievements
            <Badge variant="secondary" className="ml-auto">
              {totalPoints} XP
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {earnedAchievements.length} / {achievements.length}
              </div>
              <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Earned ({earnedAchievements.length})</h4>
              {earnedAchievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <IconComponent className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <h5 className="font-medium">{achievement.title}</h5>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="secondary">+{achievement.points} XP</Badge>
                  </div>
                );
              })}
            </div>

            {unlockedAchievements.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-600">In Progress ({unlockedAchievements.length})</h4>
                {unlockedAchievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  const progressPercent = ((achievement.progress || 0) / (achievement.target || 1)) * 100;
                  
                  return (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                    >
                      <IconComponent className="w-8 h-8 text-gray-400" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-600">{achievement.title}</h5>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="mt-2 space-y-1">
                          <Progress value={progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {achievement.progress || 0} / {achievement.target || 0}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{achievement.points} XP</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementSystem;
