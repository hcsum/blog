"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "./Breadcrumb";

export default function TopBar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className="flex justify-between items-center max-w-screen-lg mx-auto p-4 bg-gray-100 dark:bg-gray-800">
      <Breadcrumb />
      <button
        onClick={toggleDarkMode}
        className="p-2 bg-gray-200 dark:bg-gray-700 rounded"
      >
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
}
