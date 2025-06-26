
import { useState, useEffect } from 'react';

type KnowledgeTheme = 'light' | 'dark';

export const useKnowledgeTheme = () => {
  const [theme, setTheme] = useState<KnowledgeTheme>(() => {
    const saved = localStorage.getItem('knowledge-theme') as KnowledgeTheme;
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('knowledge-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
};
