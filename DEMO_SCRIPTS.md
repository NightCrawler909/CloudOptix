# Student vs. Enterprise Demo Scripts

These walkthroughs are designed to help you demonstrate the versatility of the tool.

## Demo 1: The Student Developer (Zero-Cost Focus)
**Objective:** Show how a student can host a full-stack project for near $0.

1.  **Tech Stack:** Select `React` + `Node.js` + `MongoDB`.
2.  **Configuration:**
    - **Region:** US-East.
    - **vCPUs:** 1 (Micro).
    - **RAM:** 1GB.
    - **Instances:** 1.
    - **Database:** 5GB.
    - **Serverless:** 500,000 requests (Avg 200ms).
3.  **Advanced Options:**
    - Toggle **Free Tier Only** to ON.
4.  **Results:** Observe how the monthly cost drops to $0.00 - $5.00 across GCP and AWS, highlighting the "Free Forever" tiers.

---

## Demo 2: The Enterprise AI Startup (Scale & Performance)
**Objective:** Show how the tool handles high-performance GPU and Mumbai-specific egress.

1.  **Tech Stack:** Select `Python` + `TensorFlow` + `PostgreSQL`.
2.  **Configuration:**
    - **Region:** Mumbai.
    - **vCPUs:** 16.
    - **RAM:** 64GB.
    - **GPU Type:** NVIDIA A100.
    - **Instances:** 4.
    - **Storage:** 2000GB (Standard).
    - **Networking:** 500GB Egress.
    - **Mumbai -> World:** 200GB.
3.  **Advanced Options:**
    - Toggle **High Availability** to ON.
    - Set **Performance Weight** to 9/10.
4.  **Results:**
    - Highlighting Azure's strengths in Enterprise hybrid cloud.
    - Viewing the **Mumbai Egress** cost penalty.
    - Comparing A100 pricing across AWS and GCP.
    - Reviewing **Latency** results specifically from Mumbai edge nodes.
