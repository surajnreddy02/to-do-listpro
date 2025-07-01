
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, Globe, Zap, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";

const Login = () => {
  // Email login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Demo login states
  const [demoName, setDemoName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login, loginWithGoogle, loginDemo } = useAuth();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Login failed. Please check your email and password and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim()) {
      setError("Please enter your name for the demo");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await loginDemo(demoName.trim());
    } catch (err) {
      console.error("Demo login error:", err);
      setError("Demo login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : "Google login failed. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="space-y-1 bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg">
            <CardTitle className="text-center text-2xl font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred login method
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="demo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50">
              <TabsTrigger value="demo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Zap className="w-4 h-4 mr-1" />
                Try Demo
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="demo">
              <form onSubmit={handleDemoLogin}>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">Demo Mode</span>
                    </div>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      Try our full-featured to-do app with sample data, AI features, and analytics. No account required!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demoName" className="flex items-center gap-2 text-foreground">
                      <User className="h-4 w-4 text-primary" />
                      Your Name
                    </Label>
                    <Input
                      id="demoName"
                      placeholder="Enter your name"
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      required
                      className="border-primary/30 focus-visible:ring-primary"
                    />
                  </div>
                  
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Starting Demo..." : "Start Demo Experience"}
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                      <Mail className="h-4 w-4 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-primary/30 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-foreground">
                      <Lock className="h-4 w-4 text-primary" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-primary/30 focus-visible:ring-primary"
                    />
                  </div>
                  
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="px-6 pb-2">
            <div className="relative flex items-center py-2">
              <Separator className="flex-1" />
              <span className="mx-2 text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4 border-primary/30 hover:bg-primary/10"
              onClick={handleGoogleLogin}
            >
              <Globe className="mr-2 h-4 w-4 text-primary" />
              Continue with Google
            </Button>
          </div>
          
          <CardFooter className="flex flex-col space-y-2 bg-gradient-to-r from-transparent to-primary/10 rounded-b-lg">
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
