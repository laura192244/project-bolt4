import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Settings, X, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { CourseRow, SubcourseRow, fetchCourses, pick } from '../lib/content';
import { createCourse, updateCourse, deleteCourse, swapPositions } from '../lib/admin';
import { AdminCourseEditor } from '../components/admin/AdminCourseEditor';
import { AdminSubcourseEditor } from '../components/admin/AdminSubcourseEditor';
import { AdminQuestionEditor } from '../components/admin/AdminQuestionEditor';

interface CourseForm {
  id?: string;
  slug: string;
  title_hy: string;
  title_en: string;
  description_hy: string;
  description_en: string;
}

const inputCls =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent';

export const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const { language } = useLanguage();

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);
  const [selectedSubcourse, setSelectedSubcourse] = useState<SubcourseRow | null>(null);
  const [quizEditing, setQuizEditing] = useState<{ quizId: string; title: string } | null>(null);
  const [form, setForm] = useState<CourseForm | null>(null);

  const load = () => {
    setLoading(true);
    fetchCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        {language === 'hy' ? 'Հասանելի չէ' : 'Not authorized'}
      </div>
    );
  }

  // --- Quiz question editor ---
  if (quizEditing) {
    return <AdminQuestionEditor quizId={quizEditing.quizId} title={quizEditing.title} onBack={() => setQuizEditing(null)} />;
  }

  // --- Lesson editor ---
  if (selectedSubcourse && selectedCourse) {
    return <AdminSubcourseEditor subcourse={selectedSubcourse} onBack={() => setSelectedSubcourse(null)} />;
  }

  // --- Course editor (its lessons) ---
  if (selectedCourse) {
    return (
      <AdminCourseEditor
        course={selectedCourse}
        onBack={() => { setSelectedCourse(null); load(); }}
        onEditSubcourse={setSelectedSubcourse}
        onEditQuiz={(quizId, title) => setQuizEditing({ quizId, title })}
      />
    );
  }

  const saveCourse = async () => {
    if (!form) return;
    if (!form.slug || !form.title_hy || !form.title_en) {
      setError(language === 'hy' ? 'Լրացրեք slug-ը և վերնագրերը' : 'Fill in slug and both titles');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (form.id) {
        await updateCourse(form.id, {
          slug: form.slug,
          title_hy: form.title_hy,
          title_en: form.title_en,
          description_hy: form.description_hy,
          description_en: form.description_en,
        });
      } else {
        const position = courses.length ? Math.max(...courses.map((c) => c.position)) + 1 : 1;
        await createCourse({
          slug: form.slug,
          title_hy: form.title_hy,
          title_en: form.title_en,
          description_hy: form.description_hy,
          description_en: form.description_en,
          position,
        });
      }
      setForm(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: CourseRow) => {
    if (!confirm(language === 'hy' ? 'Ջնջե՞լ դասընթացը և ԱՄԲՈՂՋ բովանդակությունը։' : 'Delete this course and ALL its content?')) return;
    setBusy(true);
    try {
      await deleteCourse(c.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= courses.length) return;
    setBusy(true);
    try {
      await swapPositions('courses', courses[i], courses[j]);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reorder');
    } finally {
      setBusy(false);
    }
  };

  // --- Course create/edit form ---
  if (form) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {form.id ? (language === 'hy' ? 'Խմբագրել դասընթացը' : 'Edit course') : (language === 'hy' ? 'Նոր դասընթաց' : 'New course')}
              </h2>
              <button onClick={() => { setForm(null); setError(''); }} className="text-slate-500 hover:text-slate-800">
                <X size={22} />
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug ({language === 'hy' ? 'եզակի, օր. sql' : 'unique, e.g. sql'})</label>
              <input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Վերնագիր (Armenian)</label>
                <input className={inputCls} value={form.title_hy} onChange={(e) => setForm({ ...form, title_hy: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
                <input className={inputCls} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Նկարագրություն (Armenian)</label>
                <textarea className={inputCls} rows={3} value={form.description_hy} onChange={(e) => setForm({ ...form, description_hy: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
                <textarea className={inputCls} rows={3} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveCourse} disabled={busy} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-60 transition-colors">
                <Save size={18} /> {busy ? (language === 'hy' ? 'Պահպանվում է...' : 'Saving...') : (language === 'hy' ? 'Պահպանել' : 'Save')}
              </button>
              <button onClick={() => { setForm(null); setError(''); }} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-lg font-semibold transition-colors">
                {language === 'hy' ? 'Չեղարկել' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Course list ---
  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-800">{language === 'hy' ? 'Ադմին պանել' : 'Admin panel'}</h1>
          <button
            onClick={() => { setForm({ slug: '', title_hy: '', title_en: '', description_hy: '', description_en: '' }); setError(''); }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-3 rounded-lg font-semibold shadow-lg hover:from-brand-700 hover:to-brand-600 transition-all"
          >
            <Plus size={20} /> {language === 'hy' ? 'Նոր դասընթաց' : 'New course'}
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {loading && <p className="text-center text-slate-500">{language === 'hy' ? 'Բեռնվում է...' : 'Loading...'}</p>}

        <div className="space-y-3">
          {courses.map((c, i) => (
            <div key={c.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} disabled={i === 0 || busy} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === courses.length - 1 || busy} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ArrowDown size={16} />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{pick(language, c.title_hy, c.title_en)}</h3>
                  <p className="text-slate-500 text-sm">/{c.slug}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelectedCourse(c)}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Settings size={16} /> {language === 'hy' ? 'Դասեր' : 'Lessons'}
                </button>
                <button
                  onClick={() => setForm({ id: c.id, slug: c.slug, title_hy: c.title_hy, title_en: c.title_en, description_hy: c.description_hy ?? '', description_en: c.description_en ?? '' })}
                  className="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit size={16} /> {language === 'hy' ? 'Խմբագրել' : 'Edit'}
                </button>
                <button
                  onClick={() => remove(c)}
                  className="inline-flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {!loading && courses.length === 0 && (
            <p className="text-slate-500">{language === 'hy' ? 'Դասընթացներ չկան։' : 'No courses yet.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};
