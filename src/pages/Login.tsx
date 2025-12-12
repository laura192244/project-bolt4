import React, { useState } from 'react';
import { LogIn, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

//  EMAILJS ADDED
import emailjs from "emailjs-com";

interface LoginProps {
    onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
    const { login, resetPassword } = useAuth();
    const { t, language } = useLanguage();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user' as 'admin' | 'user'
    });
    const [error, setError] = useState('');

    // --- Forgot Password States ---
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetStep, setResetStep] = useState(1);
    const [infoMessage, setInfoMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRoleSelect = (role: 'admin' | 'user') => {
        setFormData({ ...formData, role });
        setError('');
        setForgotPassword(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError(language === 'hy' ? 'Լրացրեք բոլոր դաշտերը' : 'Please fill in all fields');
            return;
        }
        const result = login(formData.email, formData.password, formData.role);
        if (result) {
            onNavigate(formData.role === 'admin' ? 'admin' : 'courses');
        } else {
            setError(language === 'hy' ? 'Սխալ էլ․ հասցե կամ գաղտնաբառ' : 'Invalid email or password');
        }
    };

    //  SEND CODE USING EMAILJS
    const handleSendCode = async () => {
        if (!resetEmail) {
            setError(language === 'hy' ? 'Մուտքագրեք էլ․ հասցե' : 'Enter email');
            return;
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);

        //  EmailJS
        emailjs.init("2bGBrhR-eF3v7o0On"); 

        const templateParams = {
            to_email: resetEmail,
            verification_code: code,
            from_name: "SkillHub Support Team"
        };

        try {
            await emailjs.send(
                "service_bq3a464",    
                "template_46iyy8j",   
                templateParams

            );

            setInfoMessage(
                language === 'hy'
                    ? `Կոդը ուղարկվել է ձեր ${resetEmail} հասցեին`
                    : `Code sent to ${resetEmail}`
            );
            setResetStep(2);

        } catch (err) {
            console.error("EMAILJS ERROR:", err);
            setError(language === 'hy' ? 'Չհաջողվեց ուղարկել կոդը' : 'Failed to send code');
        }
    };

    const handleResetPassword = () => {
        if (verificationCode !== generatedCode) {
            setError(language === 'hy' ? 'Սխալ կոդ' : 'Incorrect code');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setError(language === 'hy' ? 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ' : 'Password must be at least 6 characters');
            return;
        }
        if (resetPassword) resetPassword(resetEmail, newPassword);
        setInfoMessage(language === 'hy' ? 'Գաղտնաբառը հաջողությամբ փոփոխվեց' : 'Password successfully reset');

        setForgotPassword(false);
        setResetEmail('');
        setVerificationCode('');
        setNewPassword('');
        setResetStep(1);
        setGeneratedCode('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">{t.auth.loginButton}</h2>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {!forgotPassword ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">{t.auth.selectRole}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect('user')}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${formData.role === 'user'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 hover:border-blue-300 text-slate-600'
                                            }`}
                                    >
                                        <User size={20} />
                                        <span className="font-medium">{t.auth.user}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect('admin')}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${formData.role === 'admin'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 hover:border-blue-300 text-slate-600'
                                            }`}
                                    >
                                        <Shield size={20} />
                                        <span className="font-medium">{t.auth.admin}</span>
                                    </button>
                                </div>
                            </div>

                            <input
                                type="email"
                                name="email"
                                placeholder={t.auth.email}
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder={t.auth.password}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-lg"
                            />

                            {formData.role === 'admin' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>{language === 'hy' ? 'Ադմին մուտք:' : 'Admin Login:'}</strong><br />
                                        {language === 'hy' ? 'Էլ․ հասցե:' : 'Email:'} admin@iqskill.am<br />
                                        {language === 'hy' ? 'Գաղտնաբառ:' : 'Password:'} admin123
                                    </p>
                                </div>
                            )}

                            {formData.role === 'user' && (
                                <div className="text-center mt-2">
                                    <button type="button" onClick={() => setForgotPassword(true)} className="text-blue-600 hover:text-blue-800 font-medium">
                                        {language === 'hy' ? 'Մոռացել եք գաղտնաբառը' : 'Forgot Password'}
                                    </button>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold">
                                {t.auth.loginButton}
                            </button>

                            <div className="text-center mt-4">
                                <button type="button" onClick={() => onNavigate('signup')} className="text-blue-600 hover:text-blue-800 font-medium">
                                    {language === 'hy' ? 'Չունե՞ք հաշիվ' : "Don't have an account?"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {infoMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{infoMessage}</div>}
                            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

                            {resetStep === 1 && (
                                <>
                                    <input
                                        type="email"
                                        placeholder={language === 'hy' ? 'Էլ․ հասցե' : 'Email'}
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full px-4 py-3 border rounded-lg"
                                    />
                                    <button onClick={handleSendCode} className="w-full bg-blue-600 text-white py-3 rounded-lg">
                                        {language === 'hy' ? 'Ուղարկել կոդը' : 'Send Code'}
                                    </button>
                                </>
                            )}

                            {resetStep === 2 && (
                                <>
                                    <input
                                        type="text"
                                        placeholder={language === 'hy' ? 'Կոդը' : 'Verification Code'}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="w-full px-4 py-3 border rounded-lg"
                                    />
                                    <input
                                        type="password"
                                        placeholder={language === 'hy' ? 'Նոր գաղտնաբառ' : 'New Password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 border rounded-lg"
                                    />
                                    <button onClick={handleResetPassword} className="w-full bg-green-600 text-white py-3 rounded-lg">
                                        {language === 'hy' ? 'Փոխել գաղտնաբառը' : 'Reset Password'}
                                    </button>
                                </>
                            )}

                            <div className="text-center mt-2">
                                <button onClick={() => setForgotPassword(false)} className="text-gray-600 hover:text-gray-800 text-sm">
                                    {language === 'hy' ? 'Վերադառնալ մուտքին' : 'Back to Login'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
