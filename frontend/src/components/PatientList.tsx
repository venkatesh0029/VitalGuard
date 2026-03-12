import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Activity, Droplets, Thermometer, ChevronRight, AlertCircle } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  room: string;
  age: number;
  status: 'stable' | 'warning' | 'critical';
  heartRate: number;
  spo2: number;
  temperature: number;
  lastUpdate: string;
}

interface PatientListProps {
  searchQuery?: string;
  setActiveItem?: (item: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({ searchQuery = '', setActiveItem }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filter, setFilter] = useState<'all' | 'stable' | 'warning' | 'critical'>('all');

  const patients: Patient[] = [
    { 
      id: 1, 
      name: 'John Doe', 
      room: '204', 
      age: 45,
      status: 'stable', 
      heartRate: 72, 
      spo2: 98, 
      temperature: 36.6,
      lastUpdate: '2 min ago'
    },
    { 
      id: 2, 
      name: 'Sarah Smith', 
      room: '207', 
      age: 62,
      status: 'warning', 
      heartRate: 92, 
      spo2: 93, 
      temperature: 37.2,
      lastUpdate: '1 min ago'
    },
    { 
      id: 3, 
      name: 'Michael Brown', 
      room: '210', 
      age: 78,
      status: 'critical', 
      heartRate: 118, 
      spo2: 88, 
      temperature: 38.1,
      lastUpdate: 'just now'
    },
    { 
      id: 4, 
      name: 'Emily Davis', 
      room: '205', 
      age: 34,
      status: 'stable', 
      heartRate: 68, 
      spo2: 99, 
      temperature: 36.8,
      lastUpdate: '5 min ago'
    },
    { 
      id: 5, 
      name: 'Robert Wilson', 
      room: '212', 
      age: 71,
      status: 'warning', 
      heartRate: 88, 
      spo2: 94, 
      temperature: 37.0,
      lastUpdate: '3 min ago'
    },
  ];

  const filteredPatients = patients.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.room.includes(searchQuery);
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
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Active Patients</h3>
          <span className="text-sm text-slate-500">Total: {patients.length}</span>
        </div>
        
        {/* Filter Buttons */}
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

      {/* Patient List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
        {filteredPatients.map(patient => (
          <motion.div
            key={patient.id}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
            className={`p-4 cursor-pointer transition-all ${
              selectedPatient?.id === patient.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
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
                    <span className="font-semibold text-slate-800 dark:text-white">{patient.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Room {patient.room}
                    </span>
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
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">{patient.temperature}°C</span>
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
            
            {/* Patient Details (expand when selected) */}
            <AnimatePresence>
              {selectedPatient?.id === patient.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-500">Age:</div>
                    <div className="text-slate-800 dark:text-white">{patient.age} years</div>
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