"use client";
import { useState, useEffect, useContext, createContext } from 'react';

const ThemeContext = createContext();

export default function ThemeProvider ({ children }) {
  const [theme, setTheme] = useState('light'); // Initial state

  // Function to determine the theme based on the current hour
  const getThemeBasedOnTime = () => {
    const now = new Date();
    const hour = now.getHours();
    // Light mode from 6:00 AM to 6:00 PM (18:00)
    // Dark mode from 6:01 PM (18:01) to 5:59 AM
    if (hour >= 6 && hour <= 18) {
      return 'light';
    } else {
      return 'dark';
    }
  };

  useEffect(() => {
    // Check for user's preference in localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // If no saved theme, determine based on time
      setTheme(getThemeBasedOnTime());
    }

    // Set up an interval to check the time and update the theme every hour
    // This ensures it switches automatically if the user keeps the page open
    const intervalId = setInterval(() => {
      const currentCalculatedTheme = getThemeBasedOnTime();
      setTheme(prevTheme => {
        // Only update if the calculated theme is different from the current theme
        if (prevTheme !== currentCalculatedTheme) {
          localStorage.setItem('theme', currentCalculatedTheme); // Save the new time-based theme
          return currentCalculatedTheme;
        }
        return prevTheme;
      });
    }, 60 * 60 * 1000); // Check every hour

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Apply or remove the 'dark' class on the html element
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    // Save the theme to localStorage (this will save user's manual toggle choice too)
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // When user manually toggles, save their preference immediately
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);