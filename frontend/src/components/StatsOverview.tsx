import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsOverview = () => {
  const stats = [
    {
      title: 'Total Patients',
      value: '156',
      change: '+12',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Avg. Heart Rate',
      value: '72 BPM',
      change: '-3',
      trend: 'down',
      icon: Heart,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      iconColor: 'text-rose-500'
    },
    {
      title: 'Avg. SpO₂',
      value: '97%',
      change: '+1%',
      trend: 'up',
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconColor: 'text-emerald-500'
    },
    {
      title: 'Critical Cases',
      value: '3',
      change: '+2',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      iconColor: 'text-red-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              stat.trend === 'up' ? 'text-green-500' :
              stat.trend === 'down' ? 'text-red-500' :
              'text-slate-500'
            }`}>
              {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
              {stat.trend === 'down' && <TrendingDown className="w-4 h-4" />}
              {stat.trend === 'neutral' && <Minus className="w-4 h-4" />}
              <span>{stat.change}</span>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
            {stat.value}
          </h3>
          <p className="text-sm text-slate-500">{stat.title}</p>

          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;