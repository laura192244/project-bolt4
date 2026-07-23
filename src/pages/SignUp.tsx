import React, { useState } from 'react';
import { UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mapAuthError } from '../lib/authErrors';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError(language === 'hy' ? 'Լրացրեք բոլոր դաշտերը' : 'Please fill in all fields');
      return;
    }
    if (formData.password.length < 6) {
      setError(language === 'hy' ? 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ' : 'Password must be at least 6 characters');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(language === 'hy' ? 'Մուտքագրեք ճիշտ էլ․ հասցե' : 'Please enter a valid email');
      return;
    }

    setSubmitting(true);
    const { error: signupError, needsConfirmation } = await signup(formData);
    setSubmitting(false);

    if (signupError) {
      setError(mapAuthError(signupError, language));
      return;
    }

    if (needsConfirmation) {
      setConfirmMessage(
        language === 'hy'
          ? 'Գրանցումը հաջողվեց։ Ստուգեք ձեր փոստը՝ հաշիվը հաստատելու համար։'
          : 'Registration successful. Check your email to confirm your account.'
      );
      setSuccess(true);
      return;
    }

    setSuccess(true);
    setTimeout(() => onNavigate('courses'), 1200);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <div className="w-full animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-soft">
            <UserPlus size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t.auth.signupButton}</h2>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-500">
                <CheckCircle2 size={34} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {language === 'hy' ? 'Հաջող գրանցում!' : 'Registration successful!'}
              </h3>
              <p className="text-slate-600">
                {confirmMessage || (language === 'hy' ? 'Վերահղվում ենք դասերի էջ...' : 'Redirecting to courses...')}
              </p>
              {confirmMessage && (
                <button onClick={() => onNavigate('login')} className="mt-6 font-semibold text-brand-600 hover:text-brand-700">
                  {language === 'hy' ? 'Անցնել մուտքի էջ' : 'Go to login'}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t.auth.firstName}</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="field" />
                </div>
                <div>
                  <label className="label">{t.auth.lastName}</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="field" />
                </div>
              </div>

              <div>
                <label className="label">{t.auth.email}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="field" placeholder="you@example.com" />
              </div>

              <div>
                <label className="label">{t.auth.password}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="field" placeholder="••••••••" />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? (language === 'hy' ? 'Գրանցվում է...' : 'Creating account...') : t.auth.signupButton}
              </button>

              <p className="text-center text-sm text-slate-600">
                {language === 'hy' ? 'Արդեն ունե՞ք հաշիվ։ ' : 'Already have an account? '}
                <button type="button" onClick={() => onNavigate('login')} className="font-semibold text-brand-600 hover:text-brand-700">
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
