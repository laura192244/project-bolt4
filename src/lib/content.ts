import { supabase } from './supabase';

export type Lang = 'hy' | 'en';

// ---- Row shapes (match the database columns) --------------------------------
export interface CourseRow {
  id: string;
  slug: string;
  title_hy: string;
  title_en: string;
  description_hy: string | null;
  description_en: string | null;
  position: number;
}

export interface SubcourseRow {
  id: string;
  course_id: string;
  title_hy: string;
  title_en: string;
  description_hy: string | null;
  description_en: string | null;
  content_hy: string | null;
  content_en: string | null;
  videos: string[];
  position: number;
}

export interface QuizRow {
  id: string;
  course_id: string | null;
  subcourse_id: string | null;
  kind: 'subcourse' | 'final';
  question_count: number;
}

export interface QuestionRow {
  id: string;
  quiz_id: string;
  question_hy: string;
  question_en: string;
  options_hy: string[];
  options_en: string[];
  correct_answer: number;
}

// ---- Small helper: pick the right language column ---------------------------
export function pick(lang: Lang, hy: string | null, en: string | null): string {
  return (lang === 'hy' ? hy : en) ?? '';
}

// ---- Queries ----------------------------------------------------------------
export async function fetchCourses(): Promise<CourseRow[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CourseRow[];
}

export async function fetchSubcourses(courseId: string): Promise<SubcourseRow[]> {
  const { data, error } = await supabase
    .from('subcourses')
    .select('*')
    .eq('course_id', courseId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data ?? []) as SubcourseRow[];
}

export async function fetchSubcourseQuiz(subcourseId: string): Promise<QuizRow | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('subcourse_id', subcourseId)
    .eq('kind', 'subcourse')
    .maybeSingle();
  if (error) throw error;
  return (data as QuizRow | null) ?? null;
}

export async function fetchFinalQuiz(courseId: string): Promise<QuizRow | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('course_id', courseId)
    .eq('kind', 'final')
    .maybeSingle();
  if (error) throw error;
  return (data as QuizRow | null) ?? null;
}

export interface CourseDashboardData {
  subcourses: SubcourseRow[];
  quizBySubcourse: Record<string, QuizRow>;
  finalQuiz: QuizRow | null;
}

export async function fetchCourseDashboard(courseId: string): Promise<CourseDashboardData> {
  const subcourses = await fetchSubcourses(courseId);
  const subIds = subcourses.map((s) => s.id);

  const quizBySubcourse: Record<string, QuizRow> = {};
  if (subIds.length > 0) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('kind', 'subcourse')
      .in('subcourse_id', subIds);
    if (error) throw error;
    for (const q of (data ?? []) as QuizRow[]) {
      if (q.subcourse_id) quizBySubcourse[q.subcourse_id] = q;
    }
  }

  const finalQuiz = await fetchFinalQuiz(courseId);
  return { subcourses, quizBySubcourse, finalQuiz };
}

export async function fetchQuestions(quizId: string): Promise<QuestionRow[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId);
  if (error) throw error;
  return (data ?? []) as QuestionRow[];
}

// ---- Quiz results (Phase 4) -------------------------------------------------
export interface ResultRow {
  id: string;
  quiz_id: string;
  course_id: string;
  subcourse_id: string | null;
  score: number;
  total: number;
  submitted_at: string;
}

export interface QuizResultInput {
  userId: string;
  quizId: string;
  courseId: string;
  subcourseId: string | null;
  score: number;
  total: number;
}

export async function saveQuizResult(input: QuizResultInput): Promise<void> {
  const { error } = await supabase.from('quiz_results').insert({
    user_id: input.userId,
    quiz_id: input.quizId,
    course_id: input.courseId,
    subcourse_id: input.subcourseId,
    score: input.score,
    total: input.total,
  });
  if (error) throw error;
}

export async function fetchCourseResults(userId: string, courseId: string): Promise<ResultRow[]> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ResultRow[];
}

export interface BestScore {
  score: number;
  total: number;
  ratio: number;
}

// Highest-percentage attempt per quiz id.
export function bestByQuiz(results: ResultRow[]): Record<string, BestScore> {
  const best: Record<string, BestScore> = {};
  for (const r of results) {
    const ratio = r.total > 0 ? r.score / r.total : 0;
    const current = best[r.quiz_id];
    if (!current || ratio > current.ratio) {
      best[r.quiz_id] = { score: r.score, total: r.total, ratio };
    }
  }
  return best;
}

// A subcourse/final quiz counts as "passed" at 60% or better.
export const PASS_RATIO = 0.6;

export async function fetchQuizById(quizId: string): Promise<QuizRow | null> {
  const { data, error } = await supabase.from('quizzes').select('*').eq('id', quizId).maybeSingle();
  if (error) throw error;
  return (data as QuizRow | null) ?? null;
}
