import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Droplets, ChevronRight } from 'lucide-react';
import { PatientItem } from '../types';

interface PatientListProps {
  patients: PatientItem[];
  searchQuery?: string;
  setActiveItem?: (item: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, searchQuery = '', setActiveItem }) => {
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'stable' | 'warning' | 'critical'>('all');

  const filteredPatients = patients.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter;
    const matchesSearch = p.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'stable': return 'text-green-500 bg-green-50 dark:bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
      case 'critical': return 'text-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Active Patients</h3>
          <span className="text-sm text-slate-500">Total: {patients.length}</span>
        </div>
        
        <div className="flex space-x-2">
          {(['all', 'stable', 'warning', 'critical'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                filter === type
                  ? type === 'all' ? 'bg-blue-500 text-white' :
                    type === 'stable' ? 'bg-green-500 text-white' :
                    type === 'warning' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
        {filteredPatients.map(patient => (
          <motion.div
            key={patient.userId}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
            className={`p-4 cursor-pointer transition-all ${
              selectedPatient?.userId === patient.userId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => setSelectedPatient(patient)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  patient.status === 'stable' ? 'bg-green-500' :
                  patient.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500 animate-pulse'
                }`} />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800 dark:text-white">{patient.userId}</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-rose-500" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">{patient.heartRate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">{patient.spo2}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            
            <AnimatePresence>
              {selectedPatient?.userId === patient.userId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-500">Last Update:</div>
                    <div className="text-slate-800 dark:text-white">{patient.lastUpdate}</div>
                    <div className="text-slate-500">Risk Level:</div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveItem && setActiveItem('Vitals')}
                    className="mt-3 w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    View Full Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PatientList;
