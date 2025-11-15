import React from "react";
import "../style/tools.css";
import { Link } from "react-router-dom";

const Tools = () => {
  return (
    <div className="tools-wrapper">
      <div className="tools-overlay">
        <h1 className="tools-title">Fitness Tools</h1>
        <p className="tools-subtitle">
          Track and enhance your fitness journey with our smart tools.
        </p>

        <div className="tools-container">

          {/* ------------------ TDEE CARD ------------------ */}
          <div className="tool-card">

           
            <div className="tool-icon">
              <img 
                src="/icons/tdee.png" 
                alt="TDEE Icon" 
                className="tool-img"
              />
            </div>

            <h2 className="tool-name">TDEE Calculator</h2>
            <p className="tool-desc">
              Calculate your daily calorie expenditure using precise formulas.
            </p>
            <Link to="/tdee" className="tool-btn">Try Now</Link>
          </div>

          {/* ------------------ BMI CARD ------------------ */}
          <div className="tool-card">

            <div className="tool-icon">
              <img 
                src="/icons/bmi.png" 
                alt="BMI Icon" 
                className="tool-img"
              />
            </div>

            <h2 className="tool-name">BMI Checker</h2>
            <p className="tool-desc">
              Quickly check if your weight aligns with your height range.
            </p>
            <button className="tool-btn">Try Now</button>
          </div>

          {/* ------------------ WORKOUT LOGGER ------------------ */}
          <div className="tool-card">

            <div className="tool-icon">
              <img 
                src="/icons/workout.png" 
                alt="Workout Icon" 
                className="tool-img"
              />
            </div>

            <h2 className="tool-name">Workout Tracker</h2>
            <p className="tool-desc">
              Log workouts and monitor progress effortlessly.
            </p>
            <button className="tool-btn">Try Now</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Tools;


