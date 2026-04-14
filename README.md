# ☁️ Cloud Cost Comparator (NIST-Aligned Advisor)

A professional-grade **MERN-stack** decision-support system that optimizes cloud resource allocation across AWS, Azure, and GCP. This platform is a **Cloud-Native Application** that actively consumes live cloud management data to offer **FinOps-driven** insights, performance monitoring, and sustainability tracking.

---

## 🚀 Live Cloud Integration

Unlike static estimators, this project is an **active participant** in the cloud ecosystem:
- **API-Driven Intelligence:** Directly consumes the **Azure Retail Prices API** to fetch "literal" pricing, moving beyond hardcoded assumptions.
- **Active Performance Monitoring:** Uses **Networking-as-a-Service (NaaS)** principles to perform real-time latency pings to global data centers, specifically optimized for Mumbai regions.
- **PaaS-Backed Persistence:** Utilizes **Database-as-a-Service (DBaaS)** via MongoDB Atlas to store and visualize historical pricing trends.

---

## 🛠️ NIST Service Model Implementation

The project is architected to simulate and compare the full spectrum of cloud service models:

| NIST Service Model | Category | Implementation in Project |
| :--- | :--- | :--- |
| **IaaS** | Infrastructure | Real-time cost modeling for raw Virtual Machines, GPUs, and Object Storage (S3/Blob). |
| **PaaS** | Platform | Comparison engine for Serverless execution (Lambda/Functions) and Managed Databases. |
| **SaaS** | Software | Managed AI interfaces via the **LLM Token Estimator** for GPT-4, Gemini, and Bedrock. |
| **SECaaS** | Security | Dedicated **Security & Compliance Bundle** for enterprise firewall and audit logging simulation. |



---

## 📊 Advanced Features

### 🔹 Real-Time Monitoring (The "Living" Dashboard)
- **Dynamic Polling:** 5-second interval fetching of latest latency and pricing data points.
- **Currency-Aware Scaling:** Full support for **USD ($) / INR (₹)** toggling across all real-time graphs and tooltips.
- **Fluid UI Transitions:** CSS-animated data updates to reduce cognitive load and enhance professional readability.

### 🔹 Cloud Optimization Logic
- **Green Computing Score:** A regional **Carbon Footprint Badge** (A+ to C) ranking providers by environmental impact.
- **Hardware Architecture Toggle:** Real-time simulation of **Arm (Graviton/Ampere) vs. x86** price-performance benefits.
- **Mumbai Region Optimizer:** Specialized cost mapping for local hubs (`ap-south-1`, `asia-south1`, `southindia`).

---

## 🧩 Tech Stack (Cloud-Native)

- **Frontend:** React (Vite) - Hosted on Cloud Edge.
- **Backend:** Node.js & Express - Operating as a Cloud Proxy.
- **Database:** MongoDB Atlas - Managed **PaaS** for high-availability data.
- **Infrastructure:** Custom Utility CSS - Optimized for low-bandwidth, high-performance rendering.

---

## 🛠️ Project Architecture

```bash
cloud-cost-comparator/
├── backend/                # Node.js Server (Cloud Proxy)
│   ├── controllers/        # Azure API & Latency logic
│   ├── models/             # Mongoose schemas for DBaaS persistence
│   └── server.js           # API Entry point
├── src/                    # React Frontend (SaaS Interface)
│   ├── components/         # SECaaS toggles, IaaS cards, PaaS graphs
│   ├── App.jsx             # Global State & NIST mapping logic
│   └── styles/             # custom.css (Utility-first styling)
└── package.json
```

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or local instance)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Swarup-Valvi/Cloud-Cost-Comparator.git

# Setup Cloud Backend
cd backend
npm install
npm start

# Setup Cloud Frontend
cd ../
npm install
npm run dev
```

---

## 🎓 Academic Context
This project was developed at **KJ Somaiya School of Engineering** to demonstrate:
- **Cloud-Native Development:** Building apps that consume and manage cloud resources.
- **FinOps Literacy:** Understanding the financial and operational mechanics of major CSPs.
- **NIST Alignment:** Practical mapping of complex tech stacks to theoretical service models.

**Authors:** 
Swarup Valvi 16010423103, Tanay Sawant 16010423104, Manthan Rondhe 16010424808.

---

## 🪪 License
Distributed under the MIT License.

---
