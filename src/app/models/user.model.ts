export interface TraitAnswer {
  questionId: number;
  answer: number;
}

export interface TraitsData {
  answers: TraitAnswer[];
  questions: any[];
}

export interface AttitudeAnswer {
  questionId: number;
  answer: number;
}

export interface AttitudesData {
  answers: AttitudeAnswer[];
  questions: any[];
}

export interface UserContext {
  name: string;
  email: string;
  professionalTitle: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  professionalTitle: string;
  location: string;
  currentRoute: string;
  isAnonymous: boolean;
  authId: string | null;
  createdAt: any;
  updatedAt: any;
  traits?: TraitsData;
  attitudes?: AttitudesData;
  rounds?: {
    [key: string]: {
      comparison?: {
        differences?: string[];
        similarities?: string[];
      };
      decisions?: {
        [key: string]: any;
      };
      outcomes?: {
        [key: string]: any;
      };
    };
  };
  challenges?: Array<{
    id: string;
    title: string;
    focusArea: string;
    score: number;
    date: Date;
  }>;
}
