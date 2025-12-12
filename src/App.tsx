import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { About } from './pages/About';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

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
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-slate-50">
          <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
          {renderPage()}
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
