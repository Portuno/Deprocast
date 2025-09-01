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
      title: "What Big Project Do You Want to Conquer?",
      description: "Every journey starts with a single step. Tell us about the one major project that feels most overwhelming or that you've been putting off the longest. Describe it in a sentence.",
      type: "dataCollection",
      callToAction: "Continue",
      visuals: "A large, open text input field over an inspiring background image.",
      interaction: {
        type: "formSubmission"
      },
      dataCollection: {
        mainProject: "text"
      }
    },
    {
      slideNumber: 5,
      title: "The Power of Micro-Tasks",
      description: "Your brain gets overwhelmed by too many information chunks, leading to analysis paralysis. Our first step is to turn your big project into small, manageable micro-tasks that are scientifically designed to feel less intimidating.",
      type: "information",
      callToAction: "Generate Micro-Tasks",
      visuals: "An animation of a complex, abstract idea breaking into smaller, organized pieces.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 6,
      title: "Your Micro-Tasks Are Ready!",
      description: "Our bot has generated your initial task list. Each one is a 'quick win' designed to give you a momentum-building dopamine boost. Don't worry about the order—just pick one and start.",
      type: "taskCreation",
      callToAction: "Start My First Task",
      visuals: "A preview of the AI-generated task list, with the first task highlighted.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 7,
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
      slideNumber: 8,
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
      slideNumber: 9,
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
      slideNumber: 10,
      title: "Your Personal AI Coach Awaits",
      description: "With the data you provide, our AI will learn your unique patterns. It will anticipate your needs, suggest personalized strategies, and help you overcome plateaus. Your personalized productivity coach is ready to help you.",
      type: "information",
      callToAction: "Awesome, I want my coach",
      visuals: "An AI icon lighting up with data streams, symbolizing its learning process.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 11,
      title: "Patience and Persistence",
      description: "Rewiring your brain takes time. Don't give up if you fall back into old habits. Every focused session and every data point is a step towards a permanent change. Be kind to yourself.",
      type: "mindset",
      callToAction: "I Will Be Persistent",
      visuals: "An illustration of a plant growing from a small seed, symbolizing gradual progress.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    },
    {
      slideNumber: 12,
      title: "You're Ready to Start Building!",
      description: "The protocol is activated. Your first micro-task is waiting. It's time to stop planning and start doing. Let's make this your most productive chapter yet.",
      type: "summary",
      callToAction: "Initiate My First Task",
      visuals: "The main app interface with the Pomodoro timer visible and the first micro-task highlighted and ready to begin.",
      interaction: {
        type: "buttonClick"
      },
      dataCollection: {}
    }
  ]
};
