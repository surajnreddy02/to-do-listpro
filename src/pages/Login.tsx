
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
import { Mail, Lock, ArrowRight, Globe, Zap, User, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  
  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register states
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  
  // Demo states
  const [demoName, setDemoName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login, register, loginWithGoogle, loginDemo } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(loginEmail, loginPassword);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(registerName, registerEmail, registerPassword);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Registration failed. Please try again."
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome to To-Do Pro+</CardTitle>
            <CardDescription>
              Choose how you'd like to get started
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login" className="text-xs">
                <Mail className="w-3 h-3 mr-1" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                Register
              </TabsTrigger>
              <TabsTrigger value="demo" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Try Demo
              </TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      placeholder="********"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registerName">Full Name</Label>
                    <Input
                      id="registerName"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="Create a secure password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
            
            {/* Demo Tab */}
            <TabsContent value="demo">
              <form onSubmit={handleDemoLogin}>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">Try Demo Mode</span>
                    </div>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      Experience all features with no registration required. Your data will be stored locally.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demoName">Your Name</Label>
                    <Input
                      id="demoName"
                      placeholder="Enter your name"
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Starting Demo..." : "Start Demo"}
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="px-6 pb-4">
            <div className="relative flex items-center py-2">
              <Separator className="flex-1" />
              <span className="mx-2 text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <Globe className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
