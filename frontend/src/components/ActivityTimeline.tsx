import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart, Droplets, Bell } from 'lucide-react';
import { ActivityItem } from '../types';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  stats: { totalPatients: number; warnings: number; critical: number };
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, stats }) => {
  const [showAll, setShowAll] = useState(false);

  const getIcon = (status: ActivityItem['status']) => {
    if (status === 'critical') return Bell;
    if (status === 'warning') return Droplets;
    return Heart;
  };

  const getColors = (status: ActivityItem['status']) => {
    if (status === 'critical') return { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' };
    if (status === 'warning') return { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
    return { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Activity Timeline</h3>
          <p className="text-sm text-slate-500">Recent patient updates</p>
        </div>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-blue-500 text-sm font-medium hover:text-blue-600"
        >
          {showAll ? 'Show Less' : 'View All'}
        </button>
      </div>

      <div className="space-y-4">
        {(showAll ? activities : activities.slice(0, 3)).map((activity, index) => {
          const Icon = getIcon(activity.status);
          const colors = getColors(activity.status);
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 5 }}
              className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
            >
              <div className={`p-2 rounded-xl ${colors.bg}`}>
                <Icon className={`w-4 h-4 ${colors.color}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {activity.title}
                  </h4>
                  {activity.status !== 'normal' && (
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-full">
                      {activity.status === 'critical' ? 'Critical' : 'Warning'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {activity.description}
                </p>
                <div className="flex items-center mt-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalPatients}</div>
            <div className="text-xs text-slate-500">Active Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.warnings}</div>
            <div className="text-xs text-slate-500">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
            <div className="text-xs text-slate-500">Critical</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityTimeline;
