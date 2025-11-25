import React, { useState, useEffect } from "react";
import "../style/statistics.css";
import fetchWithMiddleware from "../utils/fetchMiddleware";
import { useAuth } from "../components/AuthContext";

const StatisticsPage = () => {
  const [activeTab, setActiveTab] = useState("pr");
  const [progress, setProgress] = useState([]);
  const [expandedWorkouts, setExpandedWorkouts] = useState([]);
  const [workoutsByPlan, setWorkoutsByPlan] = useState({});
  const [setsByProgress, setSetsByProgress] = useState({});
  const [baseProgress, setBaseProgress] = useState([]);
  const [serverTotals, setServerTotals] = useState(null);
  const { userId } = useAuth();

  useEffect(() => {
    const loadProgress = async () => {
      if (!userId) return;
      try {
        const res = await fetchWithMiddleware(`/api/workouts/progress?user_id=${userId}`, { method: 'GET' });
        if (res && res.success && res.progress) {
          setProgress(res.progress);
          // capture base snapshot for metrics (so deleting entries doesn't remove calories totals)
          setBaseProgress(prev => (prev.length === 0 ? res.progress : prev));
          if (res.totals) setServerTotals(res.totals);
        }
      } catch (err) {
        console.error('Error loading progress:', err);
      }
    };
    loadProgress();
  }, [userId]);

  // Derived stats
  const totalWorkouts = progress.length;
  // Prefer server-provided totals (includes deleted rows) so deleting entries doesn't change displayed totals
  const calorieSource = (baseProgress && baseProgress.length > 0) ? baseProgress : progress;
  const totalCalories = serverTotals?.total_calories_all ?? calorieSource.reduce((s, p) => s + (Number(p.calories_burned) || 0), 0);
  const weeklyCalories = serverTotals?.weekly_calories_all ?? calorieSource.filter(p => (new Date() - new Date(p.completed_at)) / (1000*60*60*24) <= 7)
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

  // Estimate weight lost (kg) from total calories burned.
  // Common approximation: 1 kg body fat ≈ 7700 kcal.
  const KCAL_PER_KG = 7700;
  const lostWeightKg = totalCalories ? Number((totalCalories / KCAL_PER_KG).toFixed(2)) : 0;

  // Monthly progress: compare calories burned in last 30 days vs previous 30 days
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const now = new Date();
  const startCurrent = new Date(now.getTime() - 30 * MS_PER_DAY);
  const startPrev = new Date(now.getTime() - 60 * MS_PER_DAY);

  const currentMonthCalories = calorieSource
    .filter(p => new Date(p.completed_at) >= startCurrent)
    .reduce((s, p) => s + (Number(p.calories_burned) || 0), 0);

  const prevMonthCalories = calorieSource
    .filter(p => {
      const d = new Date(p.completed_at);
      return d >= startPrev && d < startCurrent;
    })
    .reduce((s, p) => s + (Number(p.calories_burned) || 0), 0);

  let monthlyChangeDisplay = '—';
  if (prevMonthCalories === 0 && currentMonthCalories === 0) {
    monthlyChangeDisplay = '—';
  } else if (prevMonthCalories === 0 && currentMonthCalories > 0) {
    monthlyChangeDisplay = `+100%`;
  } else {
    const change = ((currentMonthCalories - prevMonthCalories) / Math.max(1, prevMonthCalories)) * 100;
    const rounded = Math.round(change);
    monthlyChangeDisplay = `${rounded > 0 ? '+' : ''}${rounded}%`;
  }

  return (
    <div className="stats-page">
      <div className="stats-wrapper">

        <h1 className="stats-title">Statistics</h1>
        <p className="stats-desc">
          Track your fitness journey using <span className="highlight"> advanced analytics </span>
           and <span className="highlight"> personalized insights</span>.
        </p>
        

        {/* SUMMARY CARDS */}
        <div className="stats-summary">

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
          
          {/* calculate lost weight based on total calories burned */}
           <div className="summary-card">
            <p className="summary-title">Lost Weight</p>
            <p className="summary-value">{lostWeightKg} kg</p>
            <p className="summary-sub">Estimated from total calories burned (approx.)</p>
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
            <p className="p-value">{totalWorkouts > 0 ? `${monthlyChangeDisplay} • ${currentMonthCalories.toLocaleString()} kcal` : '—'}</p>
          </div>
        </div>


        {/* WORKOUT HISTORY (from progress table) */}
        <h2 className="section-header">Workout History</h2>

        <div className="history-list">
          {progress.length === 0 && <p>No completed workouts yet.</p>}
          {progress.map((p) => {
            const isExpanded = expandedWorkouts.includes(p.id);

            // Attempt to normalize exercises data from the progress record.
            let exercises = [];
            if (Array.isArray(p.exercises)) {
              exercises = p.exercises;
            } else if (p.exercises && typeof p.exercises === 'string') {
              try {
                exercises = JSON.parse(p.exercises);
              } catch (e) {
                // fallback: try to split simple CSV-like strings (name|sets|reps per line)
                exercises = p.exercises.split('\n').map(line => ({ name: line }));
              }
            } else if (p.exercise_list && Array.isArray(p.exercise_list)) {
              exercises = p.exercise_list;
            } else if (p.details && p.details.exercises) {
              exercises = p.details.exercises;
            }

            const handleToggle = async () => {
              // If expanding and we don't have exercises for the plan yet, fetch them.
              const willExpand = !expandedWorkouts.includes(p.id);
              if (willExpand && !workoutsByPlan[p.plan_id]) {
                try {
                  const res = await fetchWithMiddleware(`/api/workouts/exercises?plan_id=${p.plan_id}`, { method: 'GET' });
                  if (res && res.success && Array.isArray(res.exercises)) {
                    setWorkoutsByPlan(prev => ({ ...prev, [p.plan_id]: res.exercises }));
                  } else {
                    console.warn('Plan exercises response missing or invalid for plan', p.plan_id, res);
                    setWorkoutsByPlan(prev => ({ ...prev, [p.plan_id]: [] }));
                  }
                } catch (err) {
                  console.error('Failed to fetch plan exercises:', err);
                  setWorkoutsByPlan(prev => ({ ...prev, [p.plan_id]: [] }));
                }
              }

              // Also fetch per-set data for this progress entry (if not already loaded)
              if (willExpand && !setsByProgress[p.id]) {
                try {
                  // Prefer querying by progress_id (the progress row id) for exact match
                  const qByProgress = `/api/workouts/sets?progress_id=${p.id}`;
                  let sr = await fetchWithMiddleware(qByProgress, { method: 'GET' });

                  // If no sets found via progress_id, fall back to time/plan-based query
                  if (!(sr && sr.success && Array.isArray(sr.sets) && sr.sets.length > 0)) {
                    const q = `/api/workouts/sets?user_id=${userId}&plan_id=${p.plan_id}&completed_at=${encodeURIComponent(p.completed_at)}`;
                    sr = await fetchWithMiddleware(q, { method: 'GET' });
                  }
                  console.debug('Sets fetch response for progress', p.id, sr);
                  if (sr && sr.success && Array.isArray(sr.sets) && sr.sets.length > 0) {
                    // Normalize set rows so rendering can rely on consistent field names
                    const normalized = sr.sets.map((s, idx) => ({
                      id: s.id ?? `tmp-${idx}`,
                      exercise_name: s.exercise_name || s.exercise_name || (s.exercise || s.name) || 'Unknown',
                      reps: s.reps ?? s.repetition ?? s.rep_count ?? null,
                      weight_value: (s.weight_value !== undefined && s.weight_value !== null) ? s.weight_value : (s.weight ?? null),
                      weight_unit: s.weight_unit || s.unit || '',
                      set_index: s.set_index ?? (s.setIndex ?? (idx + 1)),
                      created_at: s.created_at || s.createdAt || null,
                    }));
                    console.debug('Normalized sets for progress', p.id, normalized);
                    setSetsByProgress(prev => ({ ...prev, [p.id]: normalized }));
                  } else {
                    // Fallback: fetch recent sets for the user and try to match by time window
                    console.debug('No sets returned for plan/time — attempting fallback fetch by user_id');
                    try {
                      const allResp = await fetchWithMiddleware(`/api/workouts/sets?user_id=${userId}`, { method: 'GET' });
                      const allSets = (allResp && allResp.success && Array.isArray(allResp.sets)) ? allResp.sets : [];

                      // If there are sets, filter them by proximity to the progress completed_at (24h window)
                      let filtered = [];
                      if (allSets.length > 0) {
                        const ref = p.completed_at ? new Date(p.completed_at) : null;
                        const DAY_MS = 24 * 60 * 60 * 1000;

                        // Try to get exercise names for matching
                        const planExercises = (workoutsByPlan[p.plan_id] && workoutsByPlan[p.plan_id].length > 0) ? workoutsByPlan[p.plan_id] : exercises;
                        const names = planExercises.map(e => (typeof e === 'string' ? e : (e.name || e.exercise_name || '') )).filter(Boolean).map(n => n.toLowerCase());

                        filtered = allSets.filter(s => {
                          // match time window if reference provided
                          if (ref) {
                            const created = new Date(s.created_at || s.createdAt || s.createdAt);
                            if (isNaN(created.getTime())) return false;
                            const diff = Math.abs(created.getTime() - ref.getTime());
                            if (diff > DAY_MS) return false;
                          }

                          // match by exercise name when possible
                          if (names.length > 0 && s.exercise_name) {
                            const exName = (s.exercise_name || '').toLowerCase();
                            return names.some(n => exName.includes(n) || n.includes(exName));
                          }

                          return true;
                        });
                      }

                      // Normalize filtered fallback results as well
                      const normalizedFiltered = filtered.map((s, idx) => ({
                        id: s.id ?? `tmp-f-${idx}`,
                        exercise_name: s.exercise_name || s.exercise || s.name || 'Unknown',
                        reps: s.reps ?? s.repetition ?? s.rep_count ?? null,
                        weight_value: (s.weight_value !== undefined && s.weight_value !== null) ? s.weight_value : (s.weight ?? null),
                        weight_unit: s.weight_unit || s.unit || '',
                        set_index: s.set_index ?? (s.setIndex ?? (idx + 1)),
                        created_at: s.created_at || s.createdAt || null,
                      }));
                      console.debug('Normalized fallback sets for progress', p.id, normalizedFiltered);
                      setSetsByProgress(prev => ({ ...prev, [p.id]: normalizedFiltered }));
                    } catch (fallbackErr) {
                      console.error('Fallback sets fetch failed:', fallbackErr);
                      setSetsByProgress(prev => ({ ...prev, [p.id]: [] }));
                    }
                  }
                } catch (err) {
                  console.error('Failed to fetch sets for progress:', err);
                  setSetsByProgress(prev => ({ ...prev, [p.id]: [] }));
                }
              }

              setExpandedWorkouts(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]);
            };

            const handleDelete = async () => {
              if (!window.confirm('Delete this workout history entry? This cannot be undone.')) return;
              try {
                // Call DELETE endpoint and only remove locally if server confirms deletion.
                const res = await fetchWithMiddleware(`/api/workouts/delete?id=${p.id}`, { method: 'DELETE' });
                if (res && (res.success || res.deleted)) {
                  setProgress(prev => prev.filter(item => item.id !== p.id));
                } else {
                  console.warn('Delete request did not confirm deletion:', res);
                  alert('Server did not confirm deletion. Please try again.');
                }
              } catch (err) {
                console.error('Failed to delete workout:', err);
                // If the failure is unauthorized, fetchWithMiddleware will dispatch auth-logout.
                alert('Failed to delete workout. Check your network/authentication and try again.');
              }
            };

            return (



              <div className="history-item" key={p.id}>



                <div style={{display:'flex',flexDirection:'row', justifyContent:'space-between', alignItems:'center', gap:'15px'}}>

                  <div style={{ display:'flex', flexDirection:'column',alignItems:'center', gap:'15px'}}>
                    <div>
                      <h4>{p.plan_title || `Plan ${p.plan_id}`}</h4>
                      <p className="history-meta">{new Date(p.completed_at).toLocaleString()} • {p.calories_burned || 0} kcal</p>
                    </div>
                    <span className="history-status completed">Completed</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',gap: 8, alignItems: 'center' }}>
                    
                    <div style={{margin : '10px', paddingBottom : '25px'}}>
                      <button type="button" className="history-status completed" onClick={handleToggle}>{isExpanded ? 'Hide' : 'View'}</button>
                      <button type="button" className="history-status completed" onClick={handleDelete} style={{backgroundColor:'red'}} >Delete</button>
                    </div>
                  </div>

                </div>

                {isExpanded && (
                  <div className="history-details" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', }}>
                    { /** Prefer plan exercises fetched from server, fallback to any embedded exercises */ }
                    {((workoutsByPlan[p.plan_id] || []).length === 0 && exercises.length === 0) && <p>No exercise details available for this workout.</p>}
                    {
                      // If we have per-set data, show it grouped by exercise name.
                      (setsByProgress[p.id] && setsByProgress[p.id].length > 0) ? (
                        (() => {
                          const arr = setsByProgress[p.id];
                          const grouped = arr.reduce((acc, s) => {
                            const key = s.exercise_name || (s.exercise_id ? `id:${s.exercise_id}` : 'Unknown');
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(s);
                            return acc;
                          }, {});

                          return Object.keys(grouped).map((k, i) => {
                            const list = grouped[k];
                            return (
                              <div key={i} className="history-exercise-row" style={{ width: '100%', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ flex: 1 }}>{k}</div>
                                  <div style={{ width: 220, textAlign: 'right' }}>
                                    {list.map((s, idx2) => (
                                      <div key={idx2} style={{ fontSize: 13, color: '#ddd' }}>{`Set ${s.set_index || idx2+1}: ${s.reps} reps${s.weight_value ? ` @ ${s.weight_value}${s.weight_unit||''}` : ''}`}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()
                      ) : (
                        // Fallback to plan/exercise list if no per-set data
                        (workoutsByPlan[p.plan_id] || exercises).map((ex, idx) => {
                          const name = typeof ex === 'string' ? ex : (ex.name || ex.exercise_name || ex.title || ex.workout_name || ex.name || 'Exercise');
                          const sets = ex.sets ?? ex.reps_set ?? ex.set_count ?? ex.sets_count ?? '-';
                          const reps = ex.reps ?? ex.rep_count ?? ex.repetition ?? ex.reps_count ?? '-';
                          return (
                            <div key={idx} className="history-exercise-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                              <div style={{ flex: 1 }}>{name}</div>
                              <div style={{ width: 120, textAlign: 'right' }}>{sets} sets • {reps} reps</div>
                            </div>
                          );
                        })
                      )
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default StatisticsPage;
