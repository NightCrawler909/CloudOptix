import React from 'react';
import { ArrowRight, Code2, Database, Wind, Server } from 'lucide-react';

const Field = ({ icon, label, name, value, onChange, options }) => (
  <div className="niq-field">
    <label className="niq-label">{label}</label>
    <div className="niq-input-wrap is-select">
      <span className="niq-input-icon">{icon}</span>
      <select name={name} value={value} onChange={onChange} className="niq-select has-icon">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
);

const TechStackPage = ({ inputs, handleChange, setPage }) => (
  <div className="niq-card niq-animate">
    <div className="niq-card-header">
      <div className="niq-card-icon">
        <Code2 size={16} color="var(--accent)" />
      </div>
      <div>
        <div className="niq-card-title">Stack Definition</div>
        <div className="niq-card-desc">Define your technology stack for context-aware recommendations</div>
      </div>
    </div>

    <div style={{ marginBottom: '0.5rem', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.08em' }}>
      [01] — RUNTIME ENVIRONMENT
    </div>

    <div className="niq-stack-grid" style={{ marginBottom: '1.5rem' }}>
      <Field
        icon={<Code2 size={14} color="var(--accent)" />}
        label="Frontend Framework"
        name="frontend"
        value={inputs.frontend}
        onChange={handleChange}
        options={['React', 'Angular', 'Vue.js', 'Svelte', 'Static HTML/CSS']}
      />
      <Field
        icon={<Server size={14} color="var(--purple)" />}
        label="Backend Runtime"
        name="backend"
        value={inputs.backend}
        onChange={handleChange}
        options={['Node.js', 'Python (Django/Flask)', 'Java (Spring)', 'Go', '.NET', 'PHP']}
      />
      <Field
        icon={<Database size={14} color="var(--accent)" />}
        label="Primary Database"
        name="databaseTech"
        value={inputs.databaseTech}
        onChange={handleChange}
        options={['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Microsoft SQL Server']}
      />
      <Field
        icon={<Wind size={14} color="var(--green)" />}
        label="CI/CD Pipeline"
        name="devops"
        value={inputs.devops}
        onChange={handleChange}
        options={['GitHub Actions', 'Jenkins', 'GitLab CI', 'Docker', 'Kubernetes']}
      />
    </div>

    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.6 }}>
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>// </span>
      Stack selection influences use-case suitability scoring and provider recommendations. 
      .NET backend automatically elevates Azure suitability rating.
    </div>

    <button
      onClick={() => setPage('configuration')}
      className="niq-btn niq-btn-primary niq-btn-full"
    >
      Configure Infrastructure <ArrowRight size={14} />
    </button>
  </div>
);

export default TechStackPage;
