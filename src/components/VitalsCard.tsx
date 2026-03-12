import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface VitalsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  bgColor: string;
  iconColor: string;
  index: number;
  threshold?: { min: number; max: number };
}

const VitalsCard: React.FC<VitalsCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  color,
  bgColor,
  iconColor,
  index,
  threshold
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          {threshold && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              typeof value === 'number' && (value < threshold.min || value > threshold.max)
                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
            }`}>
              {typeof value === 'number' && (value < threshold.min || value > threshold.max)
                ? 'Alert'
                : 'Normal'}
            </div>
          )}
        </div>

        <h3 className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</h3>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-slate-800 dark:text-white">{value}</span>
          <span className="text-sm text-slate-400">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default VitalsCard;