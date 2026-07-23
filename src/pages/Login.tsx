import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mapAuthError } from '../lib/authErrors';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, sendPasswordReset } = useAuth();
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError(language === 'hy' ? 'Լրացրեք բոլոր դաշտերը' : 'Please fill in all fields');
      return;
    }
    setSubmitting(true);
    const { error: loginError } = await login(formData.email, formData.password);
    setSubmitting(false);
    if (loginError) {
      setError(mapAuthError(loginError, language));
      return;
    }
    onNavigate('courses');
  };

  const handleSendReset = async () => {
    if (!resetEmail) {
      setError(language === 'hy' ? 'Մուտքագրեք էլ․ հասցե' : 'Enter your email');
      return;
    }
    setSubmitting(true);
    const { error: resetError } = await sendPasswordReset(resetEmail);
    setSubmitting(false);
    if (resetError) {
      setError(mapAuthError(resetError, language));
      return;
    }
    setResetSent(true);
    setInfoMessage(
      language === 'hy'
        ? `Վերականգնման հղումն ուղարկվել է ${resetEmail} հասցեին։ Ստուգեք ձեր փոստը։`
        : `A reset link has been sent to ${resetEmail}. Check your inbox.`
    );
  };

  const backToLogin = () => {
    setForgotPassword(false);
    setError('');
    setInfoMessage('');
    setResetSent(false);
    setResetEmail('');
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <div className="w-full animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-soft">
            <LogIn size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t.auth.loginButton}</h2>
        </div>

        <div className="card p-8">
          {!forgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div>
                <label className="label">{t.auth.email}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="field" placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">{t.auth.password}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="field" placeholder="••••••••" />
              </div>

              <div className="text-right">
                <button type="button" onClick={() => { setForgotPassword(true); setError(''); }} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  {language === 'hy' ? 'Մոռացե՞լ եք գաղտնաբառը' : 'Forgot password?'}
                </button>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? (language === 'hy' ? 'Մուտք...' : 'Signing in...') : t.auth.loginButton}
              </button>

              <p className="text-center text-sm text-slate-600">
                {language === 'hy' ? 'Չունե՞ք հաշիվ։ ' : "Don't have an account? "}
                <button type="button" onClick={() => onNavigate('signup')} className="font-semibold text-brand-600 hover:text-brand-700">
                  {t.auth.signupButton}
                </button>
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              {infoMessage && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{infoMessage}</div>}
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              {!resetSent && (
                <>
                  <p className="text-sm text-slate-600">
                    {language === 'hy'
                      ? 'Մուտքագրեք ձեր էլ․ հասցեն, և մենք կուղարկենք վերականգնման հղում։'
                      : "Enter your email and we'll send you a link to reset your password."}
                  </p>
                  <input type="email" placeholder={t.auth.email} value={resetEmail} onChange={(e) => { setResetEmail(e.target.value); setError(''); }} className="field" />
                  <button onClick={handleSendReset} disabled={submitting} className="btn-primary w-full">
                    {submitting ? (language === 'hy' ? 'Ուղարկվում է...' : 'Sending...') : (language === 'hy' ? 'Ուղարկել հղումը' : 'Send reset link')}
                  </button>
                </>
              )}

              <div className="text-center">
                <button onClick={backToLogin} className="text-sm text-slate-500 hover:text-slate-700">
                  {language === 'hy' ? 'Վերադառնալ մուտքին' : 'Back to login'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
