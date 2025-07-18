
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export class GeminiService {
  private async makeRequest(prompt: string): Promise<string> {
    const requestBody: GeminiRequest = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async generateSmartTask(description: string): Promise<{ title: string; description: string; priority: string; estimatedDuration: number }> {
    const prompt = `
      Analyze this user input and convert it into a well-structured task. First understand what the user wants to accomplish, then create an appropriate task.
      
      User input: "${description}"
      
      Please:
      1. Analyze the intent and context of what the user wants to do
      2. Create a clear, actionable task title (concise but descriptive)
      3. Provide a detailed description that breaks down what needs to be done
      4. Determine appropriate priority based on urgency/importance indicators
      5. Estimate realistic duration in minutes
      
      Consider these examples:
      - "I need to buy groceries" → Title: "Buy Weekly Groceries", Description: "Purchase essential groceries including fresh produce, dairy, and household items"
      - "Call mom tomorrow" → Title: "Call Mom", Description: "Have a catch-up phone call with mom to check in and share updates"
      - "Finish the presentation for Monday meeting" → Title: "Complete Monday Presentation", Description: "Finalize slides, review content, and prepare talking points for Monday's team meeting"
      
      Return in this exact JSON format:
      {
        "title": "Clear, actionable task title",
        "description": "Detailed description of what needs to be accomplished",
        "priority": "low|medium|high",
        "estimatedDuration": 30
      }
      
      Priority guidelines:
      - High: Urgent deadlines, important meetings, critical tasks
      - Medium: Important but not urgent, routine work tasks
      - Low: Nice to have, personal tasks, long-term goals
    `;

    const response = await this.makeRequest(prompt);
    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title || description.slice(0, 50),
        description: parsed.description || description,
        priority: parsed.priority || 'medium',
        estimatedDuration: parsed.estimatedDuration || 30
      };
    } catch {
      // Fallback with better defaults
      return {
        title: this.generateFallbackTitle(description),
        description: description,
        priority: 'medium',
        estimatedDuration: 30
      };
    }
  }

  private generateFallbackTitle(description: string): string {
    // Simple title generation from description
    const words = description.split(' ');
    if (words.length <= 6) {
      return description.charAt(0).toUpperCase() + description.slice(1);
    }
    return words.slice(0, 6).join(' ') + '...';
  }

  async breakdownTask(taskTitle: string, taskDescription: string): Promise<string[]> {
    const prompt = `
      Break down this task into smaller, actionable subtasks:
      
      Title: "${taskTitle}"
      Description: "${taskDescription}"
      
      Return 3-5 specific subtasks as a JSON array of strings:
      ["subtask 1", "subtask 2", "subtask 3"]
    `;

    const response = await this.makeRequest(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return [
        `Start working on: ${taskTitle}`,
        `Review and plan approach`,
        `Complete main objectives`,
        `Review and finalize`
      ];
    }
  }

  async generateProductivityInsights(tasks: any[], completedTasks: number, totalTasks: number): Promise<string> {
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
    
    const prompt = `
      Analyze this productivity data and provide 2-3 actionable insights:
      
      - Total tasks: ${totalTasks}
      - Completed tasks: ${completedTasks}
      - Completion rate: ${completionRate}%
      - Recent tasks: ${tasks.slice(0, 5).map(t => `${t.title} (${t.status})`).join(', ')}
      
      Provide personalized, encouraging advice in 2-3 sentences focusing on productivity improvement.
    `;

    return await this.makeRequest(prompt);
  }

  async suggestNextTask(tasks: any[]): Promise<string> {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    
    const prompt = `
      Based on these pending tasks, suggest which one to work on next and why:
      
      ${pendingTasks.map(t => `- ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate || 'No due date'})`).join('\n')}
      
      Provide a brief recommendation in 1-2 sentences.
    `;

    return await this.makeRequest(prompt);
  }

  async generateTaskCategories(tasks: any[]): Promise<string[]> {
    const prompt = `
      Based on these task titles, suggest 3-5 relevant categories:
      
      ${tasks.map(t => `- ${t.title}`).join('\n')}
      
      Return as JSON array: ["Work", "Personal", "Health", ...]
    `;

    const response = await this.makeRequest(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return ['Work', 'Personal', 'Health', 'Learning'];
    }
  }

  async generateTaskTemplate(description: string): Promise<any> {
    const prompt = `Create a task template based on this description: "${description}"

    Please analyze this and create a structured task template with:
    1. A short template name (2-4 words)
    2. A clear task title
    3. A detailed description of what needs to be done
    4. Appropriate priority level (low, medium, high)
    5. Suggested timing/scheduling context (daily, weekly, weekend, specific day, etc.)

    Return a JSON object with this structure:
    {
      "name": "Template Name",
      "title": "Task Title",
      "description": "Detailed task description",
      "priority": "medium",
      "schedulingContext": "daily|weekly|weekend|today|tomorrow|specific",
      "explanation": "Brief explanation of when this task should typically be scheduled"
    }

    Make the template reusable and professional.`;

    const response = await this.makeRequest(prompt);
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating task template:', error);
      throw new Error('Failed to generate task template');
    }
  }

  async analyzeTemplateScheduling(template: any): Promise<any> {
    const prompt = `Analyze this task template and determine when it should be scheduled: "${JSON.stringify(template)}"

    Based on the template name, title, and description, determine the most appropriate scheduling:
    
    Return a JSON object with:
    {
      "suggestedDay": "today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next_week|weekend",
      "reasoning": "Brief explanation of why this timing makes sense",
      "timeOfDay": "morning|afternoon|evening|any",
      "urgency": "immediate|today|this_week|next_week|flexible"
    }

    Consider:
    - Daily standup/meeting tasks should be scheduled for today or tomorrow
    - Weekly reports should be scheduled for appropriate weekdays
    - Weekend activities should be scheduled for weekends
    - Follow-ups should be scheduled promptly
    - Documentation can be more flexible`;

    const response = await this.makeRequest(prompt);
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing template scheduling:', error);
      throw new Error('Failed to analyze template scheduling');
    }
  }
}

export const geminiService = new GeminiService();
