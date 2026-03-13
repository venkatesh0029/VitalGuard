# VitalGuard 🏥

> Real-time health monitoring system that analyzes patient data using AI to detect early signs of health issues, enabling proactive care and timely interventions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

VitalGuard is an end-to-end smart healthcare monitoring platform built on **Azure** and **Microsoft Fabric**. It streams real-time vitals (heart rate, oxygen levels, body temperature, etc.) from IoT wearables, applies AI-powered anomaly detection, and presents healthcare professionals with an intuitive dashboard for proactive patient management.

The system bridges the gap between patients and care providers by surfacing actionable insights the moment something abnormal is detected — before a condition escalates.

---

## Features

- 📡 **Real-time IoT Data Streaming** — ingests live vitals from wearables via Azure IoT Hub
- 🤖 **AI Anomaly Detection** — uses Azure OpenAI to flag abnormal readings and predict potential health issues
- 📊 **Live Dashboard** — Power BI–integrated frontend for healthcare professionals to monitor patients at a glance
- 🗄️ **Historical Trend Analysis** — stores and queries patient history through Azure SQL Database
- 🔔 **Automated Alerts** — Azure Stream Analytics triggers real-time alerts for critical readings
- 🔗 **Unified Data Layer** — Microsoft Fabric centralizes IoT and SQL data for comprehensive analytics

---

## Architecture

```
IoT Wearables / Devices
        │
        ▼
  Azure IoT Hub  ──────────────────────────────────────┐
        │                                               │
        ▼                                               ▼
Azure Stream Analytics                     Azure SQL Database
  (real-time alerts)                        (historical data)
        │                                               │
        └──────────────┬────────────────────────────────┘
                       ▼
              Microsoft Fabric
           (unified data platform)
                       │
                       ▼
          Azure Machine Learning /
            Azure OpenAI (AI Engine)
                       │
                       ▼
         TypeScript Frontend Dashboard
           (Power BI Embedded + UI)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | TypeScript, React, Power BI Embedded |
| **Backend** | Python (FastAPI / Flask) |
| **AI Engine** | Python, Azure OpenAI, Azure Machine Learning |
| **Data Streaming** | Azure IoT Hub, Azure Stream Analytics |
| **Database** | Azure SQL Database |
| **Data Platform** | Microsoft Fabric |
| **Styling** | CSS |

---

## Project Structure

```
VitalGuard/
├── frontend/               # TypeScript-based dashboard UI
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard pages / views
│   │   └── services/       # API service calls
│   └── package.json
│
├── vitalguard-backend/     # Python backend API
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Data models
│   │   └── services/       # Business logic
│   └── requirements.txt
│
└── ai-engine/              # AI & ML inference modules
    ├── models/             # Trained models / configs
    ├── inference/          # Real-time prediction logic
    └── requirements.txt
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.10+
- An **Azure** account with the following services provisioned:
  - Azure IoT Hub
  - Azure OpenAI (with a deployed model)
  - Azure SQL Database
  - Azure Stream Analytics
  - Microsoft Fabric workspace

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/venkatesh0029/VitalGuard.git
   cd VitalGuard
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../vitalguard-backend
   pip install -r requirements.txt
   ```

4. **Install AI engine dependencies**
   ```bash
   cd ../ai-engine
   pip install -r requirements.txt
   ```

5. **Configure environment variables**

   Create a `.env` file in each service directory. Example for the backend:
   ```env
   AZURE_IOT_HUB_CONNECTION_STRING=your_iot_hub_connection_string
   AZURE_SQL_CONNECTION_STRING=your_sql_connection_string
   AZURE_OPENAI_API_KEY=your_openai_api_key
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=your_deployment_name
   ```

### Running the Application

**Start the backend:**
```bash
cd vitalguard-backend
uvicorn app.main:app --reload --port 8000
```

**Start the AI engine:**
```bash
cd ai-engine
python main.py
```

**Start the frontend:**
```bash
cd frontend
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

---

## Usage

1. Connect your IoT devices or use the provided device simulator to stream health data.
2. Log in to the dashboard as a healthcare professional.
3. View real-time vitals per patient on the monitoring panel.
4. Receive alerts when AI detects anomalies such as bradycardia, tachycardia, high fever, or fall events.
5. Drill into historical trends via the embedded Power BI reports.

---

## Roadmap

- [ ] **Telemedicine Integration** — in-app video consultations between patients and providers
- [ ] **Personalized AI Recommendations** — AI-driven health tips based on individual patient data
- [ ] **Mobile App** — patient-facing mobile app for self-monitoring on the go
- [ ] **Extended Vitals** — support for blood glucose, ECG, and blood pressure sensors
- [ ] **Multi-tenant Support** — manage multiple hospitals or clinics from a single deployment

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing style and includes relevant tests.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ for better, proactive healthcare</p>
