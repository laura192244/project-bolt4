import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const About: React.FC = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    React.useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, email: user.email || "" }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert(language === 'hy'
                ? 'Մուտք գործեք համակարգ, որպեսզի կարողանաք ուղարկել հաղորդագրություն'
                : 'Please sign in to send a message');
            return;
        }
        if (user && formData.email !== user.email) {
            alert(
                language === 'hy'
                    ? 'Օգտագործեք այն էլ. հասցեն, որով մուտք եք գործել'
                    : 'Write the email that you used to sign in'
            );
            return;
        }
        const codePattern = /[<>\\{}\[\];]|\bfrom\b/;

        if (!formData.name || !formData.email || !formData.message) {
            alert(language === 'hy' ? 'Լրացրեք բոլոր դաշտերը ' : 'Please fill in all fields');
            return;
        }

        if (codePattern.test(formData.message)) {
            alert(language === 'hy'
                ? 'Միայն մուտքագրեք տեքստ, ոչ թե կոդ կամ մասնիկ'
                : 'Please enter plain text only, no code or special characters');
            return;
        }

        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
        }, 3000);

    return (
        <div>
            {!user && (
                <div className="text-center mb-6 text-red-600 font-semibold">
                    {language === 'hy'
                        ? 'Մուտք գործեք համակարգ՝ հաղորդագրություն ուղարկելու համար'
                        : 'Sign in to send a message'}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* your fields go here */}
                <button type="submit" disabled={!user}>
                    {t.about.send}
                </button>
            </form>
        </div>
    );
}; // <-- correct closing of component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8 text-center">{t.about.title}</h1>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {language === 'hy' ? 'Մեր առաքելությունը' : 'Our Mission'}
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              {t.about.mission}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    {language === 'hy' ? 'Էլ․ հասցե' : 'Email'}
                  </h3>
                  <p className="text-slate-600">info@iqskill.am</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    {language === 'hy' ? 'Հեռախոս' : 'Phone'}
                  </h3>
                  <p className="text-slate-600">+374 xx xxx xxx</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    {language === 'hy' ? 'Հասցե' : 'Address'}
                  </h3>
                  <p className="text-slate-600">
                    {language === 'hy' ? 'Երևան, Հայաստան' : 'Yerevan, Armenia'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t.about.contactTitle}</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {t.about.successMessage}
                </h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.about.name}
                                      </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
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
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.about.message}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  {t.about.send}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'hy' ? 'Միացե՛ք մեզ' : 'Join Us'}
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            {language === 'hy'
              ? 'Սկսեք ձեր ուսուցման ճանապարհորդությունը այսօր և զարգացրեք ձեր հմտությունները մեր որակյալ դասերի միջոցով։'
              : 'Start your learning journey today and develop your skills through our quality courses.'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-3">
              <div className="text-3xl font-bold">4</div>
              <div className="text-sm">{language === 'hy' ? 'Դասընթաց' : 'Courses'}</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-3">
              <div className="text-3xl font-bold">20</div>
              <div className="text-sm">{language === 'hy' ? 'Թեստեր' : 'Quizzes'}</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-3">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm">{language === 'hy' ? 'Անվճար' : 'Free'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
