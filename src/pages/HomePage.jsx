import React, { useEffect, useState } from "react";
import "../style/homepage.css";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import WorkoutCard from "../components/WorkoutCard";
import fetchWithMiddleware from "../utils/fetchMiddleware";

const HomePage = () => {
  const { userId, userWeight } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [activePlans, setActivePlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetchWithMiddleware(
          `/api/workouts/plans?user_id=${userId}`,
          { method: "GET" }
        );

        if (res && res.success && res.plans) {
          setWorkoutPlans(res.plans);
          const open = res.plans.filter((p) => !p.end_at);
          setActivePlans(open);

          if (open.length > 0) {
            const latest = open[open.length - 1];
            setSelectedPlanId(latest.id);
            // fetch exercises for that plan
            const exRes = await fetchWithMiddleware(
              `/api/workouts/exercises?plan_id=${latest.id}`,
              { method: "GET" }
            );
            if (exRes && exRes.success && exRes.exercises) setExercises(exRes.exercises);
            else setExercises([]);
          } else {
            setSelectedPlanId(null);
            setExercises([]);
          }
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [userId]);

  const handleExerciseClick = (exercise, idx) => {
    setSelectedExercise(exercise);
    setSelectedExerciseIndex(idx);
  };

  const handleCloseWorkout = () => {
    setSelectedExercise(null);
    setSelectedExerciseIndex(null);
  };

  const handleNextExerciseFromCard = () => {
    const nextIdx = (selectedExerciseIndex || 0) + 1;
    if (nextIdx < exercises.length) {
      setSelectedExercise(exercises[nextIdx]);
      setSelectedExerciseIndex(nextIdx);
    }
  };

  const handleWorkoutComplete = async () => {
    // Refresh plans and exercises after a workout completes
    if (!userId) return;
    try {
      const res = await fetchWithMiddleware(
        `/api/workouts/plans?user_id=${userId}`,
        { method: "GET" }
      );
      if (res && res.success && res.plans) {
        setWorkoutPlans(res.plans);
        const open = res.plans.filter((p) => !p.end_at);
        setActivePlans(open);
        if (open.length > 0) {
          const latest = open[open.length - 1];
          setSelectedPlanId(latest.id);
          const exRes = await fetchWithMiddleware(
            `/api/workouts/exercises?plan_id=${latest.id}`,
            { method: "GET" }
          );
          if (exRes && exRes.success && exRes.exercises) setExercises(exRes.exercises);
          else setExercises([]);
        } else {
          setSelectedPlanId(null);
          setExercises([]);
        }
      }
    } catch (err) {
      console.error("Error refreshing plans:", err);
    }
  };

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
              <Link to="/information_setup" className="hp-primary">
                Create Workout
              </Link>
              <Link to="/statistics" className="hp-secondary">
                View Progress
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hp-stats-section">
        <div className="hp-stat-card">
          <h4>Current Weight</h4>
          <p className="hp-stat-large">{userWeight || "N/A"} <span style={{ fontSize: "0.7em" }}>kg</span></p>
          <p className="hp-muted">Your weight</p>
        </div>

        <div className="hp-stat-card">
          <h4>Total Plans</h4>
          <p className="hp-stat-large">{workoutPlans.length}</p>
          <p className="hp-muted">Workout plans created</p>
        </div>

        <div className="hp-stat-card">
          <h4>Exercises (current plan)</h4>
          <p className="hp-stat-large">{exercises.length}</p>
          <p className="hp-muted">Exercises in active plan</p>
        </div>
      </div>

      <div className="hp-workouts-section">
        <h2>Your Workout Plans</h2>

        {loading && <p>Loading workouts...</p>}

        {/* If user has plans but ALL are completed (end_at set), prompt to create a new workout */}
        

        {/* If active plan exists and has exercises, show grid */}
        {!loading && exercises.length > 0 && !selectedExercise && (
          <div className="exercises-grid">
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="exercise-card" onClick={() => handleExerciseClick(ex, idx)}>
                <div className="exercise-card-header">
                  <div className="exercise-card-dot"></div>
                  <h4>{ex.name}</h4>
                </div>
                <p className="exercise-card-info">{ex.sets} × {ex.reps} reps</p>
                <button type="button" className="exercise-card-btn" onClick={(e) => { e.stopPropagation(); handleExerciseClick(ex, idx); }}>
                  Start
                </button>
              </div>
            ))}
          </div>
        )}

        {/* If user has active plans but no exercises in that active plan */}
        {!loading && activePlans.length > 0 && exercises.length === 0 && (
          <div className="no-workouts">
            <p>No exercises in the active workout plan.</p>
            <Link to="/information_setup" className="hp-primary">Edit Workout Plan</Link>
          </div>
        )}

        {/* If there are no active plans (user must create one) */}
        {!loading && activePlans.length === 0 && (
          <div className="no-workouts">
            <p>No active workout plans. Create one to get started.</p>
            <Link to="/information_setup" className="hp-primary">Create Your First Workout</Link>
          </div>
        )}

        {/* Modal with WorkoutCard */}
        {selectedExercise && (
          <div className="modal-overlay" onClick={handleCloseWorkout}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <WorkoutCard
                exercise={selectedExercise}
                onClose={handleCloseWorkout}
                userId={userId}
                planId={selectedPlanId}
                onWorkoutComplete={handleWorkoutComplete}
                exerciseIndex={selectedExerciseIndex}
                exerciseCount={exercises.length}
                onNextExercise={handleNextExerciseFromCard}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

