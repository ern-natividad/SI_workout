import React from "react";
import "../style/homepage.css";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="hp-dashboard">

      <div className="hp-hero-section">
        <div className="hp-hero-left">
          <div className="hp-hero-text">
            <h1>
              Push Yourself <br />
              <span>To The Limits.</span>
            </h1>

            <p>
              Every step you take today brings you closer to your strongest self.
            </p>

            <div className="hp-hero-cta">
              <Link to="/workout" className="hp-primary">Create Workout</Link>
              <Link to="/statistics" className="hp-secondary">View Progress</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hp-stats-section">

        <div className="hp-stat-card">
          <h4>Current Weight</h4>
          <p className="hp-stat-large">65 kg</p>
          <p className="hp-muted">Updated 2 days ago</p>
        </div>

        <div className="hp-stat-card">
          <h4>Weekly Workout</h4>
          <p className="hp-stat-large">4 Sessions</p>
          <p className="hp-muted">+1 this week</p>
        </div>

        <div className="hp-stat-card">
          <h4>Exercise Progress</h4>
          <p className="hp-muted">68% Completed</p>

          <div className="hp-progress-bar">
            <div className="hp-progress-fill" style={{ width: "68%" }}></div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default HomePage;

