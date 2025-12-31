
import { GoogleGenAI, Type } from "@google/genai";
import { Project, ProjectState, UrgencyLevel, Task } from "../types";

// Always obtain API key from process.env.API_KEY directly during initialization.

export const decomposeProject = async (
  name: string, 
  vision: string, 
  urgency: UrgencyLevel, 
  state: ProjectState,
  stakeholders: string[]
): Promise<Partial<Project>> => {
  // Use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contextPrompt = `
    Project Architecture Request:
    - Name: ${name}
    - Strategic Vision: ${vision}
    - Current State: ${state}
    - Strategic Urgency: ${urgency}
    - Stakeholders: ${stakeholders.join(', ') || 'Internal Only'}

    Instructions:
    Generate a high-performance execution roadmap. Return as strictly structured JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resistance: { type: Type.NUMBER },
            complexity: { type: Type.NUMBER },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING }
                }
              }
            }
          },
          required: ["tasks", "resistance", "complexity"]
        }
      }
    });

    // Access .text property directly.
    const data = JSON.parse(response.text || "{}");
    return {
      name,
      strategicVision: vision,
      resistance: data.resistance,
      complexity: data.complexity,
      urgencyThreshold: urgency,
      functionalState: state,
      tasks: (data.tasks || []).map((t: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: t.title,
        completed: false
      }))
    };
  } catch (e) {
    console.error("Gemini decomposition error:", e);
    return { name, tasks: [] };
  }
};

export const suggestNextTask = async (projects: Project[]): Promise<{projectId: string, task: Task} | null> => {
  if (projects.length === 0) return null;
  
  const activeProjects = projects.filter(p => p.status === 'active');
  const context = activeProjects.map(p => ({
    id: p.id,
    name: p.name,
    urgency: p.urgencyThreshold,
    complexity: p.complexity,
    pendingTasks: p.tasks.filter(t => !t.completed).map(t => t.title)
  }));

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on urgency and complexity, which single task should be prioritized now? Context: ${JSON.stringify(context)}. Return JSON with projectId and taskTitle.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectId: { type: Type.STRING },
            taskTitle: { type: Type.STRING }
          },
          required: ["projectId", "taskTitle"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    const project = projects.find(p => p.id === result.projectId);
    const task = project?.tasks.find(t => t.title === result.taskTitle && !t.completed);
    if (project && task) return { projectId: project.id, task };
  } catch (e) {
    console.error("Gemini task suggestion error:", e);
  }
  return null;
};

export const analyzeVictoryArchive = async (notes: any[]): Promise<string> => {
  if (notes.length === 0) return "Intelligence archive too thin for analysis.";
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these victory notes for performance patterns and executive growth insights: ${JSON.stringify(notes.slice(0, 10))}`,
    });
    return response.text || "Analysis result unavailable.";
  } catch (e) {
    console.error("Gemini archive analysis error:", e);
    return "Error occurred during archive synthesis.";
  }
};
