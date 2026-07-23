import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { QuestionRow, fetchQuestions, fetchQuizById } from '../../lib/content';
import { addQuestion, updateQuestion, deleteQuestion, updateQuizCount } from '../../lib/admin';

interface Props {
  quizId: string;
  title: string;
  onBack: () => void;
}

const inputCls =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent';

function ensure4(a: string[] | null | undefined): string[] {
  const b = Array.isArray(a) ? [...a] : [];
  while (b.length < 4) b.push('');
  return b.slice(0, 4);
}

export const AdminQuestionEditor: React.FC<Props> = ({ quizId, title, onBack }) => {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [countSaved, setCountSaved] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([fetchQuizById(quizId), fetchQuestions(quizId)])
      .then(([quiz, qs]) => {
        if (quiz) setCount(quiz.question_count);
        setQuestions(qs);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const add = async () => {
    setBusy(true);
    setError('');
    try {
      await addQuestion(quizId);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add');
    } finally {
      setBusy(false);
    }
  };

  const saveCount = async () => {
    setBusy(true);
    setError('');
    setCountSaved(false);
    try {
      await updateQuizCount(quizId, count);
      setCountSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium">
          <ArrowLeft size={18} /> {language === 'hy' ? 'Վերադառնալ' : 'Back'}
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{language === 'hy' ? 'Թեստի հարցեր' : 'Quiz questions'}</h2>
          <p className="text-slate-500 mb-4">{title}</p>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {language === 'hy' ? 'Հարցերի քանակ ամեն փորձի համար' : 'Questions shown per attempt'}
              </label>
              <input
                type="number"
                min={1}
                className={`${inputCls} w-40`}
                value={count}
                onChange={(e) => { setCount(Math.max(1, parseInt(e.target.value || '1', 10))); setCountSaved(false); }}
              />
            </div>
            <button onClick={saveCount} disabled={busy} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60">
              <Save size={16} /> {language === 'hy' ? 'Պահպանել քանակը' : 'Save count'}
            </button>
            {countSaved && (
              <span className="text-green-600 text-sm inline-flex items-center gap-1">
                <CheckCircle size={16} /> {language === 'hy' ? 'Պահպանվեց' : 'Saved'}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-3">
            {language === 'hy'
              ? `Այս ավազանն ունի ${questions.length} հարց։ Բազմազանության համար ավազանում ավելի շատ հարց պահեք, քան ցուցադրվող քանակը։`
              : `This pool has ${questions.length} question(s). For real variety, keep more questions in the pool than the number shown per attempt.`}
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {loading && <p className="text-center text-slate-500">{language === 'hy' ? 'Բեռնվում է...' : 'Loading...'}</p>}

        <div className="space-y-5">
          {questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i} onDeleted={load} />
          ))}
        </div>

        <button onClick={add} disabled={busy} className="mt-6 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-60">
          <Plus size={18} /> {language === 'hy' ? 'Ավելացնել հարց' : 'Add question'}
        </button>
      </div>
    </div>
  );
};

const QuestionCard: React.FC<{ q: QuestionRow; index: number; onDeleted: () => void }> = ({ q, index, onDeleted }) => {
  const { language } = useLanguage();
  const [qHy, setQHy] = useState(q.question_hy);
  const [qEn, setQEn] = useState(q.question_en);
  const [optsHy, setOptsHy] = useState<string[]>(ensure4(q.options_hy));
  const [optsEn, setOptsEn] = useState<string[]>(ensure4(q.options_en));
  const [correct, setCorrect] = useState(q.correct_answer);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateQuestion(q.id, {
        question_hy: qHy,
        question_en: qEn,
        options_hy: optsHy,
        options_en: optsEn,
        correct_answer: correct,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm(language === 'hy' ? 'Ջնջե՞լ հարցը։' : 'Delete this question?')) return;
    try {
      await deleteQuestion(q.id);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800">{language === 'hy' ? 'Հարց' : 'Question'} {index + 1}</h3>
        <button onClick={del} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <input className={inputCls} placeholder="Հարց (Armenian)" value={qHy} onChange={(e) => { setQHy(e.target.value); setSaved(false); }} />
        <input className={inputCls} placeholder="Question (English)" value={qEn} onChange={(e) => { setQEn(e.target.value); setSaved(false); }} />
      </div>

      <p className="text-xs font-medium text-slate-500 mb-2">
        {language === 'hy' ? 'Ընտրեք ճիշտ պատասխանը (●)' : 'Select the correct answer (●)'}
      </p>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((oi) => (
          <div key={oi} className={`flex items-center gap-2 p-2 rounded-lg border ${correct === oi ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}>
            <input type="radio" name={`correct-${q.id}`} checked={correct === oi} onChange={() => { setCorrect(oi); setSaved(false); }} className="flex-shrink-0" />
            <input className={inputCls} placeholder={`Տարբերակ ${oi + 1} (HY)`} value={optsHy[oi]} onChange={(e) => { const n = [...optsHy]; n[oi] = e.target.value; setOptsHy(n); setSaved(false); }} />
            <input className={inputCls} placeholder={`Option ${oi + 1} (EN)`} value={optsEn[oi]} onChange={(e) => { const n = [...optsEn]; n[oi] = e.target.value; setOptsEn(n); setSaved(false); }} />
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-60">
          <Save size={16} /> {saving ? (language === 'hy' ? 'Պահպանվում է...' : 'Saving...') : (language === 'hy' ? 'Պահպանել հարցը' : 'Save question')}
        </button>
        {saved && (
          <span className="text-green-600 text-sm inline-flex items-center gap-1">
            <CheckCircle size={16} /> {language === 'hy' ? 'Պահպանվեց' : 'Saved'}
          </span>
        )}
      </div>
    </div>
  );
};
