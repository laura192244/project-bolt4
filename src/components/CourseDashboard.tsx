import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Trophy, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  CourseRow,
  SubcourseRow,
  QuizRow,
  CourseDashboardData,
  ResultRow,
  BestScore,
  PASS_RATIO,
  fetchCourseDashboard,
  fetchCourseResults,
  bestByQuiz,
  pick,
} from '../lib/content';

interface Props {
  course: CourseRow;
  onBack: () => void;
  onOpenSubcourse: (sub: SubcourseRow) => void;
  onStartQuiz: (quiz: QuizRow, title: string, subcourseId: string | null) => void;
}

const ProgressRing: React.FC<{ percent: number }> = ({ percent }) => {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative grid h-16 w-16 flex-shrink-0 place-items-center">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-slate-200" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-brand-500 transition-all duration-700"
          style={{ strokeDasharray: circ, strokeDashoffset: offset }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-700">{percent}%</span>
    </div>
  );
};

export const CourseDashboard: React.FC<Props> = ({ course, onBack, onOpenSubcourse, onStartQuiz }) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [data, setData] = useState<CourseDashboardData | null>(null);
  const [best, setBest] = useState<Record<string, BestScore>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetchCourseDashboard(course.id),
      user ? fetchCourseResults(user.id, course.id) : Promise.resolve([] as ResultRow[]),
    ])
      .then(([d, results]) => {
        if (!active) return;
        setData(d);
        setBest(bestByQuiz(results));
        setError('');
      })
      .catch((e) => { if (active) setError(e.message ?? 'Failed to load'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [course.id, user]);

  const subcourses = data?.subcourses ?? [];
  const passedCount = subcourses.filter((s) => {
    const quiz = data?.quizBySubcourse[s.id];
    const b = quiz ? best[quiz.id] : undefined;
    return b ? b.ratio >= PASS_RATIO : false;
  }).length;
  const progress = subcourses.length > 0 ? Math.round((passedCount / subcourses.length) * 100) : 0;
  const finalBest = data?.finalQuiz ? best[data.finalQuiz.id] : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
        <ArrowLeft size={18} /> {language === 'hy' ? 'Բոլոր դասընթացները' : 'All courses'}
      </button>

      <div className="card mb-8 flex items-center justify-between gap-6 p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{pick(language, course.title_hy, course.title_en)}</h1>
          <p className="mt-2 text-slate-600">{pick(language, course.description_hy, course.description_en)}</p>
          <p className="mt-3 text-sm text-slate-500">
            {passedCount}/{subcourses.length} {language === 'hy' ? 'դաս անցած' : 'lessons passed'}
          </p>
        </div>
        <ProgressRing percent={progress} />
      </div>

      {error && <p className="mb-4 text-center text-red-600">{error}</p>}

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-6 w-1/3" />
              <div className="skeleton mt-3 h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        data && (
          <>
            <h2 className="mb-4 text-lg font-bold text-slate-800">{language === 'hy' ? 'Դասեր' : 'Lessons'}</h2>

            <div className="space-y-4">
              {subcourses.map((sub, i) => {
                const quiz = data.quizBySubcourse[sub.id];
                const b = quiz ? best[quiz.id] : undefined;
                const passed = b ? b.ratio >= PASS_RATIO : false;
                const subTitle = pick(language, sub.title_hy, sub.title_en);
                return (
                  <div
                    key={sub.id}
                    className="card animate-fade-in flex flex-col gap-4 p-6 transition-shadow hover:shadow-soft sm:flex-row sm:items-center sm:justify-between"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-full font-bold ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
                        {passed ? <CheckCircle size={22} /> : i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{subTitle}</h3>
                        <p className="text-sm text-slate-500">{pick(language, sub.description_hy, sub.description_en)}</p>
                        {b && (
                          <span className={`badge mt-1.5 ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {language === 'hy' ? 'Լավագույն' : 'Best'}: {b.score}/{b.total}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                      <button onClick={() => onOpenSubcourse(sub)} className="btn-ghost px-4 py-2 text-sm">
                        <FileText size={16} /> {language === 'hy' ? 'Բացել' : 'Open'}
                      </button>
                      {quiz && (
                        <button onClick={() => onStartQuiz(quiz, subTitle, sub.id)} className="btn-primary px-4 py-2 text-sm">
                          {language === 'hy' ? 'Թեստ' : 'Quiz'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {subcourses.length === 0 && (
                <div className="card p-8 text-center text-slate-500">{language === 'hy' ? 'Դասեր չկան։' : 'No lessons yet.'}</div>
              )}
            </div>

            <h2 className="mb-4 mt-10 text-lg font-bold text-slate-800">{language === 'hy' ? 'Եզրափակիչ թեստ' : 'Final Quiz'}</h2>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-6 text-white shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-white/15">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">{language === 'hy' ? 'Դասընթացի եզրափակիչ թեստ' : 'Course Final Quiz'}</h3>
                    <p className="text-sm text-white/80">
                      {language === 'hy' ? 'Ստուգեք ամբողջ դասընթացի գիտելիքները' : 'Test your knowledge of the whole course'}
                    </p>
                    {finalBest && (
                      <span className="badge mt-1.5 bg-white/20 text-white">
                        {language === 'hy' ? 'Լավագույն' : 'Best'}: {finalBest.score}/{finalBest.total}
                      </span>
                    )}
                  </div>
                </div>
                {data.finalQuiz ? (
                  <button
                    onClick={() => onStartQuiz(data.finalQuiz!, language === 'hy' ? 'Եզրափակիչ թեստ' : 'Final Quiz', null)}
                    className="flex-shrink-0 rounded-xl bg-white px-6 py-2.5 font-semibold text-brand-700 transition-transform hover:scale-[1.03]"
                  >
                    {language === 'hy' ? 'Սկսել' : 'Start'}
                  </button>
                ) : (
                  <span className="flex-shrink-0 text-sm text-white/80">{language === 'hy' ? 'Շուտով' : 'Coming soon'}</span>
                )}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};
