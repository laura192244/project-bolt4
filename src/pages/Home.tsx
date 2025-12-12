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

  const handleStartLearning = () => {
    if (isAuthenticated) {
      onNavigate('courses'); // logged-in users go to Courses
    } else {
      onNavigate('login'); // guests go to Login page
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            {t.home.welcome}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            {t.home.description}
          </p>
          <button
            onClick={handleStartLearning}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            {t.home.startLearning}
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title={language === 'hy' ? 'Դասընթացներ' : 'Courses'}
            description={language === 'hy' ? 'SQL, Python, C#, HTML' : 'SQL, Python, C#, HTML'}
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<Award className="w-8 h-8" />}
            title={language === 'hy' ? 'Գնահատման թեստեր' : 'Assessment Quizzes'}
            description={language === 'hy' ? 'Ստուգեք ձեր գիտելիքները' : 'Test your knowledge'}
            gradient="from-emerald-500 to-teal-500"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title={language === 'hy' ? 'Ինտերակտիվ' : 'Interactive'}
            description={language === 'hy' ? 'Սովորեք ձեր տեմպով' : 'Learn at your pace'}
            gradient="from-violet-500 to-purple-500"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title={language === 'hy' ? 'Առաջընթաց' : 'Progress'}
            description={language === 'hy' ? 'Հետևեք ձեր հաջողությանը' : 'Track your success'}
            gradient="from-orange-500 to-red-500"
          />
        </div>
      </div>
    </div>
  );
};

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
};
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white mb-4`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const ListItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-center text-slate-700">
    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    {text}
  </li>
);
