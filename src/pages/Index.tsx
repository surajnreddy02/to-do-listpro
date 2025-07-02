
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, BarChart3, Target, Sparkles, ArrowRight, CheckSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: CheckCircle,
      title: "Smart Task Management",
      description: "Organize your tasks with priorities, categories, and due dates for maximum productivity."
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "View your tasks in calendar format and never miss important deadlines again."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track your productivity with detailed analytics and performance metrics."
    },
    {
      icon: Target,
      title: "Goal Achievement",
      description: "Set goals, track progress, and celebrate your achievements with our gamification system."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="absolute top-4 right-4">
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <CheckSquare className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                To-Do Pro<span className="text-primary">+</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Developed by Suraj N Reddy
            </p>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your productivity with our intelligent task management system. 
              Organize, prioritize, and achieve your goals with ease.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/login")}
              className="gap-2 px-8 py-3 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Why Choose To-Do Pro+?</h2>
            <p className="text-muted-foreground">
              Built for individuals and teams who value productivity and organization
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <Sparkles className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-semibold">Smart & Intuitive</h3>
              <p className="text-sm text-muted-foreground">
                Clean interface designed for focus and efficiency
              </p>
            </div>
            <div className="space-y-2">
              <Target className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-semibold">Goal-Oriented</h3>
              <p className="text-sm text-muted-foreground">
                Track progress and achieve your objectives
              </p>
            </div>
            <div className="space-y-2">
              <BarChart3 className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-semibold">Data-Driven</h3>
              <p className="text-sm text-muted-foreground">
                Make informed decisions with detailed analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
