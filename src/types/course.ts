export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Course {
  videos: any;
  id: string;
  title: string;
  description: string;
  pdfContent: string;
  quiz: Question[];
}
