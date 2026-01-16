
export type Language = 'en' | 'hi';

export interface PersonalityResult {
  id: string;
  title: string;
  description: string;
  reportDescription: string;
  darkLine: string; 
  color: string;
  shareHook: string;
  traits: string[];
  weaknesses: string[];
}

export enum AppState {
  INITIAL = 'INITIAL',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  PRIVACY = 'PRIVACY',
  ABOUT = 'ABOUT'
}
