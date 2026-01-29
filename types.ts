
export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  COMPLEX_CHOICE = 'COMPLEX_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MATCHING = 'MATCHING',
  TRUE_FALSE = 'TRUE_FALSE',
  AGREE_DISAGREE = 'AGREE_DISAGREE'
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // For MCQ types
  matchingPairs?: MatchingPair[]; // For Matching
  correctAnswer: any; // string, string[], or id-pair mapping
  weight: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  token: string;
  questions: Question[];
  createdAt: number;
  totalResults: number;
}

export interface StudentResult {
  id: string;
  examId: string;
  studentName: string;
  studentId: string;
  score: number;
  totalPossibleScore: number;
  answers: Record<string, any>;
  timestamp: number;
}

export type UserRole = 'GURU' | 'SISWA';
