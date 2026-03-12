import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Calendar, 
  Settings, 
  Bell, 
  Users,
  BarChart3,
  Shield,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, setActiveItem }) => {

  const menuItems = [
    { icon: Heart, label: 'Dashboard' },
    { icon: Activity, label: 'Vitals' },
    { icon: Calendar, label: 'History' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Users, label: 'Team' },
    { icon: Bell, label: 'Alerts' },
    { icon: Shield, label: 'Security' },
    { icon: Settings, label: 'Settings' },
  ];

  const handleItemClick = (label: string) => {
    setActiveItem(label);
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-6 h-full relative z-20"
    >
      <div className="mb-6 shrink-0">
        <motion.div 
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer"
        >
          <Heart className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col items-center space-y-6 py-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleItemClick(item.label)}
            className={`relative group w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
              activeItem === item.label 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' 
                : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-auto pt-6 w-full flex justify-center shrink-0 border-t border-slate-200/50 dark:border-slate-700/50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;