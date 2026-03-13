export type RiskLevel = "Normal" | "Warning" | "Critical";

export interface HealthRecord {
  id?: string;
  user_id: string;
  heart_rate: number;
  spo2: number;
  steps?: number;
  risk_level: RiskLevel;
  risk_score?: number;
  timestamp: string;
}

export interface PatientItem {
  userId: string;
  status: "stable" | "warning" | "critical";
  heartRate: number;
  spo2: number;
  lastUpdate: string;
}

export interface AlertItem {
  id: string;
  type: "critical" | "warning";
  patient: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  status: "normal" | "warning" | "critical";
}

export interface StatsSummary {
  totalPatients: number;
  avgHeartRate: number;
  avgSpo2: number;
  criticalCount: number;
  deltaPatients: number;
  deltaHeartRate: number;
  deltaSpo2: number;
  deltaCritical: number;
}
