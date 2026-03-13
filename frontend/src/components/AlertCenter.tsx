import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle } from 'lucide-react';
import { AlertItem } from '../types';

interface AlertCenterProps {
  alerts: AlertItem[];
}

const AlertCenter: React.FC<AlertCenterProps> = ({ alerts }) => {
  const [localAlerts, setLocalAlerts] = useState<AlertItem[]>(alerts);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLocalAlerts(alerts);
  }, [alerts]);

  const unreadCount = localAlerts.filter(a => !a.read).length;

  const markAsRead = (id: string) => {
    setLocalAlerts(localAlerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const dismissAlert = (id: string) => {
    setLocalAlerts(localAlerts.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string, read: boolean) => {
    if (read) return 'bg-slate-50 dark:bg-slate-700/30';
    switch(type) {
      case 'critical': return 'bg-red-50 dark:bg-red-500/10';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-500/10';
      default: return 'bg-blue-50 dark:bg-blue-500/10';
    }
  };

  const displayedAlerts = showAll ? localAlerts : localAlerts.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Alert Center</h3>
          </div>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {displayedAlerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 ${getAlertBg(alert.type, alert.read)} transition-all`}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800 dark:text-white">
                    {alert.patient}
                  </h4>
                  <span className="text-xs text-slate-500">{alert.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {alert.message}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-sm text-blue-500 hover:text-blue-600 font-medium"
        >
          {showAll ? 'Show Less' : `View All Alerts (${localAlerts.length})`}
        </button>
      </div>
    </motion.div>
  );
};

export default AlertCenter;
