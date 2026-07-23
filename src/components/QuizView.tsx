import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { QuizRow, QuestionRow, fetchQuestions, saveQuizResult, pick } from '../lib/content';

interface Props {
  quiz: QuizRow;
  title: string;
  courseId: string;
  subcourseId: string | null;
  onBack: () => void;
}

interface PreparedQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const QuizView: React.FC<Props> = ({ quiz, title, courseId, subcourseId, onBack }) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pool, setPool] = useState<QuestionRow[]>([]);
  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const prepare = (rows: QuestionRow[]) => {
    const count = quiz.question_count > 0 ? quiz.question_count : rows.length;
    const chosen = shuffle(rows).slice(0, Math.min(count, rows.length));
    const prepared: PreparedQuestion[] = chosen.map((r) => {
      const opts = language === 'hy' ? r.options_hy : r.options_en;
      const correctText = opts[r.correct_answer];
      const shuffledOpts = shuffle(opts);
      return {
        id: r.id,
        question: pick(language, r.question_hy, r.question_en),
        options: shuffledOpts,
        correctIndex: shuffledOpts.indexOf(correctText),
      };
    });
    setQuestions(prepared);
    setAnswers(new Array(prepared.length).fill(-1));
    setSubmitted(false);
    setSaved(false);
    setSaveError('');
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchQuestions(quiz.id)
      .then((rows) => { if (active) { setPool(rows); prepare(rows); setError(''); } })
      .catch((e) => { if (active) setError(e.message ?? 'Failed to load'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id, language]);

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const handleSubmit = async () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!user) return;
    try {
      setSaveError('');
      await saveQuizResult({
        userId: user.id,
        quizId: quiz.id,
        courseId,
        subcourseId,
        score,
        total: questions.length,
      });
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save result');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
        <ArrowLeft size={18} /> {language === 'hy' ? 'Վերադառնալ' : 'Back'}
      </button>

      <div className="card p-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">{title}</h2>

        {loading && <p className="text-slate-500">{language === 'hy' ? 'Բեռնվում է...' : 'Loading...'}</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && questions.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-500">
            {language === 'hy' ? 'Այս թեստը դեռ հարցեր չունի։' : 'This quiz has no questions yet.'}
          </div>
        )}

        {!loading && questions.length > 0 && !submitted && (
          <>
            <div className="space-y-8">
              {questions.map((q, qi) => (
                <div key={q.id}>
                  <p className="mb-3 font-semibold text-slate-900">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const selected = answers[qi] === oi;
                      return (
                        <label
                          key={oi}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                            selected ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            checked={selected}
                            onChange={() => { const next = [...answers]; next[qi] = oi; setAnswers(next); }}
                            className="sr-only"
                          />
                          <span className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-sm font-bold ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="text-slate-800">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={answers.includes(-1)} className="btn-primary mt-8 w-full py-4">
              {language === 'hy' ? 'Ուղարկել' : 'Submit'}
            </button>
          </>
        )}

        {submitted && (
          <>
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-6 text-center text-white shadow-soft">
              <p className="text-sm font-medium text-white/80">{language === 'hy' ? 'Ձեր արդյունքը' : 'Your score'}</p>
              <p className="mt-1 text-4xl font-bold">{score}/{questions.length}</p>
              <p className="mt-1 text-white/90">{pct}%</p>
              {saved && <p className="mt-2 text-sm text-white/90">{language === 'hy' ? 'Պահպանվեց ✓' : 'Saved ✓'}</p>}
              {saveError && <p className="mt-2 text-sm text-accent-100">{language === 'hy' ? 'Չհաջողվեց պահպանել' : "Couldn't save"}</p>}
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => {
                const correct = answers[i] === q.correctIndex;
                return (
                  <div key={q.id} className={`rounded-xl border p-4 ${correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                    <div className="mb-2 flex items-center gap-2">
                      {correct ? <CheckCircle size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                      <p className="font-semibold text-slate-900">{q.question}</p>
                    </div>
                    <p className="text-sm text-slate-700">
                      {language === 'hy' ? 'Ձեր պատասխանը՝ ' : 'Your answer: '}
                      <span className={correct ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>{q.options[answers[i]]}</span>
                    </p>
                    {!correct && (
                      <p className="mt-1 text-sm font-medium text-emerald-600">
                        {language === 'hy' ? 'Ճիշտ պատասխանը՝ ' : 'Correct answer: '}
                        {q.options[q.correctIndex]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={() => prepare(pool)} className="btn-primary mt-6">
              <RotateCcw size={18} /> {language === 'hy' ? 'Կրկին փորձել' : 'Retry'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
