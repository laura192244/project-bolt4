import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  birthday: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role: 'admin' | 'user') => boolean;
    signup: (userData: Omit<User, 'role'> & { password: string }) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    resetPassword: (email: string, newPassword: string) => boolean; // ⬅️ ADD THIS
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string, role: 'admin' | 'user'): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      const loggedInUser = { ...foundUser, role };
      delete loggedInUser.password;
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;
    }

    if (email === 'admin@iqskill.am' && password === 'admin123' && role === 'admin') {
      const adminUser = {
        email: 'admin@iqskill.am',
        firstName: 'Admin',
        lastName: 'User',
        birthday: '1990-01-01',
        role: 'admin' as const
      };
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }

    return false;
  };

  const signup = (userData: Omit<User, 'role'> & { password: string }): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.some((u: any) => u.email === userData.email)) {
      return false;
    }

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));

    const newUser = { ...userData, role: 'user' as const };
    delete (newUser as any).password;
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };
    const resetPassword = (email: string, newPassword: string): boolean => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === email);

        if (userIndex === -1) return false; // user not found

        users[userIndex].password = newPassword; // update password
        localStorage.setItem('users', JSON.stringify(users));

        // if currently logged in user is the same, update currentUser
        if (user?.email === email) {
            const updatedUser = { ...user };
            setUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }

        return true;
    };
  return (
      <AuthContext.Provider
          value={{
              user,
              login,
              signup,
              logout,
              isAuthenticated: !!user,
              isAdmin: user?.role === 'admin',
              resetPassword, // ⬅️ add here
          }}
      >
          {children}
      </AuthContext.Provider>

  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
