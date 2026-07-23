import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SubcourseRow } from '../../lib/content';
import { updateSubcourse } from '../../lib/admin';

interface Props {
  subcourse: SubcourseRow;
  onBack: () => void;
}

const inputCls =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent';

export const AdminSubcourseEditor: React.FC<Props> = ({ subcourse, onBack }) => {
  const { language } = useLanguage();

  const [titleHy, setTitleHy] = useState(subcourse.title_hy);
  const [titleEn, setTitleEn] = useState(subcourse.title_en);
  const [descHy, setDescHy] = useState(subcourse.description_hy ?? '');
  const [descEn, setDescEn] = useState(subcourse.description_en ?? '');
  const [contentHy, setContentHy] = useState(subcourse.content_hy ?? '');
  const [contentEn, setContentEn] = useState(subcourse.content_en ?? '');
  const [videos, setVideos] = useState<string[]>(subcourse.videos ?? []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      await updateSubcourse(subcourse.id, {
        title_hy: titleHy,
        title_en: titleEn,
        description_hy: descHy,
        description_en: descEn,
        content_hy: contentHy,
        content_en: contentEn,
        videos: videos.map((v) => v.trim()).filter((v) => v.length > 0),
      });
      setSavedMsg(language === 'hy' ? 'Պահպանվեց ✓' : 'Saved ✓');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium">
          <ArrowLeft size={18} /> {language === 'hy' ? 'Վերադառնալ' : 'Back'}
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-2xl font-bold text-slate-800">
            {language === 'hy' ? 'Ենթադասընթացի խմբագրում' : 'Edit lesson'}
          </h2>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          {savedMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{savedMsg}</div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Վերնագիր (Armenian)</label>
              <input className={inputCls} value={titleHy} onChange={(e) => setTitleHy(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
              <input className={inputCls} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Նկարագրություն (Armenian)</label>
              <textarea className={inputCls} rows={2} value={descHy} onChange={(e) => setDescHy(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
              <textarea className={inputCls} rows={2} value={descEn} onChange={(e) => setDescEn(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Բովանդակություն (Armenian)</label>
            <textarea className={`${inputCls} font-mono text-sm`} rows={10} value={contentHy} onChange={(e) => setContentHy(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content (English)</label>
            <textarea className={`${inputCls} font-mono text-sm`} rows={10} value={contentEn} onChange={(e) => setContentEn(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {language === 'hy' ? 'YouTube տեսանյութեր' : 'YouTube videos'}
            </label>
            {videos.map((v, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className={inputCls}
                  value={v}
                  placeholder="https://youtu.be/..."
                  onChange={(e) => {
                    const next = [...videos];
                    next[i] = e.target.value;
                    setVideos(next);
                  }}
                />
                <button onClick={() => setVideos(videos.filter((_, j) => j !== i))} className="text-red-600 hover:text-red-800 px-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button onClick={() => setVideos([...videos, ''])} className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium">
              <Plus size={16} /> {language === 'hy' ? 'Ավելացնել տեսանյութ' : 'Add video'}
            </button>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-60 transition-colors"
          >
            <Save size={18} /> {saving ? (language === 'hy' ? 'Պահպանվում է...' : 'Saving...') : (language === 'hy' ? 'Պահպանել' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
};
