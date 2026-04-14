import React from 'react';

export const NiqField = ({ icon, label, name, value, onChange, type = 'select', options, min, step }) => (
  <div className="niq-field">
    <label className="niq-label">{label}</label>
    <div className={`niq-input-wrap ${type === 'select' ? 'is-select' : ''}`}>
      {icon && <span className="niq-input-icon">{icon}</span>}
      {type === 'select' ? (
        <select name={name} value={value} onChange={onChange} className={`niq-select ${icon ? 'has-icon' : ''}`}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          step={step}
          className={`niq-input ${icon ? 'has-icon' : ''}`}
        />
      )}
    </div>
  </div>
);

export const NiqToggle = ({ label, name, checked, onChange }) => (
  <div className="niq-toggle-row">
    <span className="niq-toggle-label">{label}</span>
    <label className="niq-toggle">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span className="niq-toggle-slider"></span>
    </label>
  </div>
);
