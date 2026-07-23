import { supabase } from './supabase';
import { CourseRow, SubcourseRow } from './content';

// All writes here are allowed only for admins — enforced by the database RLS
// policies (is_admin()). The UI also hides these screens from non-admins.

// ---- Courses ----------------------------------------------------------------
export interface CourseInput {
  slug: string;
  title_hy: string;
  title_en: string;
  description_hy: string;
  description_en: string;
  position: number;
}

export async function createCourse(input: CourseInput): Promise<CourseRow> {
  const { data, error } = await supabase.from('courses').insert(input).select().single();
  if (error) throw error;
  const course = data as CourseRow;
  // Every course owns one (initially empty) final quiz.
  const { error: qErr } = await supabase.from('quizzes').insert({
    course_id: course.id,
    subcourse_id: null,
    kind: 'final',
    question_count: 10,
  });
  if (qErr) throw qErr;
  return course;
}

export async function updateCourse(id: string, patch: Partial<CourseInput>): Promise<void> {
  const { error } = await supabase.from('courses').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteCourse(id: string): Promise<void> {
  // FK cascade removes its subcourses, quizzes, questions and results.
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}

// ---- Subcourses -------------------------------------------------------------
export interface SubcourseInput {
  course_id: string;
  title_hy: string;
  title_en: string;
  description_hy: string;
  description_en: string;
  content_hy: string;
  content_en: string;
  videos: string[];
  position: number;
}

export async function createSubcourse(input: SubcourseInput): Promise<SubcourseRow> {
  const { data, error } = await supabase.from('subcourses').insert(input).select().single();
  if (error) throw error;
  const sub = data as SubcourseRow;
  // Every subcourse owns one (initially empty) quiz.
  const { error: qErr } = await supabase.from('quizzes').insert({
    course_id: null,
    subcourse_id: sub.id,
    kind: 'subcourse',
    question_count: 5,
  });
  if (qErr) throw qErr;
  return sub;
}

export async function updateSubcourse(id: string, patch: Partial<SubcourseInput>): Promise<void> {
  const { error } = await supabase.from('subcourses').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteSubcourse(id: string): Promise<void> {
  const { error } = await supabase.from('subcourses').delete().eq('id', id);
  if (error) throw error;
}

// ---- Reorder: swap the `position` of two rows in the same table -------------
export async function swapPositions(
  table: 'courses' | 'subcourses',
  a: { id: string; position: number },
  b: { id: string; position: number }
): Promise<void> {
  const { error: e1 } = await supabase.from(table).update({ position: b.position }).eq('id', a.id);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from(table).update({ position: a.position }).eq('id', b.id);
  if (e2) throw e2;
}

// ---- Quiz questions ---------------------------------------------------------
export interface QuestionInput {
  question_hy: string;
  question_en: string;
  options_hy: string[];
  options_en: string[];
  correct_answer: number;
}

export async function addQuestion(quizId: string): Promise<void> {
  const { error } = await supabase.from('quiz_questions').insert({
    quiz_id: quizId,
    question_hy: '',
    question_en: '',
    options_hy: ['', '', '', ''],
    options_en: ['', '', '', ''],
    correct_answer: 0,
  });
  if (error) throw error;
}

export async function updateQuestion(id: string, patch: QuestionInput): Promise<void> {
  const { error } = await supabase.from('quiz_questions').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
  if (error) throw error;
}

export async function updateQuizCount(quizId: string, questionCount: number): Promise<void> {
  const { error } = await supabase.from('quizzes').update({ question_count: questionCount }).eq('id', quizId);
  if (error) throw error;
}
