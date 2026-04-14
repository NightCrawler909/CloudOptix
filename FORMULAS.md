# Cloud Pricing Mathematical Formulas

This document outlines the core logic used in the Cloud Cost Comparator calculation engine.

## 1. Compute Cost (VMs)
Calculates the monthly cost of standard Virtual Machines.
**Formula:**
`Cost = ((vCPU * BaseRate_vCPU) + (RAM_GB * BaseRate_RAM)) * 730 * NumInstances * ProviderMultiplier * RegionAdjust * CommitmentDiscount`

- **BaseRate_vCPU:** $0.03 / hour
- **BaseRate_RAM:** $0.004 / GB-hour
- **Hours:** 730 (Standard month)

## 2. Serverless Billing
Calculates costs for AWS Lambda / Azure Functions.
**Formula:**
`Cost = (RequestCount * InvocationRate) + (RequestCount * (DurationSeconds * (RAM_GB * ResourceRate)))`

- **InvocationRate:** $0.0000002 / request
- **ResourceRate:** $0.0000166667 / GB-second
- **RAM_GB:** Standardized to 1GB for cross-cloud comparison.

## 3. High-Performance GPU Billing
Calculates the cost for NVIDIA accelerated instances.
**Formula:**
`Cost = (GPU_Rate * 730 * NumInstances) * ProviderMultiplier * RegionAdjust`

- **NVIDIA T4:** $0.35 / hour
- **NVIDIA V100:** $2.06 / hour
- **NVIDIA A100:** $3.67 / hour

## 4. Multi-Cloud Adjustments
Each provider has a proprietary weight based on their service premiums.
- **AWS:** ~1.10x Database / 1.05x Networking
- **Azure:** ~0.95x Storage / 0.98x General
- **GCP:** ~0.90x Compute / 0.95x Database

## 5. Free Tier Logic (Conditional)
If the **Free Tier Toggle** is active, the following subtractions are applied to the totals:
## 6. LLM Token Estimator (SaaS)
Calculates projected AI inference costs.
**Formula:**
`Cost = (DailyMessages * AvgTokensPerMessage * 30Days) * TokenRate`

- **GPT-4 class:** $0.00003 per token (Average)
- **GPT-3.5 class:** $0.000002 per token (Average)

## 7. Architecture Optimization (Arm)
**Formula:**
`Compute_Final = Compute_Total * 0.80`
- Arm instances (Graviton, Ampere) provide a **20% flat discount** over standard x86_64 pricing for equivalent vCPU performance.

## 8. Enterprise Security Bundle
**Formula:**
`Total = Base_Total + $10.00`
- Adds a fixed-rate compliance monitoring fee for enterprise-grade deployments.
