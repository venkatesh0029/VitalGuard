import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  currentTime: Date;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveItem: (item: string) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode, currentTime, searchQuery, setSearchQuery, setActiveItem }) => {
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 px-8 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="text-sm">
            <p className="text-slate-500 dark:text-slate-400">{formattedDate}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{formattedTime}</p>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-700 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patient records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none ml-2 text-sm w-64 text-slate-600 dark:text-slate-300 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveItem('Alerts')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-700"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Dr. Sarah Chen</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cardiology</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold">
              SC
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;