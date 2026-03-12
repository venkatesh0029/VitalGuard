import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart, Droplets, Activity, Bell, User, Calendar } from 'lucide-react';

const ActivityTimeline = () => {
  const [showAll, setShowAll] = useState(false);
  const activities = [
    {
      id: 1,
      icon: Heart,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      title: 'Patient vitals updated',
      description: 'John Doe - Heart rate: 72 BPM',
      time: '2 minutes ago',
      status: 'normal'
    },
    {
      id: 2,
      icon: Bell,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      title: 'Warning threshold crossed',
      description: 'Sarah Smith - SpO₂: 93%',
      time: '15 minutes ago',
      status: 'warning'
    },
    {
      id: 3,
      icon: Activity,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      title: 'New patient assigned',
      description: 'Michael Brown - Room 204',
      time: '1 hour ago',
      status: 'normal'
    },
    {
      id: 4,
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      title: 'Blood pressure reading',
      description: 'Emily Davis - 118/76 mmHg',
      time: '2 hours ago',
      status: 'normal'
    },
    {
      id: 5,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      title: 'Follow-up scheduled',
      description: 'Robert Wilson - Tomorrow 10:30 AM',
      time: '3 hours ago',
      status: 'normal'
    },
    {
      id: 6,
      icon: User,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      title: 'Doctor consultation',
      description: 'Dr. Chen - Cardiology review',
      time: '5 hours ago',
      status: 'normal'
    }
  ];

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
        {(showAll ? activities : activities.slice(0, 3)).map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 5 }}
            className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
          >
            <div className={`p-2 rounded-xl ${activity.bgColor}`}>
              <activity.icon className={`w-4 h-4 ${activity.color}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {activity.title}
                </h4>
                {activity.status === 'warning' && (
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-full">
                    Warning
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
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">24</div>
            <div className="text-xs text-slate-500">Active Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">3</div>
            <div className="text-xs text-slate-500">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">1</div>
            <div className="text-xs text-slate-500">Critical</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityTimeline;