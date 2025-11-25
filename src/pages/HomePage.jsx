import React, { useEffect, useState } from "react";
import "../style/homepage.css";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import WorkoutCard from "../components/WorkoutCard";
import fetchWithMiddleware from "../utils/fetchMiddleware";
import { fetchData, excerciseOptions } from "../utils/fetchData";
import placeholder from "../assets/background.jpg";
import ExerciseImage from "../components/ExerciseImage";


const HomePage = () => {
  const { userId, userWeight } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [activePlans, setActivePlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [search, setSearch] = useState([]);
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

  // When exercises are loaded, fetch images (gifUrl) from the exercise API proxy.
  // Ordering: 1) prefer gifUrl from metadata endpoints, 2) try proxied exercisedb image by id (last-resort), 3) leave empty -> placeholder in ExerciseCard.
  useEffect(() => {
    if (!exercises || exercises.length === 0) return;
    if (exercises.every((e) => e && e.gifUrl)) return; // already resolved (use gifUrl only)

    let mounted = true;

    const pickGif = (obj) => obj && (obj.gifUrl || '');

    // Local curated fallbacks by bodyPart.
    // Place image files in `public/bodyparts/<bodyPart>.jpg` (see /public/bodyparts/README.md)
    // Example: public/bodyparts/chest.jpg
    const LOCAL_BY_PART = {
      chest: '/bodyparts/chest.jpg',
      back: '/bodyparts/back.jpg',
      legs: '/bodyparts/legs.jpg',
      shoulders: '/bodyparts/shoulders.jpg',
      'upper arms': '/bodyparts/upper_arms.jpg',
      'lower arms': '/bodyparts/lower_arms.jpg',
      'upper legs': '/bodyparts/upper_legs.jpg',
      'lower legs': '/bodyparts/lower_legs.jpg',
      core: '/bodyparts/core.jpg',
      waist: '/bodyparts/waist.jpg',
      neck: '/bodyparts/neck.jpg',
      cardio: '/bodyparts/cardio.jpg',
    };

    const API_BASE = import.meta.env.VITE_API_BASE || '';
    const EXERCISE_DB_HOST = 'exercisedb.p.rapidapi.com';

    // Query metadata by name and return id-based proxy URL (most reliable)
    const fetchOneImage = async (ex) => {
      if (ex.gifUrl) return ex;
      try {
        // Send the raw exercise name to the server; the server will encode it
        // when proxying to the upstream exercisedb API. Avoid double-encoding here.
        const name = ex.name || '';
        const data = await fetchWithMiddleware(`/api/exercises/name/${name}`, { method: 'GET' });

        let upstreamId = null;
        if (Array.isArray(data) && data.length > 0) {
          upstreamId = data[0].id || null;
        } else if (data && typeof data === 'object') {
          upstreamId = data.id || null;
        }

        // Prefer id-based proxy URL if we have an upstream id (most reliable).
        // This ensures images load even if gifUrl field is missing or unavailable.
        if (upstreamId) {
          return { ...ex, gifUrl: API_BASE + `/api/exercises/imageById?exerciseId=${encodeURIComponent(upstreamId)}&resolution=360` };
        }

        return ex;
      } catch (err) {
        return ex;
      }
    };

    const fetchImages = async () => {
      try {
        // Try to read persisted snapshot images first (fast fallback)
        let imagesByName = {};
        try {
          const snap = await fetchWithMiddleware('/api/exercises/imagesByName', { method: 'GET' });
          if (snap && typeof snap === 'object') imagesByName = snap;
        } catch (e) {
          // ignore snapshot read errors
        }

        const results = [];
        for (const ex of exercises) {
          // Try multiple snapshot key formats for robustness (raw, trimmed, lowercased, and URI-encoded variants)
          const rawName = ex.name || '';
          const trimmed = rawName.trim();
          const lower = rawName.toLowerCase();
          const encoded = encodeURIComponent(rawName);
          const encodedTrimmed = encodeURIComponent(trimmed);
          const encodedLower = encodeURIComponent(lower);
          const nameKeys = [rawName, trimmed, lower, encoded, encodedTrimmed, encodedLower];
          let snapshotVal = null;
          for (const k of nameKeys) {
            if (imagesByName && Object.prototype.hasOwnProperty.call(imagesByName, k) && imagesByName[k]) {
              snapshotVal = imagesByName[k];
              break;
            }
          }

          // If snapshot has an image for this name, use it immediately
          if (snapshotVal) {
            results.push({ ...ex, gifUrl: snapshotVal });
            // small delay to be gentle
            // eslint-disable-next-line no-await-in-loop
            await new Promise((rsv) => setTimeout(rsv, 30));
            continue;
          }

          // Otherwise query metadata endpoint for gifUrl (sequential-ish to avoid aggressive parallel calls)
          // eslint-disable-next-line no-await-in-loop
          const r = await fetchOneImage(ex);

          // If metadata didn't return a usable gifUrl, fall back to curated local bodyPart asset
          if ((!r.gifUrl) && ex.bodyPart) {
            const local = LOCAL_BY_PART[ex.bodyPart] || placeholder;
            results.push({ ...r, gifUrl: local });
          } else {
            results.push(r);
          }

          // small delay between external requests
          // eslint-disable-next-line no-await-in-loop
          await new Promise((rsv) => setTimeout(rsv, 40));
        }
        if (mounted) {
          setExercises(results);
          // If a modal is open for a selected exercise, update it with the resolved gifUrl
          try {
            if (selectedExercise) {
              const updated = results.find((r) => r && r.id === selectedExercise.id);
              if (updated) setSelectedExercise(updated);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error('Error fetching exercise images:', err);
      }
    };

    fetchImages();
    return () => { mounted = false; };
  }, [exercises]);

  // When exercises are loaded, fetch images (gifUrl) from the exercise API proxy
  

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

  const handleWorkoutComplete = async (planClosed) => {
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

            <div className="hp-hero-cta">
              <Link to="/information_setup" className="hp-primary">
                Create Workout
              </Link>
              <Link to="/statistics" className="hp-secondary">
                View Progress
              </Link>
            </div>

            {exercises.map((ex, idx) => (
              <div key={ex.id} className="exercise-card" onClick={() => handleExerciseClick(ex, idx)}>
                <div className="exercise-card-header" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '70px',
                }} >
                  <ExerciseImage
                    gifUrl={ex.gifUrl}
                    exerciseId={ex.id}
                    alt={ex.name || 'Exercise demonstration'}
                    className="exercise-thumb"
                    width={240}
                  />

                  {/*<div className="exercise-card-dot"></div>*/}
                  <div style={{
                    width : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}>
                    <h4 className="ex-card-name" style={{fontSize: '25px'}} >{ex.name}</h4>
                  <p className="exercise-card-info" style={{fontSize: '18px'}} >{ex.sets} × {ex.reps} reps</p>
                    <button type="button" className="exercise-card-btn" onClick={(e) => { e.stopPropagation(); handleExerciseClick(ex, idx); }}>
                      Start
                    </button>
                  </div>
                  
                </div>
                
                
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

