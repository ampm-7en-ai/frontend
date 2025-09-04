
import { useState, useEffect } from 'react';

type AppTheme = 'light' | 'dark';

export const useAppTheme = () => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    // Check for existing knowledge-theme first (migration)
    const knowledgeTheme = localStorage.getItem('knowledge-theme') as AppTheme;
    if (knowledgeTheme) {
      // Migrate old theme to new key
      localStorage.setItem('app-theme', knowledgeTheme);
      localStorage.removeItem('knowledge-theme');
      console.log('Migrated theme from knowledge-theme to app-theme:', knowledgeTheme);
      return knowledgeTheme;
    }
    
    const saved = localStorage.getItem('app-theme') as AppTheme;
    console.log('Initial theme from localStorage:', saved);
    return saved || 'dark';
  });

  useEffect(() => {
    console.log('Saving theme to localStorage:', theme);
    localStorage.setItem('app-theme', theme);
    
    // Apply theme to document root for the entire app
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggling theme from:', theme);
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('New theme:', newTheme);
      return newTheme;
    });
  };

  return { theme, setTheme, toggleTheme };
};
