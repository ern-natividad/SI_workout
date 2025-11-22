import React, { useState } from "react";
import "../style/bmi.css";

const BMI = () => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");
  const [idealRange, setIdealRange] = useState(null);

  const calcBMI = () => {
    const h = height / 100; // m
    const value = weight / (h * h);
    const rounded = Math.round(value * 10) / 10;
    setBmi(rounded);

    // Category (WHO)
    let cat = "Underweight";
    if (rounded >= 40) cat = "Obese Class III";
    else if (rounded >= 35) cat = "Obese Class II";
    else if (rounded >= 30) cat = "Obese Class I";
    else if (rounded >= 25) cat = "Overweight";
    else if (rounded >= 18.5) cat = "Normal weight";
    setCategory(cat);

    // Ideal weight range for current height (BMI 18.5 - 24.9)
    const minW = Math.round(18.5 * h * h * 10) / 10;
    const maxW = Math.round(24.9 * h * h * 10) / 10;
    setIdealRange({ min: minW, max: maxW });
  };

  const bmiDescription = (val) => {
    if (val == null) return "--";
    if (val < 16) return "Severe Thinness";
    if (val < 17) return "Moderate Thinness";
    if (val < 18.5) return "Mild Thinness";
    if (val < 25) return "Normal";
    if (val < 30) return "Overweight";
    if (val < 35) return "Obese Class I";
    if (val < 40) return "Obese Class II";
    return "Obese Class III";
  };

  return (
    <div className="bmi-wrapper">
      <div className="bmi-container">
        <header className="bmi-header">
          <h1>TDEE / BMI Checker</h1>
          <p className="bmi-sub">Standard BMI calculator with category and ideal weight range.</p>
        </header>

        <section className="bmi-form">
          <div className="inputs">
            <label>
              Weight (kg)
              <input
                type="number"
                min="20"
                max="500"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </label>

            <label>
              Height (cm)
              <input
                type="number"
                min="50"
                max="300"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </label>
          </div>

          <button className="calc-btn" onClick={calcBMI}>Calculate</button>
        </section>

        <section className="bmi-results">
          <div className="result-cards">
            <div className="stat-card stat-bmi">
              <div className="stat-value">{bmi != null ? bmi : "--"}</div>
              <div className="stat-label">BMI</div>
            </div>

            <div className="stat-card stat-category">
              <div className="stat-value small">{bmiDescription(bmi)}</div>
              <div className="stat-label">Category</div>
            </div>

            <div className="stat-card stat-risk">
              <div className="stat-value small">{category || "--"}</div>
              <div className="stat-label">Health Risk</div>
            </div>
          </div>

          <div className="info-panels">
            <div className="panel ideal-range">
              <h4>Ideal Weight Range</h4>
              <p>{idealRange ? `${idealRange.min} kg — ${idealRange.max} kg` : "Enter values and calculate"}</p>
            </div>

            <div className="panel bmi-scale">
              <h4>BMI Range (WHO)</h4>
              <ul>
                <li>Severe Thinness: &lt;16</li>
                <li>Moderate Thinness: 16–16.9</li>
                <li>Mild Thinness: 17–18.4</li>
                <li>Normal: 18.5–24.9</li>
                <li>Overweight: 25–29.9</li>
                <li>Obese I: 30–34.9</li>
                <li>Obese II: 35–39.9</li>
                <li>Obese III: ≥40</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BMI;
