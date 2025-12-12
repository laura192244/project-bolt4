import React from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();

    const handleLogout = () => {
        logout();
        onNavigate('home');
    };

    const toggleLanguage = () => {
        setLanguage(language === 'hy' ? 'en' : 'hy');
    };

    return (
        <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div
                        className="flex items-center cursor-pointer group"
                        onClick={() => onNavigate('home')}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <span className="text-xl font-bold">SH</span>
                        </div>
                        <span className="ml-3 text-xl font-bold hidden sm:block">SkillHub</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        <NavButton
                            active={currentPage === 'home'}
                            onClick={() => onNavigate('home')}
                        >
                            {t.nav.home}
                        </NavButton>

                        {/* Show “Courses” only if user is logged in */}
                        {isAuthenticated && (
                            <NavButton
                                active={currentPage === 'courses'}
                                onClick={() => onNavigate('courses')}
                            >
                                {t.nav.courses}
                            </NavButton>
                        )}

                        <NavButton
                            active={currentPage === 'about'}
                            onClick={() => onNavigate('about')}
                        >
                            {t.nav.about}
                        </NavButton>

                        {/* Auth Buttons */}
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <NavButton
                                        active={currentPage === 'admin'}
                                        onClick={() => onNavigate('admin')}
                                    >
                                        {t.nav.admin}
                                    </NavButton>
                                )}
                                <NavButton onClick={handleLogout}>
                                    {t.nav.logout}
                                </NavButton>
                            </>
                        ) : (
                            <>
                                <NavButton
                                    active={currentPage === 'login'}
                                    onClick={() => onNavigate('login')}
                                >
                                    {t.nav.login}
                                </NavButton>
                                <NavButton
                                    active={currentPage === 'signup'}
                                    onClick={() => onNavigate('signup')}
                                >
                                    {t.nav.signup}
                                </NavButton>
                            </>
                        )}

                        {/* Language Switch */}
                        <button
                            onClick={toggleLanguage}
                            className="ml-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                        >
                            <Globe size={18} />
                            <span className="text-sm font-medium">{language.toUpperCase()}</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700"
                        >
                            <Globe size={16} />
                            <span className="text-xs font-medium">{language.toUpperCase()}</span>
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <MobileNavButton
                            active={currentPage === 'home'}
                            onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
                        >
                            {t.nav.home}
                        </MobileNavButton>

                        {/* Show “Courses” only if user is logged in (mobile) */}
                        {isAuthenticated && (
                            <MobileNavButton
                                active={currentPage === 'courses'}
                                onClick={() => { onNavigate('courses'); setIsMenuOpen(false); }}
                            >
                                {t.nav.courses}
                            </MobileNavButton>
                        )}

                        <MobileNavButton
                            active={currentPage === 'about'}
                            onClick={() => { onNavigate('about'); setIsMenuOpen(false); }}
                        >
                            {t.nav.about}
                        </MobileNavButton>

                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <MobileNavButton
                                        active={currentPage === 'admin'}
                                        onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }}
                                    >
                                        {t.nav.admin}
                                    </MobileNavButton>
                                )}
                                <MobileNavButton onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                                    {t.nav.logout}
                                </MobileNavButton>
                            </>
                        ) : (
                            <>
                                <MobileNavButton
                                    active={currentPage === 'login'}
                                    onClick={() => { onNavigate('login'); setIsMenuOpen(false); }}
                                >
                                    {t.nav.login}
                                </MobileNavButton>
                                <MobileNavButton
                                    active={currentPage === 'signup'}
                                    onClick={() => { onNavigate('signup'); setIsMenuOpen(false); }}
                                >
                                    {t.nav.signup}
                                </MobileNavButton>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

/* --- Button Components --- */
const NavButton: React.FC<{
    children: React.ReactNode;
    active?: boolean;
    onClick: () => void;
}> = ({ children, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${active
                ? 'bg-blue-600 text-white shadow-lg'
                : 'hover:bg-slate-700 text-gray-200'
            }`}
    >
        {children}
    </button>
);

const MobileNavButton: React.FC<{
    children: React.ReactNode;
    active?: boolean;
    onClick: () => void;
}> = ({ children, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${active
                ? 'bg-blue-600 text-white shadow-lg'
                : 'hover:bg-slate-700 text-gray-200'
            }`}
    >
        {children}
    </button>
);
