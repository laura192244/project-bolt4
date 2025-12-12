import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
   
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName  || !formData.email || !formData.password) {
      setError(t.language === 'hy' ? 'Լրացրեք բոլոր դաշտերը' : 'Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError(t.language === 'hy' ? 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ' : 'Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t.language === 'hy' ? 'Մուտքագրեք ճիշտ էլ․ հասցե' : 'Please enter a valid email');
      return;
    }

    const result = signup(formData);

    if (result) {
      setSuccess(true);
      setTimeout(() => {
        onNavigate('courses');
      }, 1500);
    } else {
      setError(t.language === 'hy' ? 'Այս էլ․ հասցեն արդեն գրանցված է' : 'This email is already registered');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">{t.auth.signupButton}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {t.language === 'hy' ? 'Հաջող գրանցում!' : 'Registration successful!'}
              </h3>
              <p className="text-slate-600">
                {t.language === 'hy' ? 'Վերահղվում ենք դասերի էջ...' : 'Redirecting to courses...'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.auth.lastName}
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.auth.firstName}
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

             

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
              >
                {t.auth.signupButton}
              </button>

              <p className="text-center text-slate-600 mt-4">
                {t.language === 'hy' ? 'Արդեն ունե՞ք հաշիվ։' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t.nav.login}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
