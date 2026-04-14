export const BASE_RATES = {
  vCPU_hour: 0.03, RAM_GB_hour: 0.004,
  GPU_T4_hour: 0.35, GPU_V100_hour: 2.06, GPU_A100_hour: 3.67,
  Storage_Standard_GB: 0.02, Storage_Cold_GB: 0.005, Object_Storage_GB: 0.023,
  DB_SQL_GB: 0.08, DB_NoSQL_GB: 0.05, Managed_DB_Flat_Fee: 15,
  Networking_Egress_GB: 0.09, Serverless_Invocation_Cost: 0.0000002,
  Arm_Discount: 0.80,
  Security_Flat_Fee: 10,
};

export const NIST_MODELS = {
  Compute: 'IaaS', Storage: 'IaaS', Database: 'PaaS',
  Serverless: 'PaaS', Networking: 'IaaS', Services: 'SaaS',
};

export const CARBON_SCORES = {
  AWS:   { 'US-East': 'B', 'Europe-West': 'A', 'Asia-South': 'C', 'Mumbai': 'B' },
  Azure: { 'US-East': 'A', 'Europe-West': 'A+', 'Asia-South': 'B', 'Mumbai': 'B+' },
  GCP:   { 'US-East': 'A+', 'Europe-West': 'A+', 'Asia-South': 'B', 'Mumbai': 'A' },
};

export const PROVIDER_MULTIPLIERS = {
  AWS:   { compute: 1.05, storage: 1.0,  db: 1.1,  net: 1.05, general: 1.0 },
  Azure: { compute: 1.0,  storage: 0.95, db: 1.0,  net: 1.0,  general: 0.98 },
  GCP:   { compute: 0.9,  storage: 1.05, db: 0.95, net: 0.9,  general: 0.95 },
};

export const REGION_ADJUSTMENT = {
  'US-East': 1.0, 'Europe-West': 1.05, 'Asia-South': 1.15, 'Mumbai': 1.10
};

export const COMMITMENT_DISCOUNTS = {
  'On-demand': 1.0, 'Reserved (1yr)': 0.75, 'Reserved (3yr)': 0.55, 'Spot/Preemptible': 0.25,
};

export const initialInputs = {
  frontend: 'React', backend: 'Node.js', databaseTech: 'PostgreSQL', devops: 'GitHub Actions',
  useCase: 'Web Hosting', region: 'US-East',
  vCPUs: 4, ramPerInstance: 8, numInstances: 2,
  architecture: 'x86_64', gpuType: 'None',
  storageSize: 500, storageType: 'SSD/Standard', objectStorageSize: 100,
  dbType: 'SQL', dbSize: 100, isManagedDB: 'Yes',
  networkingBandwidth: 200, egressMumbaiToWorld: 50,
  pricingModel: 'On-demand',
  serverlessRequests: 1000000, serverlessDurationMs: 200,
  autoScaling: 'No', serverlessOptions: 'No', aiMlIntegration: 'No',
  multiRegion: 'No', highAvailability: 'Yes', performanceWeight: 5,
  freeTierOnly: 'No', securityBundle: 'No', futureProjectionMonths: 12,
  dailyMessages: 5000, avgTokensPerMessage: 1500, llmModel: 'GPT-4 class',
};

export const calculateCosts = (inputs) => {
  const vCPUs = parseFloat(inputs.vCPUs) || 0;
  const ramPerInstance = parseFloat(inputs.ramPerInstance) || 0;
  const numInstances = parseInt(inputs.numInstances) || 0;
  const storageSize = parseFloat(inputs.storageSize) || 0;
  const objectStorageSize = parseFloat(inputs.objectStorageSize) || 0;
  const dbSize = parseFloat(inputs.dbSize) || 0;
  const networkingBandwidth = parseFloat(inputs.networkingBandwidth) || 0;
  const egressMumbaiToWorld = parseFloat(inputs.egressMumbaiToWorld) || 0;
  const serverlessRequests = parseFloat(inputs.serverlessRequests) || 0;
  const serverlessDurationMs = parseFloat(inputs.serverlessDurationMs) || 0;
  const dailyMessages = parseFloat(inputs.dailyMessages) || 0;
  const avgTokensPerMessage = parseFloat(inputs.avgTokensPerMessage) || 0;

  const { gpuType, storageType, dbType, isManagedDB, pricingModel, region,
    multiRegion, highAvailability, serverlessOptions, aiMlIntegration,
    freeTierOnly, architecture, securityBundle, llmModel } = inputs;

  const results = {};

  for (const provider of ['AWS', 'Azure', 'GCP']) {
    const P = PROVIDER_MULTIPLIERS[provider];
    const R = REGION_ADJUSTMENT[region] || 1.0;
    const D = COMMITMENT_DISCOUNTS[pricingModel] || 1.0;
    const breakdown = { Compute: 0, Storage: 0, Database: 0, Networking: 0, Serverless: 0, Services: 0 };

    let baseCompute = (vCPUs * BASE_RATES.vCPU_hour + ramPerInstance * BASE_RATES.RAM_GB_hour) * 730 * numInstances;
    if (architecture === 'Arm') baseCompute *= BASE_RATES.Arm_Discount;
    if (gpuType === 'T4') baseCompute += 730 * numInstances * BASE_RATES.GPU_T4_hour;
    if (gpuType === 'V100') baseCompute += 730 * numInstances * BASE_RATES.GPU_V100_hour;
    if (gpuType === 'A100') baseCompute += 730 * numInstances * BASE_RATES.GPU_A100_hour;
    breakdown.Compute = baseCompute * P.compute * R * D;

    let diskStorage = storageSize * (storageType.includes('Cold') ? BASE_RATES.Storage_Cold_GB : BASE_RATES.Storage_Standard_GB);
    let objectStorage = objectStorageSize * BASE_RATES.Object_Storage_GB;
    breakdown.Storage = (diskStorage + objectStorage) * P.storage * R;

    let baseDB = dbSize * (dbType === 'SQL' ? BASE_RATES.DB_SQL_GB : BASE_RATES.DB_NoSQL_GB);
    if (isManagedDB === 'Yes') { baseDB += BASE_RATES.Managed_DB_Flat_Fee; if (provider === 'AWS' && dbType === 'NoSQL') baseDB *= 1.1; }
    if (highAvailability === 'Yes') baseDB *= 1.25;
    breakdown.Database = baseDB * P.db * R;

    let generalEgress = networkingBandwidth * BASE_RATES.Networking_Egress_GB;
    let mumbaiEgress = region === 'Mumbai' ? egressMumbaiToWorld * (BASE_RATES.Networking_Egress_GB * 1.5) : 0;
    breakdown.Networking = (generalEgress + mumbaiEgress) * P.net;

    if (serverlessOptions === 'Yes' && serverlessRequests > 0) {
      const durationSeconds = serverlessDurationMs / 1000;
      const computeTimePrice = durationSeconds * 1 * 0.0000166667;
      breakdown.Serverless = ((serverlessRequests * BASE_RATES.Serverless_Invocation_Cost) + (serverlessRequests * computeTimePrice)) * P.general;
    }

    if (securityBundle === 'Yes') breakdown.Services += BASE_RATES.Security_Flat_Fee;
    if (aiMlIntegration === 'Yes') {
      const monthlyTokens = dailyMessages * avgTokensPerMessage * 30;
      const tokenRate = llmModel === 'GPT-4 class' ? (0.03 / 1000) : (0.002 / 1000);
      breakdown.Services += monthlyTokens * tokenRate;
    }

    if (freeTierOnly === 'Yes') {
      breakdown.Compute = Math.max(0, breakdown.Compute - 15);
      breakdown.Storage = Math.max(0, breakdown.Storage - 5);
      breakdown.Database = Math.max(0, breakdown.Database - 10);
      breakdown.Serverless = Math.max(0, breakdown.Serverless - 0.20);
      breakdown.Networking = Math.max(0, breakdown.Networking - 1);
    }

    let baseServices = multiRegion === 'Yes' ? 100 : 0;
    breakdown.Services += baseServices * P.general * R;

    const totalMonthlyCost = Object.values(breakdown).reduce((s, c) => s + c, 0);
    results[provider] = {
      total: parseFloat(totalMonthlyCost.toFixed(2)),
      breakdown,
      carbonScore: CARBON_SCORES[provider][region] || 'B',
    };
  }
  return results;
};

export const useCaseFitAnalysis = (useCase, provider, inputs) => {
  let analysis;
  switch (provider) {
    case 'AWS':
      analysis = {
        strength: `Massive ecosystem (EC2, S3, RDS, Lambda). Highly mature tooling. Excellent for IoT and Enterprise Apps.`,
        weakness: `Can be complex to manage/optimize. Egress costs are often high.`,
        suitability: useCase === 'IoT' || useCase === 'Enterprise Apps' || useCase === 'Web Hosting' ? 'High' : 'Medium',
      }; break;
    case 'Azure':
      analysis = {
        strength: `Best for enterprises using Microsoft products (Windows Server, SQL Server). Strong Hybrid Cloud.`,
        weakness: `Compute pricing can be less flexible. Less specialized outside the Microsoft stack.`,
        suitability: useCase === 'Enterprise Apps' || useCase === 'Web Hosting' || useCase === 'Database Management' ? 'High' : 'Medium',
      };
      if (inputs.backend === '.NET') { analysis.suitability = 'High'; }
      break;
    case 'GCP':
      analysis = {
        strength: `Strongest in Big Data (BigQuery, Dataflow) and Machine Learning (Vertex AI). Best compute pricing.`,
        weakness: `Smaller market share. Less mature regional footprint vs AWS/Azure.`,
        suitability: useCase === 'Big Data Analytics' || useCase === 'Machine Learning/AI' || useCase === 'Software Development' ? 'High' : 'Medium',
      }; break;
    default:
      analysis = { strength: '', weakness: '', suitability: 'Medium' };
  }
  return analysis;
};
