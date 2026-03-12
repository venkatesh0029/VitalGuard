import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VitalsCard from './VitalsCard';
import HealthChart from './HealthChart';
import ActivityTimeline from './ActivityTimeline';
import PatientList from './PatientList';
import AlertCenter from './AlertCenter';
import StatsOverview from './StatsOverview';
import { Heart, Droplets, Wind, Footprints, TrendingUp, AlertTriangle } from 'lucide-react';
interface Vitals {
  heartRate: number;
  spo2: number;
  steps: number;
  systolic: number;
  diastolic: number;
  timestamp: Date;
  risk: 'Normal' | 'Warning' | 'Critical';
}

interface DashboardProps {
  searchQuery?: string;
  setActiveItem?: (item: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ searchQuery = '', setActiveItem }) => {
  const [vitals, setVitals] = useState<Vitals>({
    heartRate: 72,
    spo2: 98,
    steps: 8432,
    systolic: 118,
    diastolic: 76,
    timestamp: new Date(),
    risk: 'Normal'
  });

  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => {
        // Simulate realistic variations
        const newHeartRate = Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 3));
        const newSpo2 = Math.max(95, Math.min(100, prev.spo2 + (Math.random() - 0.5)));
        const newSystolic = Math.max(110, Math.min(140, prev.systolic + (Math.random() - 0.5) * 2));
        const newDiastolic = Math.max(70, Math.min(90, prev.diastolic + (Math.random() - 0.5) * 2));
        
        // Determine risk level
        let risk: 'Normal' | 'Warning' | 'Critical' = 'Normal';
        if (newHeartRate > 90 || newHeartRate < 50 || newSpo2 < 94) {
          risk = 'Warning';
          if (newHeartRate > 110 || newSpo2 < 90) {
            risk = 'Critical';
          }
        }

        // Add to historical data
        const newData = {
          time: new Date().toLocaleTimeString(),
          heartRate: Math.round(newHeartRate),
          spo2: Math.round(newSpo2),
          systolic: Math.round(newSystolic),
          diastolic: Math.round(newDiastolic)
        };

        setHistoricalData(prev => {
          const updated = [...prev, newData];
          return updated.slice(-20); // Keep last 20 data points
        });

        return {
          heartRate: Math.round(newHeartRate),
          spo2: Math.round(newSpo2),
          steps: prev.steps + Math.floor(Math.random() * 5),
          systolic: Math.round(newSystolic),
          diastolic: Math.round(newDiastolic),
          timestamp: new Date(),
          risk
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const vitalsData = [
    {
      icon: Heart,
      label: 'Heart Rate',
      value: vitals.heartRate,
      unit: 'BPM',
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      iconColor: 'text-rose-500',
      threshold: { min: 60, max: 100 }
    },
    {
      icon: Droplets,
      label: 'SpO₂',
      value: vitals.spo2,
      unit: '%',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconColor: 'text-blue-500',
      threshold: { min: 95, max: 100 }
    },
    {
      icon: Wind,
      label: 'Blood Pressure',
      value: `${vitals.systolic}/${vitals.diastolic}`,
      unit: 'mmHg',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
    {
      icon: Footprints,
      label: 'Steps',
      value: vitals.steps.toLocaleString(),
      unit: 'steps',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      threshold: { min: 0, max: 10000 }
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview />

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Dr. Chen</h1>
          <p className="text-blue-100 mb-4">Your patients' vitals are being monitored in real-time</p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Active Patients: 12</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Critical Alerts: 2</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vitals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vitalsData.map((vital, index) => (
          <VitalsCard 
            key={vital.label} 
            icon={vital.icon}
            label={vital.label}
            value={vital.value}
            unit={vital.unit}
            color={vital.color}
            bgColor={vital.bgColor}
            iconColor={vital.iconColor}
            index={index}
            threshold={vital.threshold}
          />
        ))}
      </div>

      {/* Risk Status Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-4 rounded-2xl ${
          vitals.risk === 'Normal' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' :
          vitals.risk === 'Warning' ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' :
          'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
        } border`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              vitals.risk === 'Normal' ? 'bg-green-500 animate-pulse' :
              vitals.risk === 'Warning' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500 animate-pulse'
            }`}></div>
            <span className={`font-semibold ${
              vitals.risk === 'Normal' ? 'text-green-600 dark:text-green-400' :
              vitals.risk === 'Warning' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              Risk Status: {vitals.risk}
            </span>
          </div>
          <span className="text-sm text-slate-500">
            Last updated: {vitals.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </motion.div>

      {/* Two Column Layout for Charts and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthChart data={historicalData} />
        </div>
        <div className="lg:col-span-1">
          <ActivityTimeline />
        </div>
      </div>

      {/* Two Column Layout for Patient List and Alert Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientList searchQuery={searchQuery} setActiveItem={setActiveItem} />
        <AlertCenter />
      </div>
    </div>
  );
};

export default Dashboard;