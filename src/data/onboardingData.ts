import { OnboardingFlow } from '../types/onboarding';

export const onboardingFlow: OnboardingFlow = {
  onboardingFlow: [
    {
      slideNumber: 1,
      title: "Welcome to Deprocast! 🚀",
      description: "Hello! We're glad you're here. Get ready to stop struggling with procrastination and start building an unstoppable future, not with more willpower, but with the science of your brain.",
      type: "welcome",
      callToAction: "Start Your Journey",
      visuals: "An animated welcome screen with the Deprocast logo and a 'ready to build' illustration.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 2,
      title: "Procrastination Isn't Laziness. It's Biology. 🧠",
      description: "Your brain's Anterior Cingulate Cortex perceives complex projects as threats, triggering stress and reducing focus. We'll show you how to bypass this and start working with your brain, not against it.",
      type: "information",
      callToAction: "Got It",
      visuals: "An animated visual of a brain reacting to a large, overwhelming task, showing the Anterior Cingulate Cortex (ACC) and Prefrontal Cortex (PFC) connections.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 3,
      title: "Help Us Understand Your Rhythm",
      description: "For our AI to be your perfect coach, we need to know how you work. Please answer a few quick questions about your natural energy and focus patterns.",
      type: "dataCollection",
      callToAction: "Next",
      visuals: "A clean form with multiple-choice questions.",
      interaction: {
        type: "formSubmission"
      },
      dataCollection: {
        energyLevel: "select",
        distractionSusceptibility: "select",
        imposterSyndrome: "select"
      }
    },
    {
      slideNumber: 4,
      title: "Project Title",
      description: "Information about dividing a big project into microtasks. What's the name of your project?",
      type: "dataCollection",
      callToAction: "Continue",
      visuals: "A form field for project title.",
      interaction: {
        type: "formSubmission"
      },
      dataCollection: {
        projectTitle: "text"
      }
    },
    {
      slideNumber: 5,
      title: "Project Description & Timeline",
      description: "Make a description of the project, and a target completion date. We invite you to make something achievable by the next 3 days.",
      type: "dataCollection",
      callToAction: "Continue",
      visuals: "Form fields for description and date picker.",
      interaction: {
        type: "formSubmission"
      },
      dataCollection: {
        projectDescription: "text",
        targetCompletionDate: "date"
      }
    },
    {
      slideNumber: 6,
      title: "More About Neuroscience",
      description: "Your brain gets overwhelmed by too many information chunks, leading to analysis paralysis. Our first step is to turn your big project into small, manageable micro-tasks that are scientifically designed to feel less intimidating.",
      type: "information",
      callToAction: "Got It",
      visuals: "An animation of a complex, abstract idea breaking into smaller, organized pieces.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 7,
      title: "Project Details",
      description: "Optional (Recommended) - Project Type/Category and Perceived Difficulty (1-10)",
      type: "dataCollection",
      callToAction: "Continue",
      visuals: "Form fields for project type and difficulty slider.",
      interaction: {
        type: "formSubmission"
      },
      dataCollection: {
        projectType: "select",
        perceivedDifficulty: "number"
      }
    },
    {
      slideNumber: 8,
      title: "Motivation & Challenges",
      description: "Why do you want to complete this project? What obstacles do you foresee? What skills or resources do you need?",
      type: "dataCollection",
      callToAction: "Continue",
      visuals: "Form fields for motivation, obstacles, and skills needed.",
      interaction: {
        type: "formSubmission"
      },
      dataCollection: {
        motivation: "text",
        knownObstacles: "tags",
        skillsNeeded: "tags"
      }
    },
    {
      slideNumber: 9,
      title: "Generate Micro-Tasks",
      description: "Now let's break down your project into manageable micro-tasks. Our AI will analyze your project and create a personalized task list.",
      type: "taskCreation",
      callToAction: "Generate Micro-Tasks",
      visuals: "A button to generate tasks with AI processing animation.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 10,
      title: "The Pomodoro+ Protocol in Action",
      description: "We'll guide you through 25-minute sessions of total focus, followed by 5-minute breaks. This protocol re-wires your brain by separating work from rest, allowing your Prefrontal Cortex to fully recover.",
      type: "information",
      callToAction: "Understood",
      visuals: "A simple infographic showing a 25-minute work timer and a 5-minute break timer.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 11,
      title: "The Art of Celebration",
      description: "When you complete a task, you must celebrate it! This isn't just for fun—it's a critical step to strengthen your brain's reward circuits and train it to associate hard work with pleasure.",
      type: "information",
      callToAction: "Let's Celebrate",
      visuals: "An animated icon of a person performing a physical celebration (e.g., a fist pump).",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 12,
      title: "Your Growth Journal",
      description: "After each task, we'll ask you to log how you felt and the obstacles you faced. This data is the 'context' that makes our AI so powerful.",
      type: "information",
      callToAction: "OK, Let's Log It",
      visuals: "An image of the post-task logging interface with fields for 'Dopamine Rating' and 'Obstacles'.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 13,
      title: "Context Blueprint Generator",
      description: "Learn about the Context Blueprint generator - what it is and where to find it in your dashboard.",
      type: "information",
      callToAction: "Tell Me More",
      visuals: "An icon representing the context blueprint generator.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 14,
      title: "Understanding Context Blueprint",
      description: "The Context Blueprint is a JSON file that contains information about your work patterns, preferences, and progress. This data helps our AI provide personalized recommendations.",
      type: "information",
      callToAction: "Got It",
      visuals: "A visual representation of a JSON file with data fields.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 15,
      title: "Activate Your User Persona",
      description: "This is all experimental and in beta. Ready to activate your personalized user persona and see your generated micro-tasks?",
      type: "summary",
      callToAction: "Activate User Persona",
      visuals: "A button to activate with loading animation.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    }
  ]
};
