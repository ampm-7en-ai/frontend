
import { useState, useEffect } from 'react';

type KnowledgeTheme = 'light' | 'dark';

export const useKnowledgeTheme = () => {
  const [theme, setTheme] = useState<KnowledgeTheme>(() => {
    const saved = localStorage.getItem('knowledge-theme') as KnowledgeTheme;
    console.log('Initial theme from localStorage:', saved);
    return saved || 'light';
  });

  useEffect(() => {
    console.log('Saving theme to localStorage:', theme);
    localStorage.setItem('knowledge-theme', theme);
    
    // Apply theme to document root for knowledge pages
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
