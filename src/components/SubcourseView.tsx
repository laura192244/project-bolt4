import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import NotoSansArmenian from '../fonts/NotoSansArmenian-normal.js';
import { useLanguage } from '../contexts/LanguageContext';
import { CourseRow, SubcourseRow, QuizRow, fetchSubcourseQuiz, pick } from '../lib/content';

interface Props {
  course: CourseRow;
  subcourse: SubcourseRow;
  onBack: () => void;
  onStartQuiz: (quiz: QuizRow, title: string) => void;
}

function youTubeId(url: string): string | null {
  try {
    if (url.includes('youtu.be')) return url.split('/').pop()?.split('?')[0] ?? null;
    return new URL(url).searchParams.get('v');
  } catch {
    return null;
  }
}

export const SubcourseView: React.FC<Props> = ({ course, subcourse, onBack, onStartQuiz }) => {
  const { language } = useLanguage();
  const content = pick(language, subcourse.content_hy, subcourse.content_en);
  const title = pick(language, subcourse.title_hy, subcourse.title_en);

  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(600);
  const [quiz, setQuiz] = useState<QuizRow | null>(null);

  useEffect(() => {
    let active = true;
    fetchSubcourseQuiz(subcourse.id)
      .then((q) => { if (active) setQuiz(q); })
      .catch(() => {});
    return () => { active = false; };
  }, [subcourse.id]);

  const highlight = (text: string) => {
    if (!search.trim()) return text;
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safe})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? <mark key={i} className="rounded bg-accent-100 px-0.5 text-accent-600">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };

  const downloadPdf = () => {
    const pdf = new jsPDF();
    pdf.addFileToVFS('NotoSansArmenian.ttf', NotoSansArmenian);
    pdf.addFont('NotoSansArmenian.ttf', 'NotoSansArmenian', 'normal');
    pdf.setFont('NotoSansArmenian');
    const lines = pdf.splitTextToSize(content, 180);
    pdf.text(lines, 10, 10);
    pdf.save(`${pick(language, course.title_hy, course.title_en)} - ${title}.pdf`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
        <ArrowLeft size={18} /> {language === 'hy' ? 'Վերադառնալ' : 'Back'}
      </button>

      <div className="card p-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>

        {subcourse.videos.length > 0 && (
          <div className="mb-8 grid gap-5 sm:grid-cols-2">
            {subcourse.videos.map((url, i) => {
              const id = youTubeId(url.trim());
              if (!id) return null;
              return (
                <iframe
                  key={i}
                  className="aspect-video w-full rounded-xl shadow-card"
                  src={`https://www.youtube.com/embed/${id}`}
                  title={`Video ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              );
            })}
          </div>
        )}

        <div className="relative mb-5">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hy' ? 'Որոնել բովանդակության մեջ...' : 'Search the content...'}
            className="field pl-10"
          />
        </div>

        <div className="whitespace-pre-wrap leading-relaxed text-slate-700">{highlight(content.slice(0, visible))}</div>

        {visible < content.length && (
          <div className="mt-6 text-center">
            <button onClick={() => setVisible((v) => v + 600)} className="btn-soft px-6">
              {language === 'hy' ? 'Դիտել ավելին' : 'Show more'}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button onClick={downloadPdf} className="btn-ghost flex-1">
            <Download size={18} /> {language === 'hy' ? 'Ներբեռնել PDF' : 'Download PDF'}
          </button>
          {quiz && (
            <button onClick={() => onStartQuiz(quiz, title)} className="btn-primary flex-1">
              {language === 'hy' ? 'Սկսել թեստը' : 'Start Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
