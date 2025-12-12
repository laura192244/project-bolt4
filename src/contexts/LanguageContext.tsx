import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'hy' | 'en';

interface Translations {
  language: string;
  nav: {
    home: string;
    courses: string;
    about: string;
    login: string;
    signup: string;
    logout: string;
    admin: string;
  };
  home: {
    welcome: string;
    description: string;
    startLearning: string;
  };
  courses: {
    title: string;
    downloadPdf: string;
    startQuiz: string;
    submitQuiz: string;
    retryQuiz: string;
    score: string;
    sql: { title: string; description: string };
    python: { title: string; description: string };
    csharp: { title: string; description: string };
    html: { title: string; description: string };
  };
  auth: {
    firstName: string;
    lastName: string;
    birthday: string;
    email: string;
    password: string;
    signupButton: string;
    loginButton: string;
    selectRole: string;
    user: string;
    admin: string;
  };
  about: {
    title: string;
    mission: string;
    contactTitle: string;
    name: string;
    message: string;
    send: string;
    successMessage: string;
  };
  adminPanel: {
    title: string;
    addCourse: string;
    editCourse: string;
    deleteCourse: string;
    courseName: string;
    courseDescription: string;
    save: string;
    cancel: string;
  };
}

const translations: Record<Language, Translations> = {
  hy: {
    nav: {
      home: 'Գլխավոր',
      courses: 'Դասեր',
      about: 'Մեր մասին',
      login: 'Մուտք',
      signup: 'Գրանցում',
      logout: 'Ելք',
      admin: 'Ադմին պանել'
    },
    home: {
      welcome: 'Բարի գալուստ SkillHub առցանց ուսուցման հարթակ',
      description: 'Սովորեք նոր հմտություններ և գնահատեք ձեր գիտելիքները ինտերակտիվ դասերի և թեստերի միջոցով։',
      startLearning: 'Սկսել սովորելը'
    },
    courses: {
      title: 'Դասընթացներ',
      downloadPdf: 'Ներբեռնել PDF',
      startQuiz: 'Սկսել թեստը',
      submitQuiz: 'Ուղարկել',
      retryQuiz: 'Կրկին փորձել',
      score: 'Դու ճիշտ ես պատասխանել',
      sql: {
        title: 'SQL Տվյալների բազաներ',
        description: 'Սովորեք SQL լեզուն և տվյալների բազաների կառավարումը։ Ծանոթացեք SELECT, INSERT, UPDATE հրամաններին։'
      },
      python: {
        title: 'Python Ծրագրավորում',
        description: 'Տիրապետեք Python լեզվին՝ սկսած հիմունքներից մինչև առաջադեմ թեմաներ։'
      },
      csharp: {
        title: 'C# Ծրագրավորում',
        description: 'Սովորեք C# լեզուն և .NET շրջակայքը ժամանակակից ծրագրեր ստեղծելու համար։'
      },
      html: {
        title: 'HTML և Վեբ Զարգացում',
        description: 'Ստեղծեք վեբ էջեր HTML-ի և CSS-ի միջոցով։ Սովորեք վեբ դիզայնի հիմունքները։'
      }
    },
    auth: {
      firstName: 'Անուն',
      lastName: 'Ազգանուն',
      birthday: 'Ծննդյան օր',
      email: 'Էլ․ հասցե',
      password: 'Գաղտնաբառ',
      signupButton: 'Գրանցվել',
      loginButton: 'Մուտք',
      selectRole: 'Ընտրեք դերը',
      user: 'Օգտատեր',
      admin: 'Ադմին'
    },
    about: {
      title: 'Մեր մասին',
      mission: 'SkillHub-ն առցանց ուսուցման հարթակ է, որն օգնում է սովորողներին բարելավել իրենց գիտելիքները և գնահատել իրենց հմտությունները ինտերակտիվ դասերի և թեստերի միջոցով։ Մեր առաքելությունն է դարձնել որակյալ կրթությունը հասանելի բոլորին՝ տրամադրելով ժամանակակից և արդյունավետ ուսուցման գործիքներ։',
      contactTitle: 'Կապվեք մեզ հետ',
      name: 'Անուն',
      message: 'Հաղորդագրություն',
      send: 'Ուղարկել',
      successMessage: 'Շնորհակալություն! Ձեր հաղորդագրությունն ուղարկվել է։'
    },
    adminPanel: {
      title: 'Ադմինիստրատոր',
      addCourse: 'Ավելացնել դասընթաց',
      editCourse: 'Խմբագրել',
      deleteCourse: 'Ջնջել',
      courseName: 'Դասընթացի անվանում',
      courseDescription: 'Նկարագրություն',
      save: 'Պահպանել',
      cancel: 'Չեղարկել'
    }
  },
  en: {
    nav: {
      home: 'Home',
      courses: 'Courses',
      about: 'About',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      admin: 'Admin '
    },
    home: {
      welcome: 'Welcome to SkillHub Online Learning Platform',
      description: 'Learn new skills and evaluate your knowledge through interactive lessons and quizzes.',
      startLearning: 'Start Learning'
    },
    courses: {
      title: 'Courses',
      downloadPdf: 'Download PDF',
      startQuiz: 'Start Quiz',
      submitQuiz: 'Submit',
      retryQuiz: 'Retry Quiz',
      score: 'You answered correctly',
      sql: {
        title: 'SQL Databases',
        description: 'Learn SQL language and database management. Get familiar with SELECT, INSERT, UPDATE commands.'
      },
      python: {
        title: 'Python Programming',
        description: 'Master Python language from basics to advanced topics.'
      },
      csharp: {
        title: 'C# Programming',
        description: 'Learn C# language and .NET framework to create modern applications.'
      },
      html: {
        title: 'HTML & Web Development',
        description: 'Create web pages using HTML and CSS. Learn web design fundamentals.'
      }
    },
    auth: {
      firstName: 'First Name',
      lastName: 'Last Name',
      birthday: 'Birthday',
      email: 'Email',
      password: 'Password',
      signupButton: 'Create Account',
      loginButton: 'Sign In',
      selectRole: 'Select Role',
      user: 'User',
      admin: 'Admin'
    },
    about: {
      title: 'About Us',
      mission: 'SkillHub is an online learning platform that helps learners improve their knowledge and evaluate their skills through interactive lessons and quizzes. Our mission is to make quality education accessible to everyone by providing modern and effective learning tools.',
      contactTitle: 'Contact Us',
      name: 'Name',
      message: 'Message',
      send: 'Send',
      successMessage: 'Thank you! Your message has been sent.'
    },
    adminPanel: {
      title: 'Admin ',
      addCourse: 'Add Course',
      editCourse: 'Edit',
      deleteCourse: 'Delete',
      courseName: 'Course Name',
      courseDescription: 'Description',
      save: 'Save',
      cancel: 'Cancel'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('hy');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'hy' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
