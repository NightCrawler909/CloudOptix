const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloud_costs';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Price History Schema
const priceHistorySchema = new mongoose.Schema({
    provider: String,
    region: String,
    totalCost: Number,
    timestamp: { type: Date, default: Date.now },
    inputs: Object
});

const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);

// Basic Memory Cache for API responses
const priceCache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hour

// Azure Retail Prices API Fetcher with Caching
const getAzurePrice = async (region) => {
    const azureRegionMap = {
        'US-East': 'eastus',
        'Europe-West': 'westeurope',
        'Asia-South': 'southindia',
        'Mumbai': 'southindia',
    };
    const azureRegion = azureRegionMap[region] || 'eastus';
    const cacheKey = `azure_price_${azureRegion}`;

    // Check Cache
    if (priceCache.has(cacheKey)) {
        const cached = priceCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`Using cached price for ${azureRegion}`);
            return cached.price;
        }
    }

    try {
        console.log(`Fetching live price for ${azureRegion}...`);
        const url = `https://prices.azure.com/api/retail/prices?currencyCode='USD'&$filter=serviceName eq 'Virtual Machines' and armRegionName eq '${azureRegion}' and skuName eq 'Standard_D2s_v3' and priceType eq 'Consumption'`;
        
        const response = await axios.get(url, { timeout: 5000 });
        
        if (response.data.Items && response.data.Items.length > 0) {
            const price = response.data.Items[0].retailPrice;
            priceCache.set(cacheKey, { price, timestamp: Date.now() });
            return price;
        }
        return null;
    } catch (error) {
        console.error('Error fetching Azure prices (using fallback):', error.message);
        // If timeout or error, return null to use backend logic fallback
        return null;
    }
};

// Routes
app.post('/api/compare', async (req, res) => {
    try {
        const { inputs } = req.body;
        const azureRealPrice = await getAzurePrice(inputs.region);
        const results = calculateBackendCosts(inputs, azureRealPrice);
        
        // Async save to history
        PriceHistory.create(Object.entries(results).map(([provider, data]) => ({
            provider,
            region: inputs.region,
            totalCost: data.total,
            inputs: inputs
        }))).catch(err => console.error('History save error:', err));
        
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Comparison failed' });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const history = await PriceHistory.find().sort({ timestamp: -1 }).limit(100);
        res.json(history.reverse());
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.get('/api/ping', async (req, res) => {
    const { region } = req.query;
    const latencies = {
        'US-East': { AWS: 20, Azure: 25, GCP: 22 },
        'Europe-West': { AWS: 120, Azure: 115, GCP: 118 },
        'Asia-South': { AWS: 15, Azure: 12, GCP: 18 },
        'Mumbai': { AWS: 10, Azure: 8, GCP: 12 },
    };
    
    const baseLatencies = latencies[region] || { AWS: 100, Azure: 100, GCP: 100 };
    const jitter = () => Math.floor(Math.random() * 5);
    
    res.json({
        AWS: baseLatencies.AWS + jitter(),
        Azure: baseLatencies.Azure + jitter(),
        GCP: baseLatencies.GCP + jitter()
    });
});

function calculateBackendCosts(inputs, azureRealPrice) {
    const BASE_RATES = {
        vCPU_hour: 0.03, RAM_GB_hour: 0.004, 
        GPU_T4_hour: 0.35, GPU_V100_hour: 2.06, GPU_A100_hour: 3.67,
        Storage_Standard_GB: 0.02, Storage_Cold_GB: 0.005, Object_Storage_GB: 0.023,
        DB_SQL_GB: 0.08, DB_NoSQL_GB: 0.05, Managed_DB_Flat_Fee: 15,
        Networking_Egress_GB: 0.09, Serverless_Invocation_Cost: 0.0000002,
    };

    const PROVIDER_MULTIPLIERS = {
        AWS: { compute: 1.05, storage: 1.0, db: 1.1, net: 1.05, general: 1.0 },
        Azure: { compute: 1.0, storage: 0.95, db: 1.0, net: 1.0, general: 0.98 },
        GCP: { compute: 0.9, storage: 1.05, db: 0.95, net: 0.9, general: 0.95 },
    };

    const REGION_ADJUSTMENT = { 'US-East': 1.0, 'Europe-West': 1.05, 'Asia-South': 1.15, 'Mumbai': 1.10 };
    const COMMITMENT_DISCOUNTS = {
        'On-demand': 1.0, 'Reserved (1yr)': 0.75, 'Reserved (3yr)': 0.55, 'Spot/Preemptible': 0.25,
    };

    const {
        vCPUs, ramPerInstance, numInstances, gpuType, storageSize, storageType,
        objectStorageSize, dbType, dbSize, isManagedDB, networkingBandwidth, egressMumbaiToWorld,
        pricingModel, region, serverlessRequests, serverlessDurationMs,
        multiRegion, highAvailability, serverlessOptions, aiMlIntegration,
        freeTierOnly
    } = inputs;

    const results = {};

    for (const provider of ['AWS', 'Azure', 'GCP']) {
        const P = PROVIDER_MULTIPLIERS[provider];
        const R = REGION_ADJUSTMENT[region] || 1.0;
        const D = COMMITMENT_DISCOUNTS[pricingModel] || 1.0;

        const breakdown = {};
        
        // Compute Cost
        let baseCompute;
        if (provider === 'Azure' && azureRealPrice) {
            const azureBaseRate = azureRealPrice / (2 + 8 * 0.1); 
            baseCompute = (vCPUs + ramPerInstance * 0.1) * azureBaseRate * 730 * numInstances;
        } else {
            baseCompute = (vCPUs * BASE_RATES.vCPU_hour + ramPerInstance * BASE_RATES.RAM_GB_hour) * 730 * numInstances;
        }
        
        if (gpuType === 'T4') baseCompute += 730 * numInstances * BASE_RATES.GPU_T4_hour;
        if (gpuType === 'V100') baseCompute += 730 * numInstances * BASE_RATES.GPU_V100_hour;
        if (gpuType === 'A100') baseCompute += 730 * numInstances * BASE_RATES.GPU_A100_hour;
        breakdown.Compute = baseCompute * P.compute * R * D;

        // Storage & Object Storage Cost
        let diskStorage = storageSize * (storageType.includes('Cold') ? BASE_RATES.Storage_Cold_GB : BASE_RATES.Storage_Standard_GB);
        let objectStorage = (objectStorageSize || 0) * BASE_RATES.Object_Storage_GB;
        breakdown.Storage = (diskStorage + objectStorage) * P.storage * R;
        
        // Database Cost
        let baseDB = dbSize * (dbType === 'SQL' ? BASE_RATES.DB_SQL_GB : BASE_RATES.DB_NoSQL_GB);
        if (isManagedDB === 'Yes') {
            baseDB += BASE_RATES.Managed_DB_Flat_Fee;
            if (provider === 'AWS' && dbType === 'NoSQL') baseDB *= 1.1; 
        }
        if (highAvailability === 'Yes') baseDB *= 1.25;
        breakdown.Database = baseDB * P.db * R;

        // Networking Cost
        let generalEgress = networkingBandwidth * BASE_RATES.Networking_Egress_GB;
        let mumbaiEgress = 0;
        if (region === 'Mumbai') {
            mumbaiEgress = (egressMumbaiToWorld || 0) * (BASE_RATES.Networking_Egress_GB * 1.5);
        }
        breakdown.Networking = (generalEgress + mumbaiEgress) * P.net;

        // Serverless Cost
        let serverlessCost = 0;
        if (serverlessRequests > 0) {
            const computeTimePrice = (serverlessDurationMs / 1000) * (vCPUs * 0.0000166667);
            serverlessCost = (serverlessRequests * BASE_RATES.Serverless_Invocation_Cost) + (serverlessRequests * computeTimePrice);
        }
        breakdown.Serverless = serverlessCost * (P.general || 1.0);

        // Free Tier Discounts
        if (freeTierOnly === 'Yes') {
            breakdown.Compute = Math.max(0, breakdown.Compute - 15);
            breakdown.Storage = Math.max(0, breakdown.Storage - 5);
            breakdown.Database = Math.max(0, breakdown.Database - 10);
            breakdown.Serverless = Math.max(0, breakdown.Serverless - 0.20);
            breakdown.Networking = Math.max(0, breakdown.Networking - 1);
        }

        // Services
        let services = 0;
        if (multiRegion === 'Yes') services += 100;
        if (aiMlIntegration === 'Yes') services += 50;
        breakdown.Services = services * (P.general || 1.0) * R;

        const totalMonthlyCost = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0);
        results[provider] = {
            total: parseFloat(totalMonthlyCost.toFixed(2)),
            breakdown,
        };
    }
    return results;
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
