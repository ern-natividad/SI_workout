import React, { useState } from "react";
import "../style/workout.css";
import placeholder from "../assets/background.jpg";
import ExerciseImage from "../components/ExerciseImage";

const exercises = [
  {
    id: 1,
    name: "Push Ups",
    sets: 3,
    reps: 12,
    image: "/exercises/pushup.jpg"
  },
  {
    id: 2,
    name: "Squats",
    sets: 4,
    reps: 15,
    image: "/exercises/squat.jpg"
  },
  {
    id: 3,
    name: "Plank",
    sets: 3,
    reps: 45, // seconds? but still “reps only” in UI
    image: "/exercises/plank.jpg"
  }
];

const WorkoutPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);

  const exercise = exercises[currentIndex];

  const handleNext = () => {
    setHistory(prev => [...prev, exercise]);
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDone = () => {
    setHistory(prev => [...prev, exercise]);
    alert("Workout Completed!");
  };

  const progress = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <div className="workout-wrapper">
     
      <div className="workout-left">
        <ExerciseImage gifUrl={exercise.gifUrl} exerciseId={exercise.id} width={480} className="exercise-img" alt={exercise.name} />
      </div>

      {/* Exercise Info */}
      <div className="workout-center">
        <h1>{exercise.name}</h1>
        <p className="sub">Stay focused — you’ve got this!</p>

        <div className="exercise-info-card">
          <h2>Sets: {exercise.sets}</h2>
          <h2>Reps: {exercise.reps}</h2>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">
            {currentIndex + 1} / {exercises.length} Exercises
          </p>
        </div>

        {/* Buttons */}
        <div className="workout-btns">
          <button className="skip-btn" onClick={handleSkip}>Skip</button>
          {currentIndex === exercises.length - 1 ? (
            <button className="finish-btn" onClick={handleDone}>Finish</button>
          ) : (
            <button className="next-btn" onClick={handleNext}>Next</button>
          )}
        </div>
      </div>

      {/* Completed Exercises */}
      <div className="workout-right">
        <h3 className="history-title">Completed</h3>

        <div className="history-list">
          {history.length === 0 && (
            <p className="no-history">No exercises completed yet.</p>
          )}

          {history.map((h, i) => (
            <div className="history-item" key={i}>
              <span className="dot"></span>
              <p>{h.name} — {h.sets} x {h.reps}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPage;

