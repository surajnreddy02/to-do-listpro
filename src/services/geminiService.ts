
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

const GEMINI_API_KEY = "AIzaSyAyethqen8ZZ3_covOALeUiS9G7oateRfY";
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
      Convert this task description into a structured task with title, description, priority (low/medium/high), and estimated duration in minutes.
      
      Input: "${description}"
      
      Return in this exact JSON format:
      {
        "title": "Short task title",
        "description": "Detailed description",
        "priority": "low|medium|high",
        "estimatedDuration": 30
      }
    `;

    const response = await this.makeRequest(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return {
        title: description.slice(0, 50),
        description: description,
        priority: 'medium',
        estimatedDuration: 30
      };
    }
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
}

export const geminiService = new GeminiService();
