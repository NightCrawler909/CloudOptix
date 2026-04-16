import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

import TechStackPage from './Pages/TechStackPage';
import ConfigurationPage from './Pages/ConfigurationPage';
import ResultsPage from './Pages/ResultsPage';
import { initialInputs, calculateCosts, useCaseFitAnalysis } from '../utils/cloudLogic';

import './App.css';

const StepTrack = ({ current }) => {
  const steps = ['Stack', 'Parameters', 'Report'];
  const map = { techStack: 0, configuration: 1, results: 2 };
  const idx = map[current];

  return (
    <div className="niq-step-track">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="niq-step-item">
            <div className={`niq-step-num ${i === idx ? 'active' : i < idx ? 'done' : ''}`}>
              {i < idx ? '✓' : String(i + 1).padStart(2, '0')}
            </div>
            <span className={`niq-step-label ${i === idx ? 'active' : i < idx ? 'done' : ''}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`niq-step-line ${i < idx ? 'done' : ''}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState('techStack');
  const [inputs, setInputs] = useState(initialInputs);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [currency, setCurrency] = useState('USD');
  const [latencies, setLatencies] = useState(null);
  const EXCHANGE_RATE = 83.5;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Yes' : 'No') : (type === 'range' || type === 'number' ? parseFloat(value) || 0 : value),
    }));
  };

  const handleReset = () => {
    setInputs(initialInputs);
    setResults(null);
    setPage('techStack');
    setBillingPeriod('monthly');
  };

  const fetchLatencies = async (region) => {
    try {
      const res = await fetch(`http://localhost:5001/api/ping?region=${region}`);
      const data = await res.json();
      setLatencies(data);
    } catch {
      // fallback simulated latency
      const base = { 'US-East': { AWS: 20, Azure: 25, GCP: 22 }, 'Europe-West': { AWS: 120, Azure: 115, GCP: 118 }, 'Asia-South': { AWS: 15, Azure: 12, GCP: 18 }, 'Mumbai': { AWS: 10, Azure: 8, GCP: 12 } };
      const b = base[region] || { AWS: 100, Azure: 100, GCP: 100 };
      const j = () => Math.floor(Math.random() * 5);
      setLatencies({ AWS: b.AWS + j(), Azure: b.Azure + j(), GCP: b.GCP + j() });
    }
  };

  useEffect(() => {
    let interval;
    if (page === 'results' && results) {
      interval = setInterval(() => fetchLatencies(inputs.region), 5000);
    }
    return () => clearInterval(interval);
  }, [page, results, inputs.region]);

  const runComparison = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch('http://localhost:5001/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs }),
      });
      const calculatedCosts = await response.json();
      await fetchLatencies(inputs.region);
      processResults(calculatedCosts);
    } catch {
      const localResults = calculateCosts(inputs);
      await fetchLatencies(inputs.region);
      processResults(localResults);
    } finally {
      setIsLoading(false);
    }
  };

  const processResults = (costs) => {
    const sorted = Object.entries(costs).sort((a, b) => a[1].total - b[1].total);
    const cheapest = sorted[0][0];
    const mostExpensive = sorted[sorted.length - 1][0];
    const savingsPercent = sorted[sorted.length - 1][1].total > 0
      ? ((sorted[sorted.length - 1][1].total - sorted[0][1].total) / sorted[sorted.length - 1][1].total) * 100
      : 0;

    const mostSuitable = Object.keys(costs).sort((a, b) => {
      const aH = useCaseFitAnalysis(inputs.useCase, a, inputs).suitability === 'High' ? 2 : 1;
      const bH = useCaseFitAnalysis(inputs.useCase, b, inputs).suitability === 'High' ? 2 : 1;
      return bH - aH;
    })[0];

    let recommendation = cheapest;
    if (useCaseFitAnalysis(inputs.useCase, cheapest, inputs).suitability !== 'High' &&
        useCaseFitAnalysis(inputs.useCase, mostSuitable, inputs).suitability === 'High') {
      recommendation = mostSuitable;
    }

    setResults({ costs, cheapest, mostExpensive, savings: savingsPercent.toFixed(1), recommendation });
    setPage('results');
  };

  return (
    <div className="niq-shell">
      {/* Topbar */}
      <nav className="niq-topbar">
        <div className="niq-logo">
          <div className="niq-logo-mark" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#optixGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              <path d="M12 14.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <defs>
                <linearGradient id="optixGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="niq-logo-text">CloudOptix</div>
            <div className="niq-logo-sub">Cloud Intelligence</div>
          </div>
        </div>
        <div className="niq-topbar-right">
          <div className="niq-status-dot"></div>
          <span className="niq-status-text">AZURE API LIVE</span>
          {page !== 'techStack' && (
            <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
              <RefreshCw size={12} /> Reset
            </button>
          )}
        </div>
      </nav>

      <main className="niq-main">
        <StepTrack current={page} />

        {isLoading && (
          <div className="niq-loading">
            <div className="niq-spinner"></div>
            <div className="niq-loading-text">FETCHING LIVE PRICING DATA...</div>
          </div>
        )}

        {!isLoading && page === 'techStack' && (
          <TechStackPage inputs={inputs} handleChange={handleChange} setPage={setPage} />
        )}
        {!isLoading && page === 'configuration' && (
          <ConfigurationPage inputs={inputs} handleChange={handleChange} runComparison={runComparison} setPage={setPage} isLoading={isLoading} />
        )}
        {!isLoading && page === 'results' && (
          <ResultsPage results={results} inputs={inputs} handleReset={handleReset} setPage={setPage}
            billingPeriod={billingPeriod} setBillingPeriod={setBillingPeriod}
            currency={currency} setCurrency={setCurrency} exchangeRate={EXCHANGE_RATE}
            latencies={latencies} />
        )}
      </main>
    </div>
  );
};

export default App;
