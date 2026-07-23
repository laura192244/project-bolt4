import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mapAuthError } from '../lib/authErrors';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

// Shown when the user arrives from a Supabase "reset password" email link.
export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const { updatePassword, clearPasswordRecovery } = useAuth();
  const { language } = useLanguage();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(language === 'hy' ? 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ' : 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError(language === 'hy' ? 'Գաղտնաբառերը չեն համընկնում' : 'Passwords do not match');
      return;
    }
    setSubmitting(true);
    const { error: updErr } = await updatePassword(password);
    setSubmitting(false);
    if (updErr) {
      setError(mapAuthError(updErr, language));
      return;
    }
    setDone(true);
    setTimeout(() => onNavigate('courses'), 1200);
  };

  const cancel = () => {
    clearPasswordRecovery();
    onNavigate('login');
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <div className="w-full animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-soft">
            <KeyRound size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{language === 'hy' ? 'Նոր գաղտնաբառ' : 'New password'}</h2>
        </div>

        <div className="card p-8">
          {done ? (
            <p className="py-6 text-center font-semibold text-emerald-600">
              {language === 'hy' ? 'Գաղտնաբառը փոխվեց։ Վերահղում...' : 'Password updated. Redirecting...'}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="label">{language === 'hy' ? 'Նոր գաղտնաբառ' : 'New password'}</label>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="field" placeholder="••••••••" />
              </div>
              <div>
                <label className="label">{language === 'hy' ? 'Կրկնեք գաղտնաբառը' : 'Confirm password'}</label>
                <input type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} className="field" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? (language === 'hy' ? 'Պահպանվում է...' : 'Saving...') : (language === 'hy' ? 'Պահպանել' : 'Save password')}
              </button>
              <div className="text-center">
                <button type="button" onClick={cancel} className="text-sm text-slate-500 hover:text-slate-700">
                  {language === 'hy' ? 'Չեղարկել' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
