import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, BarChart3, Users, Bell, Shield, Settings as SettingsIcon, Filter, Search, Download, Mail, Phone, MoreVertical, Key, Lock, MonitorSmartphone, Fingerprint, Globe, UserCog, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AlertCenter from './AlertCenter';
import HealthChart from './HealthChart';

interface ViewProps {
  title: string;
  icon: React.ElementType;
  description: string;
}

const PlaceholderView: React.FC<ViewProps> = ({ title, icon: Icon, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center text-center h-[60vh]"
  >
    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-10 h-10 text-blue-500" />
    </div>
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
    <p className="text-slate-500 max-w-md">{description}</p>
  </motion.div>
);

const MockToast = ({ message, isVisible }: { message: string, isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 bg-slate-800 text-white dark:bg-white dark:text-slate-800 px-6 py-3 rounded-xl shadow-2xl flex items-center z-50 text-sm font-medium border border-slate-700 dark:border-slate-200"
      >
        <Check className="w-4 h-4 mr-2 text-green-400 dark:text-green-500" />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

export const VitalsView = () => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  // Generate 24 hours of mock data
  useEffect(() => {
    const data = [];
    let baseHR = 72;
    let baseSpo2 = 98;
    for (let i = 0; i < 24; i++) {
      baseHR = Math.max(60, Math.min(100, baseHR + (Math.random() - 0.5) * 10));
      baseSpo2 = Math.max(92, Math.min(100, baseSpo2 + (Math.random() - 0.5) * 2));
      data.push({
        time: `${i}:00`,
        heartRate: Math.round(baseHR),
        spo2: Math.round(baseSpo2),
      });
    }
    setHistoricalData(data);
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Detailed Vitals Analysis</h2>
        <div className="flex gap-2 relative">
          <button 
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
          
          <AnimatePresence>
            {showFilterOptions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-24 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-sm"
              >
                <div className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300">Heart Rate Only</div>
                <div className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300">SpO2 Only</div>
                <div className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300">Critical Alerts Event</div>
                <div className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300">Clear Filters</div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleExport}
            className={`px-4 py-2 text-white rounded-lg text-sm flex items-center transition-all ${
              isExporting ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isExporting ? (
              <>Saving File...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Export</>
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthChart data={historicalData} />
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Risk Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Normal</span>
                <span className="font-medium text-slate-800 dark:text-white">85%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Warning</span>
                <span className="font-medium text-slate-800 dark:text-white">12%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-[12%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Critical</span>
                <span className="font-medium text-slate-800 dark:text-white">3%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[3%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HistoryView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const recentVisits = [
    { id: 1, date: '2023-10-24', patient: 'John Doe', doctor: 'Dr. Sarah Chen', condition: 'Hypertension Follow-up', status: 'Completed' },
    { id: 2, date: '2023-10-23', patient: 'Sarah Smith', doctor: 'Dr. Michael Wong', condition: 'Arrhythmia Monitoring', status: 'Admitted' },
    { id: 3, date: '2023-10-21', patient: 'Robert Wilson', doctor: 'Dr. Sarah Chen', condition: 'Post-Op Check', status: 'Completed' },
    { id: 4, date: '2023-10-20', patient: 'Emily Davis', doctor: 'Dr. James Miller', condition: 'Routine Assessment', status: 'Discharged' },
    { id: 5, date: '2023-10-18', patient: 'Michael Brown', doctor: 'Dr. Sarah Chen', condition: 'Cardiac Event', status: 'Critical' },
  ];

  const filteredVisits = recentVisits.filter(visit => 
    visit.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    visit.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Patient History Log</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search records..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Patient</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Attending Doctor</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Condition/Notes</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 text-sm text-slate-800 dark:text-white whitespace-nowrap">{visit.date}</td>
                  <td className="p-4 text-sm font-medium text-slate-800 dark:text-white">{visit.patient}</td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{visit.doctor}</td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{visit.condition}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      visit.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                      visit.status === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                      visit.status === 'Admitted' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400'
                    }`}>
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No patient records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AnalyticsView = () => {
  const [timeframe, setTimeframe] = useState('30days');

  // Change data multiplier based on timeframe to simulate switching data sets
  const multiplier = timeframe === '30days' ? 1 : timeframe === '7days' ? 0.3 : 0.05;

  const departmentData = [
    { name: 'Cardiology', patients: Math.floor(45 * multiplier) },
    { name: 'Neurology', patients: Math.floor(30 * multiplier) },
    { name: 'Oncology', patients: Math.floor(25 * multiplier) },
    { name: 'Pediatrics', patients: Math.floor(35 * multiplier) },
    { name: 'Emergency', patients: Math.floor(50 * multiplier) },
  ];

  const occupancyData = [
    { name: 'Occupied', value: Math.floor(185 * multiplier) || 10 },
    { name: 'Available', value: Math.floor(65 * multiplier) || 5 },
  ];
  const COLORS = ['#ef4444', '#22c55e'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Hospital Analytics</h2>
        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
        >
          <option value="30days">Last 30 Days</option>
          <option value="7days">Last 7 Days</option>
          <option value="today">Today</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Patients by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(51, 65, 85, 0.1)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} 
                />
                <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Bed Occupancy</h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">74%</span>
              <span className="text-sm text-slate-500">Filled</span>
            </div>
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Occupied (185)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Available (65)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TeamView = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const team = [
    { id: 1, name: 'Dr. Sarah Chen', role: 'Head of Cardiology', status: 'On Call', image: 'SC', color: 'from-blue-500 to-blue-700' },
    { id: 2, name: 'Dr. Michael Wong', role: 'Neurologist', status: 'In Surgery', image: 'MW', color: 'from-purple-500 to-purple-700' },
    { id: 3, name: 'Nurse Emily Davis', role: 'ICU Charge Nurse', status: 'On Duty', image: 'ED', color: 'from-emerald-500 to-emerald-700' },
    { id: 4, name: 'Dr. James Miller', role: 'Emergency Physician', status: 'Off Duty', image: 'JM', color: 'from-slate-500 to-slate-700' },
    { id: 5, name: 'Dr. Robert Wilson', role: 'Chief Medical Officer', status: 'On Duty', image: 'RW', color: 'from-rose-500 to-rose-700' },
    { id: 6, name: 'Nurse Alice Parker', role: 'Pediatrics Nurse', status: 'On Call', image: 'AP', color: 'from-cyan-500 to-cyan-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Medical Team Directory</h2>
        <button 
          onClick={() => showNotification('Staff Member invite sent')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <MoreVertical className="w-5 h-5" />
            </div>
            
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-500/20`}>
              {member.image}
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{member.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{member.role}</p>
            
            <span className={`px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
              member.status === 'On Duty' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
              member.status === 'On Call' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
              member.status === 'In Surgery' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
              'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400'
            }`}>
              {member.status}
            </span>

            <div className="flex w-full justify-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => showNotification(`Messaging ${member.name}...`)}
                className="flex-1 flex items-center justify-center py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" /> Message
              </button>
              <button 
                onClick={() => showNotification(`Calling ${member.name}...`)}
                className="flex-1 flex items-center justify-center py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" /> Call
              </button>
            </div>
          </div>
        ))}
      </div>
      <MockToast message={toastMessage} isVisible={showToast} />
    </div>
  );
};

export const AlertsView = () => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">System Alerts & Notifications</h2>
    <AlertCenter />
  </div>
);

export const SecurityView = () => {
  const [twoFactor, setTwoFactor] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      showNotification('Audit log downloaded successfully');
    }, 2000);
  };

  const securityLogs = [
    { id: 1, event: 'Successful Login', user: 'Dr. Sarah Chen', ip: '192.168.1.105', time: '10 mins ago', status: 'Success' },
    { id: 2, event: 'Failed Password Attempt', user: 'Nurse Emily Davis', ip: '10.0.0.42', time: '1 hour ago', status: 'Warning' },
    { id: 3, event: 'PHI Record Accessed', user: 'Dr. Michael Wong', ip: '192.168.1.112', time: '2 hours ago', status: 'Success' },
    { id: 4, event: 'System Settings Changed', user: 'Admin User', ip: '10.0.0.5', time: '5 hours ago', status: 'Success' },
    { id: 5, event: 'Multiple Failed Logins', user: 'Unknown', ip: '203.0.113.42', time: '1 day ago', status: 'Critical' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Security & Access Control</h2>
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center"
        >
          {isDownloading ? <><Download className="w-4 h-4 mr-2 animate-bounce" /> Exporting...</> : 'Download Audit Log'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 lg:col-span-1 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Security Settings</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-500">
                  <MonitorSmartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Two-Factor Auth</h4>
                  <p className="text-xs text-slate-500">Require 2FA for all staff</p>
                </div>
              </div>
              <div 
                onClick={() => { setTwoFactor(!twoFactor); showNotification(twoFactor ? '2FA Disabled' : '2FA Enabled'); }}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${twoFactor ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${twoFactor ? 'right-1 translate-x-0' : 'left-1 translate-x-0'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Biometric Login</h4>
                  <p className="text-xs text-slate-500">Allow Touch ID/Face ID</p>
                </div>
              </div>
              <div 
                onClick={() => { setBiometric(!biometric); showNotification(biometric ? 'Biometric Login Disabled' : 'Biometric Login Enabled'); }}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${biometric ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${biometric ? 'right-1 translate-x-0' : 'left-1 translate-x-0'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Session Timeout</h4>
                  <p className="text-xs text-slate-500">Current: 15 minutes</p>
                </div>
              </div>
              <button onClick={() => showNotification('Editing session timeout...')} className="text-sm text-blue-500 hover:text-blue-600 font-medium">Edit</button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Rotate Keys</h4>
                  <p className="text-xs text-slate-500">API and System Keys</p>
                </div>
              </div>
              <button onClick={() => showNotification('Generating new API keys...')} className="text-sm text-blue-500 hover:text-blue-600 font-medium">Manage</button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 lg:col-span-2 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Recent Access Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-sm font-semibold text-slate-500">Event</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">User</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">IP Address</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">Time</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {securityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-4 text-sm text-slate-800 dark:text-white font-medium">{log.event}</td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-300">{log.user}</td>
                    <td className="py-4 text-sm text-slate-500 font-mono">{log.ip}</td>
                    <td className="py-4 text-sm text-slate-500">{log.time}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.status === 'Success' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                        log.status === 'Warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <MockToast message={toastMessage} isVisible={showToast} />
    </div>
  );
};

export const SettingsView = () => {
  const [hospitalName, setHospitalName] = useState('VitalGuard Central Hospital');
  const [timezone, setTimezone] = useState('Pacific Time (PT)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [showPhotos, setShowPhotos] = useState(true);
  const [anonymize, setAnonymize] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage('System settings saved successfully');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 text-white rounded-lg text-sm font-medium transition-colors ${isSaving ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4">
          
          <div className="p-6 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <nav className="space-y-2">
              <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-medium">
                <UserCog className="w-5 h-5" />
                <span>General</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
                <Globe className="w-5 h-5" />
                <span>Localization</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
                <Activity className="w-5 h-5" />
                <span>Telemetry Limits</span>
              </a>
            </nav>
          </div>

          <div className="p-8 md:col-span-3">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">General Configuration</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hospital/Clinic Name</label>
                <input 
                  type="text" 
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                  <select 
                    value={timezone} 
                    onChange={(e) => setTimezone(e.target.value)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>Central European Time (CET)</option>
                    <option>Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Format</label>
                  <select 
                    value={dateFormat} 
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-700 my-6" />

              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Patient Display Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={showPhotos} onChange={(e) => setShowPhotos(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-300 focus:ring-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300">Show patient photographs in lists</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={anonymize} onChange={(e) => setAnonymize(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-300 focus:ring-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300">Anonymize patient names on public displays</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-300 focus:ring-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300">Enable high-contrast mode for charts</span>
                </label>
              </div>

            </div>
          </div>

        </div>
      </div>
      <MockToast message={toastMessage} isVisible={showToast} />
    </div>
  );
};
