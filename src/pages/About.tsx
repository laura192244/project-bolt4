import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const About: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setFormData((p) => ({ ...p, email: user.email || '' }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(language === 'hy' ? 'Մուտք գործեք հաղորդագրություն ուղարկելու համար' : 'Please sign in to send a message');
      return;
    }
    if (formData.email !== user.email) {
      setError(language === 'hy' ? 'Օգտագործեք այն էլ. հասցեն, որով մուտք եք գործել' : 'Use the email you signed in with');
      return;
    }
    if (!formData.name || !formData.email || !formData.message) {
      setError(language === 'hy' ? 'Լրացրեք բոլոր դաշտերը' : 'Please fill in all fields');
      return;
    }
    if (/[<>\\{}[\];]|\bfrom\b/.test(formData.message)) {
      setError(language === 'hy' ? 'Միայն տեքստ, ոչ կոդ' : 'Plain text only, no code');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: user?.email || '', message: '' });
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{t.about.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900">{language === 'hy' ? 'Մեր առաքելությունը' : 'Our Mission'}</h2>
          <p className="mt-4 leading-relaxed text-slate-600">{t.about.mission}</p>
          <div className="mt-6 space-y-3">
            <InfoRow icon={<Mail size={18} />} label={language === 'hy' ? 'Էլ․ հասցե' : 'Email'} value="info@iqskill.am" tint="bg-brand-50 text-brand-600" />
            <InfoRow icon={<Phone size={18} />} label={language === 'hy' ? 'Հեռախոս' : 'Phone'} value="+374 xx xxx xxx" tint="bg-emerald-50 text-emerald-600" />
            <InfoRow icon={<MapPin size={18} />} label={language === 'hy' ? 'Հասցե' : 'Address'} value={language === 'hy' ? 'Երևան, Հայաստան' : 'Yerevan, Armenia'} tint="bg-accent-50 text-accent-600" />
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900">{t.about.contactTitle}</h2>
          {!user && (
            <p className="mt-2 text-sm text-amber-600">
              {language === 'hy' ? 'Մուտք գործեք հաղորդագրություն ուղարկելու համար' : 'Sign in to send a message'}
            </p>
          )}
          {submitted ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-500">
                <Send size={24} />
              </div>
              <p className="font-semibold text-slate-800">{t.about.successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="label">{t.about.name}</label>
                <input name="name" value={formData.name} onChange={handleChange} className="field" />
              </div>
              <div>
                <label className="label">{t.auth.email}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="field" />
              </div>
              <div>
                <label className="label">{t.about.message}</label>
                <textarea name="message" rows={5} value={formData.message} onChange={handleChange} className="field resize-none" />
              </div>
              <button type="submit" disabled={!user} className="btn-primary w-full">
                <Send size={18} /> {t.about.send}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat value="4" label={language === 'hy' ? 'Դասընթաց' : 'Courses'} />
        <Stat value="20+" label={language === 'hy' ? 'Հարցեր' : 'Questions'} />
        <Stat value="100%" label={language === 'hy' ? 'Անվճար' : 'Free'} />
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; tint: string }> = ({ icon, label, value, tint }) => (
  <div className="flex items-center gap-3">
    <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg ${tint}`}>{icon}</div>
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  </div>
);

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="card p-6 text-center">
    <p className="text-3xl font-bold text-brand-600">{value}</p>
    <p className="mt-1 text-sm text-slate-500">{label}</p>
  </div>
);
