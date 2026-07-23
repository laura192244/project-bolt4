import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown, ListChecks, Trophy } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CourseRow, SubcourseRow, CourseDashboardData, fetchCourseDashboard, pick } from '../../lib/content';
import { createSubcourse, deleteSubcourse, swapPositions } from '../../lib/admin';

interface Props {
  course: CourseRow;
  onBack: () => void;
  onEditSubcourse: (sub: SubcourseRow) => void;
  onEditQuiz: (quizId: string, title: string) => void;
}

export const AdminCourseEditor: React.FC<Props> = ({ course, onBack, onEditSubcourse, onEditQuiz }) => {
  const { language } = useLanguage();
  const [data, setData] = useState<CourseDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    fetchCourseDashboard(course.id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  const subs = data?.subcourses ?? [];

  const addLesson = async () => {
    setBusy(true);
    setError('');
    try {
      const position = subs.length ? Math.max(...subs.map((s) => s.position)) + 1 : 1;
      const sub = await createSubcourse({
        course_id: course.id,
        title_hy: 'Նոր դաս',
        title_en: 'New lesson',
        description_hy: '',
        description_en: '',
        content_hy: '',
        content_en: '',
        videos: [],
        position,
      });
      onEditSubcourse(sub);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add lesson');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (sub: SubcourseRow) => {
    if (!confirm(language === 'hy' ? 'Ջնջե՞լ այս ենթադասընթացը։' : 'Delete this lesson?')) return;
    setBusy(true);
    try {
      await deleteSubcourse(sub.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= subs.length) return;
    setBusy(true);
    try {
      await swapPositions('subcourses', subs[i], subs[j]);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reorder');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium">
          <ArrowLeft size={18} /> {language === 'hy' ? 'Բոլոր դասընթացները' : 'All courses'}
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{pick(language, course.title_hy, course.title_en)}</h1>
            <p className="text-slate-500 text-sm mt-1">/{course.slug}</p>
          </div>
          <button
            onClick={addLesson}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60 transition-colors flex-shrink-0"
          >
            <Plus size={18} /> {language === 'hy' ? 'Նոր դաս' : 'New lesson'}
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {loading && <p className="text-center text-slate-500">{language === 'hy' ? 'Բեռնվում է...' : 'Loading...'}</p>}

        <div className="space-y-3">
          {subs.map((sub, i) => {
            const quiz = data?.quizBySubcourse[sub.id];
            const subTitle = pick(language, sub.title_hy, sub.title_en);
            return (
              <div key={sub.id} className="bg-white rounded-2xl shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0 || busy} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === subs.length - 1 || busy} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{subTitle}</h3>
                    <p className="text-slate-500 text-sm">{pick(language, sub.description_hy, sub.description_en)}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEditSubcourse(sub)}
                    className="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit size={16} /> {language === 'hy' ? 'Խմբագրել' : 'Edit'}
                  </button>
                  {quiz && (
                    <button
                      onClick={() => onEditQuiz(quiz.id, subTitle)}
                      className="inline-flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <ListChecks size={16} /> {language === 'hy' ? 'Թեստ' : 'Quiz'}
                    </button>
                  )}
                  <button
                    onClick={() => remove(sub)}
                    className="inline-flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {!loading && subs.length === 0 && (
            <p className="text-slate-500">{language === 'hy' ? 'Ենթադասընթացներ չկան։ Ավելացրեք առաջինը։' : 'No lessons yet. Add the first one.'}</p>
          )}
        </div>

        {data?.finalQuiz && (
          <>
            <h2 className="text-xl font-bold text-slate-800 mt-10 mb-4">{language === 'hy' ? 'Եզրափակիչ թեստ' : 'Final Quiz'}</h2>
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="flex-shrink-0" />
                <span className="font-semibold">{language === 'hy' ? 'Դասընթացի եզրափակիչ թեստ' : 'Course final quiz'}</span>
              </div>
              <button
                onClick={() => onEditQuiz(data.finalQuiz!.id, language === 'hy' ? 'Եզրափակիչ թեստ' : 'Final quiz')}
                className="bg-white text-brand-700 px-4 py-2 rounded-lg font-semibold hover:bg-brand-50 transition-colors flex-shrink-0"
              >
                {language === 'hy' ? 'Հարցեր' : 'Questions'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
