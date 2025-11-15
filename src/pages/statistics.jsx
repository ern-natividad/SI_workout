import React, { useState } from "react";
import "../style/statistics.css";

const StatisticsPage = () => {
  const [activeTab, setActiveTab] = useState("pr");

  const renderChart = () => {
    switch (activeTab) {
      case "pr":
        return <img src="/charts/pr_chart.png" alt="PR Progress" className="chart-image" />;
      case "calories":
        return <img src="/charts/calories_chart.png" alt="Calories Burned" className="chart-image" />;
      case "weight":
        return <img src="/charts/weight_chart.png" alt="Weight Progress" className="chart-image" />;
      default:
        return null;
    }
  };

  return (
    <div className="stats-page">
      <div className="stats-wrapper">

        <h1 className="stats-title">Statistics</h1>
        <p className="stats-desc">
          Track your fitness journey using <span className="highlight"> advanced analytics </span> 
           and <span className="highlight"> personalized insights</span>.
        </p>

        {/* TABS */}
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === "pr" ? "active" : ""}`}
            onClick={() => setActiveTab("pr")}
          >
            PR Progress
          </button>

          <button 
            className={`tab-btn ${activeTab === "calories" ? "active" : ""}`}
            onClick={() => setActiveTab("calories")}
          >
            Calories Burned
          </button>

          <button 
            className={`tab-btn ${activeTab === "weight" ? "active" : ""}`}
            onClick={() => setActiveTab("weight")}
          >
            Weight Progress
          </button>
        </div>

        {/* CHART DISPLAY */}
        <div className="chart-container">
          {renderChart()}
        </div>

        {/* SUMMARY CARDS */}
        <div className="stats-summary">
          <div className="summary-card">
            <p className="summary-title">Latest PR</p>
            <p className="summary-value">75 kg</p>
            <p className="summary-sub">Bench Press</p>
          </div>

          <div className="summary-card">
            <p className="summary-title">Weekly Calories</p>
            <p className="summary-value">2,140 kcal</p>
            <p className="summary-sub">Burned this week</p>
          </div>

          <div className="summary-card">
            <p className="summary-title">Current Weight</p>
            <p className="summary-value">65 kg</p>
            <p className="summary-sub">Updated 2 days ago</p>
          </div>
        </div>


        {/* PROGRESS OVERVIEW */}
        <h2 className="section-header">Progress Overview</h2>
        <div className="progress-grid">
          <div className="progress-card">
            <p className="p-title">Workout Consistency</p>
            <p className="p-value">82%</p>
          </div>

          <div className="progress-card">
            <p className="p-title">Total Workouts</p>
            <p className="p-value">67</p>
          </div>

          <div className="progress-card">
            <p className="p-title">Calories Burned</p>
            <p className="p-value">14,230 kcal</p>
          </div>

          <div className="progress-card">
            <p className="p-title">Monthly Progress</p>
            <p className="p-value">+12%</p>
          </div>
        </div>


        {/* WORKOUT HISTORY */}
        <h2 className="section-header">Workout History</h2>

        <div className="history-list">
          <div className="history-item">
            <div>
              <h4>Upper Body Strength</h4>
              <p className="history-meta">Jan 20 • 8 Exercises • 52 mins</p>
            </div>
            <span className="history-status completed">Completed</span>
          </div>

          <div className="history-item">
            <div>
              <h4>Leg Day</h4>
              <p className="history-meta">Jan 18 • 6 Exercises • 44 mins</p>
            </div>
            <span className="history-status completed">Completed</span>
          </div>

          <div className="history-item">
            <div>
              <h4>Core & HIIT</h4>
              <p className="history-meta">Jan 17 • 5 Exercises • 20 mins</p>
            </div>
            <span className="history-status missed">Skipped</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StatisticsPage;
