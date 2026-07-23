import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CourseRow, SubcourseRow, QuizRow, fetchCourses, pick } from '../lib/content';
import { CourseDashboard } from '../components/CourseDashboard';
import { SubcourseView } from '../components/SubcourseView';
import { QuizView } from '../components/QuizView';

interface QuizContext {
  quiz: QuizRow;
  title: string;
  courseId: string;
  subcourseId: string | null;
}

export const Courses: React.FC = () => {
  const { language, t } = useLanguage();

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);
  const [selectedSubcourse, setSelectedSubcourse] = useState<SubcourseRow | null>(null);
  const [quizCtx, setQuizCtx] = useState<QuizContext | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCourses()
      .then((data) => { if (active) { setCourses(data); setError(''); } })
      .catch((e) => { if (active) setError(e.message ?? 'Failed to load courses'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (quizCtx) {
    return (
      <QuizView
        quiz={quizCtx.quiz}
        title={quizCtx.title}
        courseId={quizCtx.courseId}
        subcourseId={quizCtx.subcourseId}
        onBack={() => setQuizCtx(null)}
      />
    );
  }

  if (selectedSubcourse && selectedCourse) {
    return (
      <SubcourseView
        course={selectedCourse}
        subcourse={selectedSubcourse}
        onBack={() => setSelectedSubcourse(null)}
        onStartQuiz={(quiz, title) =>
          setQuizCtx({ quiz, title, courseId: selectedCourse.id, subcourseId: selectedSubcourse.id })
        }
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseDashboard
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onOpenSubcourse={(sub) => setSelectedSubcourse(sub)}
        onStartQuiz={(quiz, title, subcourseId) =>
          setQuizCtx({ quiz, title, courseId: selectedCourse.id, subcourseId })
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{t.courses.title}</h1>
        <p className="mt-3 text-slate-600">
          {language === 'hy' ? 'Ընտրեք դասընթաց և սկսեք սովորել' : 'Pick a course and start learning'}
        </p>
      </div>

      {error && <p className="mb-6 text-center text-red-600">{error}</p>}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card p-7">
              <div className="flex gap-4">
                <div className="skeleton h-14 w-14 flex-shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="skeleton h-5 w-1/2" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          {language === 'hy' ? 'Դասընթացներ դեռ չկան։' : 'No courses yet.'}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course, i) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="card group animate-fade-in p-7 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-soft"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-soft">
                  <BookOpen size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{pick(language, course.title_hy, course.title_en)}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{pick(language, course.description_hy, course.description_en)}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-brand-600">
                {language === 'hy' ? 'Բացել դասընթացը' : 'Open course'}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
