import React, { useState, useEffect } from "react";
import "../style/statistics.css";
import fetchWithMiddleware from "../utils/fetchMiddleware";
import { useAuth } from "../components/AuthContext";

const StatisticsPage = () => {
  const [activeTab, setActiveTab] = useState("pr");
  const [progress, setProgress] = useState([]);
  const { userId } = useAuth();

  useEffect(() => {
    const loadProgress = async () => {
      if (!userId) return;
      try {
        const res = await fetchWithMiddleware(`/api/workouts/progress?user_id=${userId}`, { method: 'GET' });
        if (res && res.success && res.progress) {
          setProgress(res.progress);
        }
      } catch (err) {
        console.error('Error loading progress:', err);
      }
    };
    loadProgress();
  }, [userId]);

  // Derived stats
  const totalWorkouts = progress.length;
  const totalCalories = progress.reduce((s, p) => s + (Number(p.calories_burned) || 0), 0);
  const weeklyCalories = progress.filter(p => (new Date() - new Date(p.completed_at)) / (1000*60*60*24) <= 7)
                                .reduce((s,p) => s + (Number(p.calories_burned) || 0), 0);
  const weightHistory = progress
    .filter(p => p.weight_kg !== null && p.weight_kg !== undefined)
    .map(p => ({ date: p.completed_at, weight: Number(p.weight_kg) }))
    .reverse();

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null;
  const bestPR = progress.reduce((max, p) => {
    // treat PR as max weight recorded
    const w = Number(p.weight_kg) || 0;
    return w > max ? w : max;
  }, 0);

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

        {/* SUMMARY CARDS */}
        <div className="stats-summary">
          <div className="summary-card">
            <p className="summary-title">Latest PR (weight)</p>
            <p className="summary-value">{bestPR ? `${bestPR} kg` : '—'}</p>
            <p className="summary-sub">Highest recorded weight</p>
          </div>

          <div className="summary-card">
            <p className="summary-title">Weekly Calories</p>
            <p className="summary-value">{weeklyCalories} kcal</p>
            <p className="summary-sub">Burned this week</p>
          </div>

          <div className="summary-card">
            <p className="summary-title">Current Weight</p>
            <p className="summary-value">{latestWeight ? `${latestWeight} kg` : '—'}</p>
            <p className="summary-sub">Based on last completed workout</p>
          </div>
        </div>

        {/* PROGRESS OVERVIEW */}
        <h2 className="section-header">Progress Overview</h2>
        <div className="progress-grid">
          <div className="progress-card">
            <p className="p-title">Workout Consistency</p>
            <p className="p-value">{totalWorkouts > 0 ? `${Math.round((totalWorkouts / Math.max(1, 30)) * 100)}%` : '—'}</p>
          </div>

          <div className="progress-card">
            <p className="p-title">Total Workouts</p>
            <p className="p-value">{totalWorkouts}</p>
          </div>

          <div className="progress-card">
            <p className="p-title">Calories Burned</p>
            <p className="p-value">{totalCalories} kcal</p>
          </div>

          <div className="progress-card">
            <p className="p-title">Monthly Progress</p>
            <p className="p-value">{totalWorkouts > 0 ? '+12%' : '—'}</p>
          </div>
        </div>


        {/* WORKOUT HISTORY (from progress table) */}
        <h2 className="section-header">Workout History</h2>

        <div className="history-list">
          {progress.length === 0 && <p>No completed workouts yet.</p>}
          {progress.map((p) => (
            <div className="history-item" key={p.id}>
              <div>
                <h4>{p.plan_title || `Plan ${p.plan_id}`}</h4>
                <p className="history-meta">{new Date(p.completed_at).toLocaleString()} • {p.calories_burned || 0} kcal</p>
              </div>
              <span className="history-status completed">Completed</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StatisticsPage;
