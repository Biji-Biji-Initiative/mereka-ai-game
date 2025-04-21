export interface FocusArea {
  id: string;
  name: string;
  description: string;
  matchLevel: number;
  icon?: string;
  color?: string;
}

export interface FocusAreaSelection {
  focusAreaId: string;
  personalityContext: {
    traits: Array<{
      id: string;
      name: string;
      description: string;
      value: number;
    }>;
    attitudes: Array<{
      id: string;
      name: string;
      description: string;
      value: number;
    }>;
  };
  professionalContext: {
    title?: string;
    location?: string;
  };
}
