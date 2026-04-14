import React from 'react';
import { ArrowLeft, ArrowRight, Cpu, HardDrive, Database, Globe, Zap, Code, BarChart2, Shield } from 'lucide-react';
import { NiqField, NiqToggle } from '../Shared/NiqField';

const SectionLabel = ({ label }) => (
  <div className="niq-section-label">{label}</div>
);

const ConfigurationPage = ({ inputs, handleChange, runComparison, setPage, isLoading }) => {
  const handleToggle = (name, trueVal, falseVal) => (e) => {
    handleChange({ target: { name, value: e.target.checked ? trueVal : falseVal } });
  };

  const estCompute = ((parseFloat(inputs.vCPUs) || 0) * 0.03 + (parseFloat(inputs.ramPerInstance) || 0) * 0.004) * 730 * (parseInt(inputs.numInstances) || 0);

  return (
    <div className="niq-config-layout niq-animate">
      {/* Main panel */}
      <div className="niq-card">
        <div className="niq-card-header">
          <div className="niq-card-icon">
            <BarChart2 size={16} color="var(--accent)" />
          </div>
          <div>
            <div className="niq-card-title">Infrastructure Parameters</div>
            <div className="niq-card-desc">Configure deployment specs for accurate multi-cloud cost modeling</div>
          </div>
        </div>

        <SectionLabel label="Target Environment" />
        <div className="niq-grid-2" style={{ marginBottom: '1.25rem' }}>
          <NiqField icon={<Globe size={13} color="var(--accent)" />} label="Use Case" name="useCase" value={inputs.useCase} onChange={handleChange} type="select"
            options={['Software Development', 'Big Data Analytics', 'Machine Learning/AI', 'Web Hosting', 'Database Management', 'IoT', 'Enterprise Apps']} />
          <NiqField icon={<Globe size={13} color="var(--accent)" />} label="Region" name="region" value={inputs.region} onChange={handleChange} type="select"
            options={['US-East', 'Europe-West', 'Asia-South', 'Mumbai']} />
        </div>

        <SectionLabel label="Compute — IaaS" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-2)' }}>Architecture</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ color: inputs.architecture === 'Arm' ? 'var(--accent)' : 'var(--text-3)' }}>Arm</span>
            <NiqToggle name="architecture" checked={inputs.architecture === 'Arm'} onChange={handleToggle('architecture', 'Arm', 'x86_64')} />
            <span style={{ color: inputs.architecture === 'x86_64' ? 'var(--accent)' : 'var(--text-3)' }}>x86</span>
          </div>
        </div>
        <div className="niq-grid-2" style={{ marginBottom: '1.25rem' }}>
          <NiqField icon={<Cpu size={13} color="var(--purple)" />} label="vCPUs / Instance" name="vCPUs" value={inputs.vCPUs} onChange={handleChange} type="number" min="1" step="4" />
          <NiqField icon={<Cpu size={13} color="var(--purple)" />} label="RAM (GB) / Instance" name="ramPerInstance" value={inputs.ramPerInstance} onChange={handleChange} type="number" min="1" step="4" />
          <NiqField icon={<Zap size={13} color="var(--amber)" />} label="GPU Type" name="gpuType" value={inputs.gpuType} onChange={handleChange} type="select"
            options={['None', 'T4', 'V100', 'A100']} />
          <NiqField icon={<Cpu size={13} color="var(--purple)" />} label="Instance Count" name="numInstances" value={inputs.numInstances} onChange={handleChange} type="number" min="1" step="1" />
        </div>

        <SectionLabel label="Storage — IaaS" />
        <div className="niq-grid-2" style={{ marginBottom: '1.25rem' }}>
          <NiqField icon={<HardDrive size={13} color="var(--green)" />} label="Block Storage (GB)" name="storageSize" value={inputs.storageSize} onChange={handleChange} type="number" min="1" step="100" />
          <NiqField icon={<HardDrive size={13} color="var(--green)" />} label="Object Storage (GB)" name="objectStorageSize" value={inputs.objectStorageSize} onChange={handleChange} type="number" min="1" step="100" />
          <div className="niq-col-2">
            <NiqField icon={<HardDrive size={13} color="var(--green)" />} label="Storage Type" name="storageType" value={inputs.storageType} onChange={handleChange} type="select"
              options={['SSD/Standard', 'HDD/Cold', 'NVMe/Premium']} />
          </div>
        </div>

        <SectionLabel label="Database — PaaS" />
        <div className="niq-grid-2" style={{ marginBottom: '1.25rem' }}>
          <NiqField icon={<Database size={13} color="var(--accent)" />} label="DB Type" name="dbType" value={inputs.dbType} onChange={handleChange} type="select" options={['SQL', 'NoSQL']} />
          <NiqField icon={<Database size={13} color="var(--accent)" />} label="DB Size (GB)" name="dbSize" value={inputs.dbSize} onChange={handleChange} type="number" min="1" step="100" />
        </div>
        <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1.25rem' }}>
          <NiqToggle label="Managed DB Service" name="isManagedDB" checked={inputs.isManagedDB === 'Yes'} onChange={handleToggle('isManagedDB', 'Yes', 'No')} />
          <NiqToggle label="High Availability (Multi-AZ)" name="highAvailability" checked={inputs.highAvailability === 'Yes'} onChange={handleToggle('highAvailability', 'Yes', 'No')} />
        </div>

        <SectionLabel label="Networking — IaaS" />
        <div className="niq-grid-2" style={{ marginBottom: '1.25rem' }}>
          <NiqField icon={<Globe size={13} color="var(--amber)" />} label="Egress (GB/mo)" name="networkingBandwidth" value={inputs.networkingBandwidth} onChange={handleChange} type="number" min="1" step="100" />
          {inputs.region === 'Mumbai' && (
            <NiqField icon={<Globe size={13} color="var(--red)" />} label="Mumbai → World (GB)" name="egressMumbaiToWorld" value={inputs.egressMumbaiToWorld} onChange={handleChange} type="number" min="0" step="10" />
          )}
        </div>

        <SectionLabel label="Pricing Model" />
        <div style={{ marginBottom: '1.25rem' }}>
          <NiqField icon={<BarChart2 size={13} color="var(--accent)" />} label="Commitment Type" name="pricingModel" value={inputs.pricingModel} onChange={handleChange} type="select"
            options={['On-demand', 'Reserved (1yr)', 'Reserved (3yr)', 'Spot/Preemptible']} />
        </div>

        {inputs.serverlessOptions === 'Yes' && (
          <>
            <SectionLabel label="Serverless — PaaS" />
            <div className="niq-grid-2" style={{ marginBottom: '1.25rem' }}>
              <NiqField icon={<Code size={13} color="var(--accent)" />} label="Monthly Requests" name="serverlessRequests" value={inputs.serverlessRequests} onChange={handleChange} type="number" min="0" step="100000" />
              <NiqField icon={<Code size={13} color="var(--accent)" />} label="Avg Duration (ms)" name="serverlessDurationMs" value={inputs.serverlessDurationMs} onChange={handleChange} type="number" min="1" step="50" />
            </div>
          </>
        )}

        {inputs.aiMlIntegration === 'Yes' && (
          <>
            <SectionLabel label="LLM Token Estimator — SaaS" />
            <div className="niq-grid-2" style={{ marginBottom: '1.25rem' }}>
              <NiqField icon={<Zap size={13} color="var(--amber)" />} label="Daily Messages" name="dailyMessages" value={inputs.dailyMessages} onChange={handleChange} type="number" />
              <NiqField icon={<Zap size={13} color="var(--amber)" />} label="Tokens / Message" name="avgTokensPerMessage" value={inputs.avgTokensPerMessage} onChange={handleChange} type="number" />
              <div className="niq-col-2">
                <NiqField icon={<Zap size={13} color="var(--amber)" />} label="Model Class" name="llmModel" value={inputs.llmModel} onChange={handleChange} type="select"
                  options={['GPT-4 class', 'GPT-3.5 / Gemini class']} />
              </div>
            </div>
          </>
        )}

        <div className="niq-btn-row">
          <button onClick={() => setPage('techStack')} className="niq-btn niq-btn-ghost">
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={runComparison} disabled={isLoading} className="niq-btn niq-btn-primary" style={{ flex: 1 }}>
            {isLoading ? 'Analyzing...' : <><BarChart2 size={14} /> Run Analysis <ArrowRight size={14} /></>}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="niq-config-sidebar">
        <div className="niq-sub-card">
          <div className="niq-sub-title">Live Preview</div>
          {[
            ['vCPUs', inputs.vCPUs + ' cores'],
            ['RAM', inputs.ramPerInstance + ' GB'],
            ['Instances', inputs.numInstances + 'x'],
            ['GPU', inputs.gpuType],
            ['Region', inputs.region],
            ['Arch', inputs.architecture],
            ['Pricing', inputs.pricingModel.split(' ')[0]],
            ['Est. Compute', `~$${estCompute.toFixed(0)}/mo`],
          ].map(([k, v]) => (
            <div key={k} className="niq-preview-row">
              <span className="niq-preview-key">{k}</span>
              <span className="niq-preview-val">{v}</span>
            </div>
          ))}
        </div>

        <div className="niq-sub-card">
          <div className="niq-sub-title">Optional Modules</div>
          <NiqToggle label="Serverless Functions" name="serverlessOptions" checked={inputs.serverlessOptions === 'Yes'} onChange={handleToggle('serverlessOptions', 'Yes', 'No')} />
          <NiqToggle label="AI / LLM Integration" name="aiMlIntegration" checked={inputs.aiMlIntegration === 'Yes'} onChange={handleToggle('aiMlIntegration', 'Yes', 'No')} />
          <NiqToggle label="Multi-Region Deploy" name="multiRegion" checked={inputs.multiRegion === 'Yes'} onChange={handleToggle('multiRegion', 'Yes', 'No')} />
          <NiqToggle label="Security Bundle" name="securityBundle" checked={inputs.securityBundle === 'Yes'} onChange={handleToggle('securityBundle', 'Yes', 'No')} />
          <NiqToggle label="Free Tier Mode" name="freeTierOnly" checked={inputs.freeTierOnly === 'Yes'} onChange={handleToggle('freeTierOnly', 'Yes', 'No')} />
        </div>

        <div className="niq-sub-card" style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent-border)' }}>
          <div className="niq-sub-title">About NimbusIQ</div>
          <p style={{ fontSize: '10px', color: 'var(--text-2)', lineHeight: 1.7 }}>
            Multi-cloud cost intelligence for AWS, Azure, and GCP. 
            Pricing models include real-time Azure Retail API data with intelligent fallback computation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;
