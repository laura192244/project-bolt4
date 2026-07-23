import React from 'react';
import { Menu, X, Globe, GraduationCap } from 'lucide-react';
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

  const go = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    go('home');
  };

  const toggleLanguage = () => setLanguage(language === 'hy' ? 'en' : 'hy');

  const links = [
    { key: 'home', label: t.nav.home, show: true },
    { key: 'courses', label: t.nav.courses, show: isAuthenticated },
    { key: 'about', label: t.nav.about, show: true },
    { key: 'admin', label: t.nav.admin, show: isAuthenticated && isAdmin },
  ].filter((l) => l.show);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => go('home')} className="group flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-soft transition-transform group-hover:scale-105">
              <GraduationCap size={20} />
            </div>
            <span className="font-display text-lg font-bold text-slate-900">SkillHub</span>
          </button>

          {/* Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavButton key={l.key} active={currentPage === l.key} onClick={() => go(l.key)}>
                {l.label}
              </NavButton>
            ))}
            <div className="mx-2 h-6 w-px bg-slate-200" />
            {isAuthenticated ? (
              <button onClick={handleLogout} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
                {t.nav.logout}
              </button>
            ) : (
              <>
                <NavButton active={currentPage === 'login'} onClick={() => go('login')}>
                  {t.nav.login}
                </NavButton>
                <button onClick={() => go('signup')} className="btn-primary px-4 py-2 text-sm">
                  {t.nav.signup}
                </button>
              </>
            )}
            <button
              onClick={toggleLanguage}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Globe size={16} /> {language.toUpperCase()}
            </button>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggleLanguage} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600">
              <Globe size={14} /> {language.toUpperCase()}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100">
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="animate-fade-in space-y-1 pb-4 md:hidden">
            {links.map((l) => (
              <MobileNavButton key={l.key} active={currentPage === l.key} onClick={() => go(l.key)}>
                {l.label}
              </MobileNavButton>
            ))}
            {isAuthenticated ? (
              <MobileNavButton onClick={handleLogout}>{t.nav.logout}</MobileNavButton>
            ) : (
              <>
                <MobileNavButton active={currentPage === 'login'} onClick={() => go('login')}>
                  {t.nav.login}
                </MobileNavButton>
                <MobileNavButton active={currentPage === 'signup'} onClick={() => go('signup')}>
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

const NavButton: React.FC<{ children: React.ReactNode; active?: boolean; onClick: () => void }> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
  >
    {children}
  </button>
);

const MobileNavButton: React.FC<{ children: React.ReactNode; active?: boolean; onClick: () => void }> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
  >
    {children}
  </button>
);
