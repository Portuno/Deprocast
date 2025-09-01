export interface OnboardingSlide {
  slideNumber: number;
  title: string;
  description: string;
  type: 'welcome' | 'information' | 'dataCollection' | 'taskCreation' | 'summary' | 'mindset';
  callToAction: string;
  visuals: string;
  interaction: {
    type: 'buttonClick' | 'formSubmission';
  };
  dataCollection: Record<string, 'select' | 'text' | 'number'>;
}

export interface OnboardingFlow {
  onboardingFlow: OnboardingSlide[];
}

export interface OnboardingData {
  energyLevel?: string;
  distractionSusceptibility?: string;
  imposterSyndrome?: string;
}

export interface ProjectData {
  title: string;
  description: string;
  targetCompletionDate?: string;
  projectType?: string;
  perceivedDifficulty: number;
  motivation: string;
  knownObstacles: string[];
  skillsNeeded: string[];
}

export interface OnboardingFormData {
  [key: string]: string | number | string[];
}

export interface OnboardingFormData {
  [key: string]: string | number;
}
