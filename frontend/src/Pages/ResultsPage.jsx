import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, TrendingDown, Zap, Leaf } from 'lucide-react';
import { useCaseFitAnalysis, NIST_MODELS } from '../../utils/cloudLogic';

const PROVIDER_COLORS = {
  AWS:   { bar: '#FF9900', dot: 'dot-aws' },
  Azure: { bar: '#0078D4', dot: 'dot-azure' },
  GCP:   { bar: '#34A853', dot: 'dot-gcp' },
};

const CARBON_COLORS = {
  'A+': { bg: 'rgba(0,255,136,0.12)', color: '#00ff88' },
  'A':  { bg: 'rgba(0,255,136,0.08)', color: '#00cc66' },
  'B+': { bg: 'rgba(255,184,0,0.1)',  color: '#ffb800' },
  'B':  { bg: 'rgba(255,184,0,0.08)', color: '#cc9200' },
  'C':  { bg: 'rgba(255,77,109,0.1)', color: '#ff4d6d' },
};

const fmt = (val, currency, exchangeRate) => {
  const v = val * (currency === 'INR' ? exchangeRate : 1);
  if (currency === 'INR') return '₹' + Math.round(v).toLocaleString('en-IN');
  return '$' + v.toFixed(2);
};

const ResultsPage = ({ results, inputs, handleReset, setPage, billingPeriod, setBillingPeriod, currency, setCurrency, exchangeRate, latencies }) => {
  const [liveLatencies, setLiveLatencies] = useState(latencies);

  useEffect(() => {
    if (latencies) setLiveLatencies(latencies);
  }, [latencies]);

  const data = useMemo(() => {
    if (!results) return null;
    const { costs, cheapest, mostExpensive, savings, recommendation } = results;
    const recAnalysis = useCaseFitAnalysis(inputs.useCase, recommendation, inputs);
    return { costs, cheapest, mostExpensive, savings, recommendation, recAnalysis };
  }, [results, inputs]);

  if (!data) return null;
  const { costs, cheapest, recommendation, savings, mostExpensive, recAnalysis } = data;

  const bMul = billingPeriod === 'yearly' ? 12 : 1;
  const curSymbol = currency === 'INR' ? '₹' : '$';
  const periodLabel = billingPeriod === 'yearly' ? 'yearly' : 'monthly';
  const maxCost = Math.max(...Object.values(costs).map(c => c.total));

  const getSaveTag = (provider) => {
    if (provider === cheapest) return <span className="niq-save-tag save-green">Lowest cost</span>;
    const diff = ((costs[provider].total - costs[cheapest].total) / costs[cheapest].total * 100).toFixed(0);
    const cls = diff > 15 ? 'save-red' : 'save-amber';
    return <span className={`niq-save-tag ${cls}`}>+{diff}% vs cheapest</span>;
  };

  const catColors = { Compute: '#b47cff', Storage: '#00ff88', Database: '#00e5ff', Networking: '#ffb800', Serverless: '#ff4d6d', Services: '#7c9eff' };

  return (
    <div className="niq-animate">
      {/* Header */}
      <div className="niq-results-header">
        <div>
          <div className="niq-results-title">Analysis Report</div>
          <div className="niq-results-sub">
            {inputs.backend} · {inputs.databaseTech} · {inputs.region} · {inputs.pricingModel}
          </div>
        </div>
        <div className="niq-pill-group">
          <div className="niq-toggle-pills">
            <button className={`niq-pill ${billingPeriod === 'monthly' ? 'active' : ''}`} onClick={() => setBillingPeriod('monthly')}>Monthly</button>
            <button className={`niq-pill ${billingPeriod === 'yearly' ? 'active' : ''}`} onClick={() => setBillingPeriod('yearly')}>Yearly</button>
          </div>
          <div className="niq-toggle-pills">
            <button className={`niq-pill ${currency === 'USD' ? 'active' : ''}`} onClick={() => setCurrency('USD')}>$ USD</button>
            <button className={`niq-pill ${currency === 'INR' ? 'active' : ''}`} onClick={() => setCurrency('INR')}>₹ INR</button>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="niq-rec-box niq-animate niq-animate-d1">
        <div className="niq-rec-icon">
          <TrendingDown size={16} />
        </div>
        <div>
          <div className="niq-rec-title">Recommended: {recommendation}</div>
          <div className="niq-rec-body">
            {recommendation} is optimal for <strong style={{ color: 'var(--text)' }}>{inputs.useCase}</strong> — {recAnalysis.strength.split('.')[0]}.
            {recommendation === cheapest ? ' Also the lowest cost option.' : ` Cost difference is within acceptable range given superior fit.`}
          </div>
          <div className="niq-rec-meta">
            Potential savings vs {mostExpensive}: {savings}% · Analysis based on {inputs.numInstances}x {inputs.vCPUs}vCPU/{inputs.ramPerInstance}GB instances
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="niq-provider-cards">
        {Object.entries(costs).map(([provider, cost], i) => {
          const isBest = provider === cheapest;
          const isRec = provider === recommendation && !isBest;
          const c = PROVIDER_COLORS[provider];
          const carbon = cost.carbonScore;
          const cc = CARBON_COLORS[carbon] || CARBON_COLORS['B'];

          return (
            <div key={provider} className={`niq-pcard niq-animate niq-animate-d${Math.min(i+1,3)}`}
              style={{ borderColor: isBest ? 'var(--green)' : isRec ? 'var(--accent)' : undefined }}>
              {isBest && <span className="niq-pcard-badge badge-best">Cheapest</span>}
              {isRec && <span className="niq-pcard-badge badge-rec">Recommended</span>}

              <div className="niq-pcard-provider">
                <div className={`niq-provider-dot ${c.dot}`}></div>
                <span className="niq-provider-name">{provider}</span>
              </div>

              <div className="niq-pcard-cost">
                {fmt(cost.total * bMul, currency, exchangeRate)}
              </div>
              <div className="niq-pcard-period">Est. {periodLabel} cost</div>
              {getSaveTag(provider)}

              <div className="niq-breakdown-rows">
                {Object.entries(cost.breakdown).map(([cat, val]) => {
                  const pct = cost.total > 0 ? Math.round(val / cost.total * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="niq-breakdown-row">
                        <span className="niq-brow-key">{cat}</span>
                        <span className="niq-brow-val">{fmt(val * bMul, currency, exchangeRate)}</span>
                      </div>
                      <div className="niq-brow-bar">
                        <div className="niq-brow-fill" style={{ width: `${pct}%`, background: catColors[cat] || c.bar }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="niq-carbon-tag" style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.color}33` }}>
                <Leaf size={10} /> Carbon {carbon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom grid: Latency + Fit Analysis */}
      <div className="niq-grid-2" style={{ marginBottom: '1.5rem', gap: '1.5rem' }}>
        {/* Latency */}
        <div className="niq-card">
          <div className="niq-card-header" style={{ marginBottom: '1rem' }}>
            <div className="niq-card-icon"><Zap size={14} color="var(--accent)" /></div>
            <div>
              <div className="niq-card-title">Simulated Latency</div>
              <div className="niq-card-desc">Region: {inputs.region} · 5-sec refresh</div>
            </div>
          </div>
          {liveLatencies ? Object.entries(liveLatencies).map(([p, ms]) => {
            const max = Math.max(...Object.values(liveLatencies));
            return (
              <div key={p} className="niq-lat-row">
                <span className="niq-lat-label">{p}</span>
                <div className="niq-lat-bar-wrap">
                  <div className="niq-lat-bar" style={{ width: `${(ms/max)*100}%`, background: PROVIDER_COLORS[p]?.bar }}></div>
                </div>
                <span className="niq-lat-val">{ms}ms</span>
              </div>
            );
          }) : <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Backend offline — latency unavailable</div>}
        </div>

        {/* Fit Analysis */}
        <div className="niq-card">
          <div className="niq-card-header" style={{ marginBottom: '1rem' }}>
            <div className="niq-card-icon"><TrendingDown size={14} color="var(--accent)" /></div>
            <div>
              <div className="niq-card-title">Use Case Fit</div>
              <div className="niq-card-desc">{inputs.useCase}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['AWS', 'Azure', 'GCP'].map(p => {
              const fit = useCaseFitAnalysis(inputs.useCase, p, inputs);
              return (
                <div key={p} className="niq-fit-card">
                  <div className="niq-fit-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={`niq-provider-dot ${PROVIDER_COLORS[p].dot}`} style={{ width: '6px', height: '6px' }}></div>
                      <span className="niq-fit-name">{p}</span>
                    </div>
                    <span className={`niq-fit-badge ${fit.suitability === 'High' ? 'fit-high' : 'fit-medium'}`}>{fit.suitability}</span>
                  </div>
                  <div className="niq-fit-strength niq-fit-body">+ {fit.strength.split('.')[0]}.</div>
                  <div className="niq-fit-weakness niq-fit-body">− {fit.weakness.split('.')[0]}.</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div className="niq-card" style={{ marginBottom: '1.5rem' }}>
        <div className="niq-card-header" style={{ marginBottom: '1rem' }}>
          <div className="niq-card-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
          <div>
            <div className="niq-card-title">Cost Breakdown by Category</div>
            <div className="niq-card-desc">NIST service model classification</div>
          </div>
        </div>
        <table className="niq-cat-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Model</th>
              <th>AWS</th>
              <th>Azure</th>
              <th>GCP</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(costs['AWS'].breakdown).map(cat => {
              const nist = NIST_MODELS[cat] || 'IaaS';
              const nistCls = nist === 'IaaS' ? 'nist-iaas' : nist === 'PaaS' ? 'nist-paas' : 'nist-saas';
              return (
                <tr key={cat}>
                  <td>
                    <div className="niq-cat-row-label">
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: catColors[cat], flexShrink: 0 }}></div>
                      {cat}
                    </div>
                  </td>
                  <td><span className={`niq-cat-nist ${nistCls}`}>{nist}</span></td>
                  {['AWS', 'Azure', 'GCP'].map(p => (
                    <td key={p}>{fmt(costs[p].breakdown[cat] * bMul, currency, exchangeRate)}</td>
                  ))}
                </tr>
              );
            })}
            <tr style={{ borderTop: '1px solid var(--border-bright)' }}>
              <td style={{ color: 'var(--text)', fontWeight: 700 }}>Total</td>
              <td></td>
              {['AWS', 'Azure', 'GCP'].map(p => (
                <td key={p} style={{ color: p === cheapest ? 'var(--green)' : 'var(--text)', fontWeight: 700 }}>
                  {fmt(costs[p].total * bMul, currency, exchangeRate)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer actions */}
      <div className="niq-btn-row">
        <button onClick={() => setPage('configuration')} className="niq-btn niq-btn-ghost">
          <ArrowLeft size={14} /> Modify Parameters
        </button>
        <button onClick={handleReset} className="niq-btn niq-btn-danger">
          <RefreshCw size={14} /> New Analysis
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
