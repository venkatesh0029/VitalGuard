import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import {
  VitalsView,
  HistoryView,
  AnalyticsView,
  TeamView,
  AlertsView,
  SecurityView,
  SettingsView
} from './components/Views';
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <Dashboard searchQuery={searchQuery} setActiveItem={setActiveItem} />;
      case 'Vitals':
        return <VitalsView />;
      case 'History':
        return <HistoryView />;
      case 'Analytics':
        return <AnalyticsView />;
      case 'Team':
        return <TeamView />;
      case 'Alerts':
        return <AlertsView />;
      case 'Security':
        return <SecurityView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <Dashboard searchQuery={searchQuery} setActiveItem={setActiveItem} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="flex h-screen">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode}
            currentTime={currentTime}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setActiveItem={setActiveItem}
          />
          <main className="flex-1 overflow-y-auto p-6 relative">
            <AnimatePresence>
              <motion.div
                key={activeItem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, position: 'absolute' }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;