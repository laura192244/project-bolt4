import React from 'react';
import { BookOpen, Award, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const start = () => onNavigate(isAuthenticated ? 'courses' : 'login');

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-200/50 via-brand-100/40 to-accent-100/30 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl animate-fade-in text-center">
          <span className="badge mb-6 bg-white text-brand-700 shadow-sm ring-1 ring-brand-100">✦ iqskill.am</span>
          <h1 className="text-4xl font-bold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
            {t.home.welcome}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">{t.home.description}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button onClick={start} className="btn-primary px-8 py-4 text-base">
              {t.home.startLearning}
            </button>
            <button onClick={() => onNavigate('about')} className="btn-ghost px-6 py-4 text-base">
              {language === 'hy' ? 'Իմանալ ավելին' : 'Learn more'}
            </button>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<BookOpen />} title={language === 'hy' ? 'Դասընթացներ' : 'Courses'} description="SQL · Python · C# · HTML" gradient="from-brand-500 to-brand-400" />
          <FeatureCard icon={<Award />} title={language === 'hy' ? 'Թեստեր' : 'Quizzes'} description={language === 'hy' ? 'Ստուգեք ձեր գիտելիքները' : 'Test your knowledge'} gradient="from-emerald-500 to-teal-400" />
          <FeatureCard icon={<Users />} title={language === 'hy' ? 'Ինտերակտիվ' : 'Interactive'} description={language === 'hy' ? 'Սովորեք ձեր տեմպով' : 'Learn at your pace'} gradient="from-accent-500 to-accent-400" />
          <FeatureCard icon={<TrendingUp />} title={language === 'hy' ? 'Առաջընթաց' : 'Progress'} description={language === 'hy' ? 'Հետևեք հաջողությանը' : 'Track your success'} gradient="from-fuchsia-500 to-brand-400" />
        </div>
      </div>
    </div>
  );
};

type FeatureCardProps = { icon: React.ReactNode; title: string; description: string; gradient: string };

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => (
  <div className="card group p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-soft">
    <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-600">{description}</p>
  </div>
);
