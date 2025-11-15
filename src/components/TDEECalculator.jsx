import React, { useState } from "react";
import "../style/Tdee.css";

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const calculateBMR = (w, h, age, gender) => {
  let s = gender === "Male" ? 5 : -161;
  return 10 * w + 6.25 * h - 5 * age + s;
};

function TDEECalculator() {
  const [formData, setFormData] = useState({
    weight_kg: "",
    height_cm: "",
    age: "",
    gender: "Male",
    activity: "moderate",
  });

  const [results, setResults] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const { weight_kg, height_cm, age, gender, activity } = formData;

    if (weight_kg <= 0 || height_cm <= 0 || age <= 0) {
      setMessage("Please enter valid positive values.");
      setResults(null);
      return;
    }

    const bmr = calculateBMR(
      parseFloat(weight_kg),
      parseFloat(height_cm),
      parseInt(age),
      gender
    );
    const tdee = bmr * activityMultipliers[activity];

    setResults({
      bmr: bmr.toFixed(0),
      tdee: tdee.toFixed(0),
    });
  };

  return (
    <div className="tdee-wrapper">
      <div className="tdee-container">
        <h1 className="tdee-title">TDEE / Calorie Calculator</h1>
        <p className="tdee-desc">
          Calculate your <span>BMR</span> and <span>TDEE</span> to optimize your
          nutrition and training.
        </p>

        {message && <div className="tdee-error">{message}</div>}

        <form className="tdee-form" onSubmit={handleSubmit}>
          <div className="tdee-row">
            <div className="tdee-field">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
              />
            </div>

            <div className="tdee-field">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="tdee-row">
            <div className="tdee-field">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div className="tdee-field">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          <div className="tdee-field full">
            <label>Activity Level</label>
            <select
              name="activity"
              value={formData.activity}
              onChange={handleChange}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="active">Very Active</option>
              <option value="very_active">Extremely Active</option>
            </select>
          </div>

          <button className="tdee-btn" type="submit">
            Calculate
          </button>
        </form>

        {results && (
          <div className="tdee-results">
            <h2>Your Results</h2>

            <div className="result-box">
              <span>BMR</span>
              <strong>{results.bmr}</strong>
            </div>

            <div className="result-box">
              <span>TDEE</span>
              <strong>{results.tdee} kcal/day</strong>
            </div>

            <p className="note">
              Use TDEE to plan calorie deficit or surplus depending on your
              fitness goals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TDEECalculator;



