import React, { useState } from "react";
import "../style/information_setup.css";
import { useNavigate } from "react-router-dom";

const InformationSetup = () => {
  const navigate = useNavigate();

  // Step navigation
  const [step, setStep] = useState(1);

//supposed to be kinuha ko to from ern and I'm not sure here kay gi 
// ai ko lang, adjust nalang if ano then re design niyo saakin if ano man

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "Male",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Step navigation functions
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Submit final setup
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final data:", formData);
    alert("Profile setup complete!");
    navigate("/"); 
  };

  // Steps content
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <div className="form-row">
              <div className="form-half">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-half">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-half">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-half">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-placeholder">
            <p>Select your <span>equipment</span> here.</p>
            <div className="equipment-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="equipment-box"></div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-placeholder">
            <p>Choose target <span>muscle groups</span>.</p>
            <div className="equipment-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="equipment-box"></div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-placeholder">
            <p>Finalize your <span>exercise plan</span>.</p>
            <button type="submit" className="finish-btn">Finish Setup</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="info-setup-container">
      <div className="info-card">

        {/* Progress Steps */}
        <div className="steps">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`step ${step === num ? "active" : ""}`}
            >
              <div className="circle">{num}</div>
              <span className="label">
                {["Information", "Equipment", "Muscles", "Exercises"][num - 1]}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="buttons">
            {step > 1 && (
              <button type="button" className="prev-btn" onClick={prevStep}>
                Previous
              </button>
            )}
            {step < 4 && (
              <button type="button" className="next-btn" onClick={nextStep}>
                Continue
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InformationSetup;
