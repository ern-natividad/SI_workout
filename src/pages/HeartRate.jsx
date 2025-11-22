import React, { useState, useMemo } from "react";
import "../style/heartRate.css";

const zoneDefs = [
  { id: 'warm', label: 'Warm Up Zone', min: 0.50, max: 0.60, desc: 'Recovery / warm-up intensity' },
  { id: 'fat', label: 'Fat Burn Zone', min: 0.60, max: 0.70, desc: 'Fat-burning, steady pace' },
  { id: 'aerobic', label: 'Aerobic Zone', min: 0.70, max: 0.80, desc: 'Cardio endurance' },
  { id: 'anaerobic', label: 'Anaerobic Zone', min: 0.80, max: 0.90, desc: 'High intensity / threshold' },
  { id: 'vo2', label: 'VO2 Max Zone', min: 0.90, max: 1.00, desc: 'Max effort / intervals' }
];

const HeartRate = () => {
  const [age, setAge] = useState(30);
  const [resting, setResting] = useState(60);

  // Simple maxHR estimator (220 - age)
  const maxHR = useMemo(() => Math.max(120, Math.round(220 - age)), [age]);

  // Compute zone BPM ranges
  const zones = useMemo(() => {
    return zoneDefs.map(z => ({
      ...z,
      minBpm: Math.round(z.min * maxHR),
      maxBpm: Math.round(z.max * maxHR)
    }));
  }, [maxHR]);

  return (
    <div className="hr-wrapper">
      <div className="hr-container">
        <header className="hr-header">
          <h1>Heart Rate Zones</h1>
          <p className="hr-sub">Discover your optimal heart rate zones for better training.</p>
        </header>

        <section className="hr-controls">
          <div className="control age-control">
            <label>Age: <strong>{age}</strong></label>
            <input type="range" min="15" max="90" value={age} onChange={(e)=>setAge(Number(e.target.value))} />
          </div>

          <div className="control resting-control">
            <label>Resting HR (bpm)</label>
            <input type="number" min="30" max="150" value={resting} onChange={(e)=>setResting(Number(e.target.value))} />
          </div>
        </section>

        <section className="hr-summary">
          <div className="hr-card">
            <div className="hr-icon">❤</div>
            <div className="hr-values">
              <div className="hr-max">Max HR</div>
              <div className="hr-number">{maxHR} bpm</div>
            </div>
          </div>

          <div className="hr-card small">
            <div className="hr-values">
              <div className="hr-max">Resting</div>
              <div className="hr-number small">{resting} bpm</div>
            </div>
          </div>
        </section>

        <section className="hr-zones">
          <h3>Target Training Zones</h3>
          <div className="zones-list">
            {zones.map((z, idx) => (
              <div key={z.id} className={`zone-card zone-${z.id}`}>
                <div className="zone-left">
                  <div className="zone-title">{z.label}</div>
                  <div className="zone-desc">{z.desc}</div>
                </div>
                <div className="zone-right">{z.minBpm} - {z.maxBpm} bpm</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HeartRate;
