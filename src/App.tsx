import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { About } from './pages/About';
import { AdminPanel } from './pages/AdminPanel';
import { ResetPassword } from './pages/ResetPassword';

function AppShell() {
  const [currentPage, setCurrentPage] = useState('home');
  const { loading, passwordRecovery } = useAuth();
  const { language } = useLanguage();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
          <p className="text-sm text-slate-500">{language === 'hy' ? 'Բեռնվում է...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'courses':
        return <Courses />;
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'about':
        return <About />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {/* A password-recovery link takes over the whole view until it's resolved. */}
      {passwordRecovery ? <ResetPassword onNavigate={setCurrentPage} /> : renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
