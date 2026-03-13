import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VitalsCard from './VitalsCard';
import HealthChart from './HealthChart';
import ActivityTimeline from './ActivityTimeline';
import PatientList from './PatientList';
import AlertCenter from './AlertCenter';
import StatsOverview from './StatsOverview';
import { Heart, Droplets, Wind, Footprints, TrendingUp, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { fetchAllHistory } from '../api';
import { AlertItem, ActivityItem, HealthRecord, PatientItem, StatsSummary } from '../types';
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
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [activeUserId, setActiveUserId] = useState("demo_patient_001");

  // Simulate real-time data updates and push to Backend API
  useEffect(() => {
    let token = '';

    // 1. Get Authentication Token first
    const authenticate = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/token?user_id=demo_doctor_01`, {
          method: 'POST'
        });
        if (response.ok) {
          const data = await response.json();
          token = data.access_token;
          console.log("Successfully authenticated with Backend.");
        }
      } catch (err) {
        console.error("Failed to authenticate with backend:", err);
      }
    };
    
    authenticate();

    // 2. Continuous Monitoring Loop
    const interval = setInterval(async () => {
      setVitals(prev => {
        const userIndex = Math.floor(Date.now() / 5000) % 25;
        const currentUserId = `user_${String(userIndex + 1).padStart(3, "0")}`;
        setActiveUserId(currentUserId);
        // Simulate realistic variations
        let newHeartRate = Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 5));
        let newSpo2 = Math.max(94, Math.min(100, prev.spo2 + (Math.random() - 0.5) * 2));
        const newSystolic = Math.max(110, Math.min(140, prev.systolic + (Math.random() - 0.5) * 2));
        const newDiastolic = Math.max(70, Math.min(90, prev.diastolic + (Math.random() - 0.5) * 2));
        const newSteps = prev.steps + Math.floor(Math.random() * 5);

        // Inject unhealthy spikes occasionally to demonstrate alerts
        const spikeRoll = Math.random();
        if (spikeRoll < 0.08) {
          // Critical event
          newHeartRate = 145 + Math.random() * 15; // 145-160
          newSpo2 = 84 + Math.random() * 5;        // 84-89
        } else if (spikeRoll < 0.22) {
          // Warning event
          newHeartRate = 105 + Math.random() * 15; // 105-120
          newSpo2 = 90 + Math.random() * 4;        // 90-94
        }

        // 3. Send via Remote API if authenticated
        if (token) {
          fetch(`${API_BASE_URL}/api/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              user_id: currentUserId,
              heart_rate: Math.round(newHeartRate),
              spo2: Math.round(newSpo2),
              steps: newSteps
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.risk_level) {
               // Update state with AI verified risk level
               setVitals(current => ({
                 ...current,
                 risk: data.risk_level as 'Normal' | 'Warning' | 'Critical'
               }));
            }
          })
          .catch(err => console.error("API Error: ", err));
        }

        return {
          heartRate: Math.round(newHeartRate),
          spo2: Math.round(newSpo2),
          steps: newSteps,
          systolic: Math.round(newSystolic),
          diastolic: Math.round(newDiastolic),
          timestamp: new Date(),
          risk: prev.risk // temporarily keep old risk until API responds
        };
      });
    }, 5000); // 5 second intervals to avoid spamming the LLM API

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      try {
        const data = await fetchAllHistory(200);
        if (isMounted) {
          setRecords(data);
        }
      } catch (err) {
        // ignore for now; UI will keep showing last known data
      }
    };

    loadHistory();
    const historyInterval = setInterval(loadHistory, 10000);
    return () => {
      isMounted = false;
      clearInterval(historyInterval);
    };
  }, []);

  useEffect(() => {
    if (records.length === 0) return;
    const recentRecords = records
      .filter(r => r.user_id === activeUserId);

    const fallbackUserId = recentRecords.length
      ? activeUserId
      : (records[0]?.user_id || activeUserId);

    const recent = records
      .filter(r => r.user_id === fallbackUserId)
      .map(r => ({
        ...r,
        heart_rate: Number(r.heart_rate),
        spo2: Number(r.spo2),
      }))
      .filter(r => Number.isFinite(r.heart_rate) && Number.isFinite(r.spo2))
      .slice(0, 20)
      .reverse()
      .map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString(),
        heartRate: Math.round(r.heart_rate),
        spo2: Math.round(r.spo2),
        systolic: 120,
        diastolic: 80
      }));
    setHistoricalData(recent);
  }, [records, activeUserId]);

  const stats: StatsSummary = useMemo(() => {
    if (records.length === 0) {
      return {
        totalPatients: 0,
        avgHeartRate: 0,
        avgSpo2: 0,
        criticalCount: 0,
        deltaPatients: 0,
        deltaHeartRate: 0,
        deltaSpo2: 0,
        deltaCritical: 0
      };
    }

    const sorted = [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recent = sorted.slice(0, 20);
    const previous = sorted.slice(20, 40);

    const avg = (items: HealthRecord[], key: "heart_rate" | "spo2") =>
      items.reduce((sum, r) => sum + (r[key] || 0), 0) / (items.length || 1);

    const recentAvgHr = avg(recent, "heart_rate");
    const prevAvgHr = avg(previous, "heart_rate");
    const recentAvgSpo2 = avg(recent, "spo2");
    const prevAvgSpo2 = avg(previous, "spo2");

    const totalPatients = new Set(sorted.map(r => r.user_id)).size;
    const prevPatients = new Set(previous.map(r => r.user_id)).size;
    const criticalCount = recent.filter(r => r.risk_level === "Critical").length;
    const prevCritical = previous.filter(r => r.risk_level === "Critical").length;

    return {
      totalPatients,
      avgHeartRate: recentAvgHr || 0,
      avgSpo2: recentAvgSpo2 || 0,
      criticalCount,
      deltaPatients: totalPatients - prevPatients,
      deltaHeartRate: (recentAvgHr - prevAvgHr) || 0,
      deltaSpo2: (recentAvgSpo2 - prevAvgSpo2) || 0,
      deltaCritical: (criticalCount - prevCritical) || 0
    };
  }, [records]);

  const alerts: AlertItem[] = useMemo(() => {
    return records
      .map(r => ({ ...r, heart_rate: Number(r.heart_rate), spo2: Number(r.spo2) }))
      .filter(r => Number.isFinite(r.heart_rate) && Number.isFinite(r.spo2))
      .filter(r => r.risk_level !== "Normal")
      .slice(0, 10)
      .map(r => ({
        id: r.id || `${r.user_id}-${r.timestamp}`,
        type: r.risk_level === "Critical" ? "critical" : "warning",
        patient: r.user_id,
        message: `${r.risk_level} vitals detected (HR ${r.heart_rate}, SpO₂ ${r.spo2}%)`,
        time: new Date(r.timestamp).toLocaleTimeString(),
        read: false
      }));
  }, [records]);

  const activities: ActivityItem[] = useMemo(() => {
    return records
      .map(r => ({ ...r, heart_rate: Number(r.heart_rate), spo2: Number(r.spo2) }))
      .filter(r => Number.isFinite(r.heart_rate) && Number.isFinite(r.spo2))
      .slice(0, 8)
      .map(r => ({
      id: r.id || `${r.user_id}-${r.timestamp}`,
      title: "Patient vitals updated",
      description: `${r.user_id} • HR ${Math.round(r.heart_rate)} BPM • SpO₂ ${Math.round(r.spo2)}%`,
      time: new Date(r.timestamp).toLocaleTimeString(),
      status: r.risk_level === "Critical" ? "critical" : r.risk_level === "Warning" ? "warning" : "normal"
    }));
  }, [records]);

  const patients: PatientItem[] = useMemo(() => {
    const latestByUser = new Map<string, HealthRecord>();
    records.forEach(r => {
      const hr = Number(r.heart_rate);
      const sp = Number(r.spo2);
      if (!Number.isFinite(hr) || !Number.isFinite(sp)) return;
      const existing = latestByUser.get(r.user_id);
      if (!existing || new Date(r.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
        latestByUser.set(r.user_id, { ...r, heart_rate: hr, spo2: sp });
      }
    });

    return Array.from(latestByUser.values()).map(r => ({
      userId: r.user_id,
      status: r.risk_level === "Critical" ? "critical" : r.risk_level === "Warning" ? "warning" : "stable",
      heartRate: Math.round(r.heart_rate),
      spo2: Math.round(r.spo2),
      lastUpdate: new Date(r.timestamp).toLocaleTimeString()
    }));
  }, [records]);

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
      <StatsOverview stats={stats} />

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
              <span className="text-sm">Active Patients: {stats.totalPatients}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Critical Alerts: {stats.criticalCount}</span>
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
          <ActivityTimeline
            activities={activities}
            stats={{
              totalPatients: stats.totalPatients,
              warnings: records.filter(r => r.risk_level === "Warning").length,
              critical: records.filter(r => r.risk_level === "Critical").length
            }}
          />
        </div>
      </div>

      {/* Two Column Layout for Patient List and Alert Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientList patients={patients} searchQuery={searchQuery} setActiveItem={setActiveItem} />
        <AlertCenter alerts={alerts} />
      </div>
    </div>
  );
};

export default Dashboard;
