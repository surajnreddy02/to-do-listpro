
import React, { useState } from "react";
import { useTask } from "@/contexts/TaskContext";
import TaskTemplates from "@/components/TaskTemplates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Target } from "lucide-react";

const Templates = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-8 h-8 text-primary" />
              Task Templates
            </h1>
            <p className="text-muted-foreground">
              Create and manage reusable task templates for faster task creation
            </p>
          </div>
        </div>

        {/* Templates Component */}
        <TaskTemplates />
      </div>
    </div>
  );
};

export default Templates;
