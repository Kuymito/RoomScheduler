"use client";
import { useState, useEffect, useContext, createContext } from 'react';

const ThemeContext = createContext();

export default function ThemeProvider ({ children }) {
  const [theme, setTheme] = useState('light'); // Initial state

  useEffect(() => {
    // Check for user's preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark'); // Default to system preference if no saved theme
    }
  }, []);

  useEffect(() => {
    // Apply or remove the 'dark' class on the html element
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    // Save the theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);