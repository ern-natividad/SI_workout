import React, { useState, useEffect } from 'react';
import '../style/WorkoutCard.css';
import ExerciseImage from '../components/ExerciseImage';

import fetchWithMiddleware from '../utils/fetchMiddleware';
import { useAuth } from './AuthContext';

const WorkoutCard = ({ exercise, index, onClose, userId, planId, onWorkoutComplete, exerciseIndex, exerciseCount, onNextExercise }) => {
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState('');
    const [weightType, setWeightType] = useState('weight');
    const [weightValue, setWeightValue] = useState('');
    const [weightUnit, setWeightUnit] = useState('kg');
    const [useBodyweight, setUseBodyweight] = useState(false);
    const [completedSets, setCompletedSets] = useState([]);
    const [completedExercises, setCompletedExercises] = useState([]);
    const [currentExercise, setCurrentExercise] = useState(exercise);
    const [isSaving, setIsSaving] = useState(false);

    const handleWeightTypeChange = (e) => {
        const type = e.target.value;
        setWeightType(type);
        if (type === 'bodyweight') {
            setUseBodyweight(true);
            setWeightValue('');
        } else {
            setUseBodyweight(false);
            setWeightValue('');
        }
    };

    const { userWeight } = useAuth();

    // Keep internal currentExercise in sync when parent passes a new exercise object
    useEffect(() => {
        setCurrentExercise(exercise);
    }, [exercise]);

    const estimateCaloriesFromExercises = (exercises) => {
        // Heuristic: calories approximated from total lifted volume (reps * weight)
        // calories = totalVolumeKg * 0.1  (simple heuristic: 1000 kg lifted -> ~100 kcal)
        let totalVolumeKg = 0;
        for (const ex of exercises) {
            if (!ex.sets || ex.sets.length === 0) continue;
            for (const s of ex.sets) {
                const reps = Number(s.reps) || 0;
                const weight = s.weightType === 'bodyweight' ? (Number(userWeight) || 0) : (Number(s.weightValue) || 0);
                totalVolumeKg += reps * weight;
            }
        }
        return Math.round(totalVolumeKg * 0.1);
    };

    const estimateCaloriesForExercise = (ex) => {
        if (!ex || !ex.sets || ex.sets.length === 0) return 0;
        let totalVolumeKg = 0;
        for (const s of ex.sets) {
            const reps = Number(s.reps) || 0;
            const weight = s.weightType === 'bodyweight' ? (Number(userWeight) || 0) : (Number(s.weightValue) || 0);
            totalVolumeKg += reps * weight;
        }
        return Math.round(totalVolumeKg * 0.1);
    };

    const handleNextExercise = async () => {
        // Save current exercise with its completed sets
        if (completedSets.length > 0 || sets || reps) {
            const exerciseData = {
                id: Date.now(),
                name: currentExercise.name,
                sets: completedSets,
                totalSets: completedSets.length,
            };
            setCompletedExercises([...completedExercises, exerciseData]);
        }

        // Check if there are more exercises
        const nextIdx = (exerciseIndex || 0) + 1;
        if (nextIdx >= (exerciseCount || 0)) {
            // No more exercises — finish the workout and create new plan
            let allExercises = completedExercises;
            if (completedSets.length > 0 || sets || reps) {
                const exerciseData = {
                    id: Date.now(),
                    name: currentExercise.name,
                    sets: completedSets,
                    totalSets: completedSets.length,
                };
                allExercises = [...completedExercises, exerciseData];
            }

            try {
                const calories = estimateCaloriesFromExercises(allExercises);
                // Use the user's weight if available, otherwise null
                const weightKg = Number(userWeight) || null;

                const result = await fetchWithMiddleware(
                    '/api/workouts/complete',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            plan_id: planId,
                            completed_exercises: allExercises.map(ex => ({
                                name: ex.name,
                                sets_completed: ex.totalSets,
                            })),
                            completed_at: new Date().toISOString(),
                            weight_kg: weightKg,
                            calories_burned: calories,
                            mark_plan_complete: true,
                        }),
                    }
                );

                alert('Workout completed! 🎉 Progress recorded.' + (calories ? ` Estimated ${calories} kcal burned.` : ''));
                if (onWorkoutComplete) {
                    try { onWorkoutComplete(result && result.plan_closed); } catch (e) { onWorkoutComplete(); }
                }
            } catch (error) {
                console.error('Error completing workout:', error);
                alert('Error completing workout');
            }

            onClose && onClose();
            return;
        }

        // Tell parent to load next exercise
        if (onNextExercise) {
            onNextExercise();
        }

        // Reset form for next exercise
        setSets(3);
        setReps('');
        setWeightValue('');
        setWeightType('weight');
        setUseBodyweight(false);
        setCompletedSets([]);
    };

    const handleFinishWorkout = async () => {
        // Save current exercise if it has sets
        let allExercises = completedExercises;
        if (completedSets.length > 0 || sets || reps) {
            const exerciseData = {
                id: Date.now(),
                name: currentExercise.name,
                sets: completedSets,
                totalSets: completedSets.length,
            };
            allExercises = [...completedExercises, exerciseData];
        }

        if (allExercises.length === 0) {
            alert('Complete at least one exercise before finishing workout');
            return;
        }

        setIsSaving(true);
        try {
            // Estimate calories similarly to handleNextExercise
            const calories = estimateCaloriesFromExercises(allExercises);
            const weightKg = Number(userWeight) || null;

            const response = await fetchWithMiddleware(
                '/api/workouts/complete',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        plan_id: planId,
                        completed_exercises: allExercises.map(ex => ({
                            name: ex.name,
                            sets_completed: ex.totalSets,
                        })),
                        completed_at: new Date().toISOString(),
                        weight_kg: weightKg,
                        calories_burned: calories,
                        // Do NOT mark the plan complete when the user manually finishes
                        // mid-plan. This records progress without closing the plan.
                        mark_plan_complete: false,
                    }),
                }
            );

            if (response && response.success) {
                alert('Workout completed and saved! 🎉 Progress recorded.' + (calories ? ` Estimated ${calories} kcal burned.` : ''));
                if (onWorkoutComplete) {
                    try { onWorkoutComplete(response.plan_closed); } catch (e) { onWorkoutComplete(); }
                }
                onClose();
            } else {
                alert('Error saving workout. Please try again.');
            }
        } catch (error) {
            console.error('Error finishing workout:', error);
            alert('Error completing workout');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinishSet = () => {
        if (sets && reps) {
            const setData = {
                id: Date.now(),
                sets,
                reps,
                weightType,
                weightValue: useBodyweight ? 'Bodyweight' : weightValue,
                weightUnit: useBodyweight ? '' : weightUnit,
            };
            setCompletedSets([...completedSets, setData]);
            // Reset form
            setReps('');
            setWeightValue('');
        } else {
            alert('Please fill in Sets and Reps');
        }
    };

    const removeCompletedSet = (id) => {
        setCompletedSets(completedSets.filter(set => set.id !== id));
    };

    const handleRemoveControl = (field) => {
        if (field === 'sets') setSets('');
        if (field === 'reps') setReps('');
        if (field === 'weight') setWeightValue('');
    };

    // Compute combined completed exercises (includes currentExercise if it has completed sets)
    const getCompletedExerciseList = () => {
        let all = [...completedExercises];
        if (completedSets && completedSets.length > 0) {
            all = [...all, { id: currentExercise.id || Date.now(), name: currentExercise.name, sets: completedSets }];
        }
        return all;
    };

    const totalCompletedCount = getCompletedExerciseList().length;
    const estimatedCalories = estimateCaloriesFromExercises(getCompletedExerciseList());

    return (
        <div className="workout-card">
            {/* Completed Exercises */}
            {completedExercises.length > 0 && (
                <div className="completed-exercises-section">
                    <div className="completed-exercises-grid">
                        {completedExercises.map((ex) => {
                            const kcal = estimateCaloriesForExercise(ex);
                            return (
                                <div key={ex.id} className="completed-exercise-card">
                                    <div className="exercise-card-dot"></div>
                                    <h4 className="exercise-card-name">{ex.name}</h4>
                                    <p className="exercise-card-sets">{ex.totalSets} sets completed</p>
                                    <div className="exercise-calorie-badge" title={`Estimated ${kcal} kcal burned`}>
                                        {kcal} kcal
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Current Exercise Header */}
            <div className="workout-card-header"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyItems: 'center',
                            alignItems: 'center',
                            margin: 'auto',
                            gap: '30px'
                        }}>

               
                    
                        <button className="btn-close-workout" onClick={onClose} style={{ backgroundColor: 'red'}}> <span>✕</span>  Close This Workout</button>
                   
                
                    <div className="exercise-header-top"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyItems: 'center',
                            alignItems: 'center',
                            margin: 'auto',
                            gap: '30px'
                        }}>
                            
                        {currentExercise ? (
                            <ExerciseImage
                                gifUrl={currentExercise.gifUrl}
                                exerciseId={currentExercise.id}
                                alt={currentExercise.name}
                                className="exercise-img"
                                width={140}
                            />
                        ) : (
                            <div className="exercise-img exercise-img--placeholder" aria-hidden="true" />
                        )}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '100px'
                        }}>

                            <h3 className="exercise-title">{currentExercise && currentExercise.name}</h3>
                        </div>

                        {/* Calorie badge: show when multiple exercises completed */}
                        {totalCompletedCount > 1 && (
                            <div className="calorie-badge" title={`Estimated ${estimatedCalories} kcal burned`}>
                                {estimatedCalories} kcal
                            </div>
                        )}

                    </div>
               
            </div>

            <div className="set-container">
                {/* Reps, Sets, and Weight Controls */}
                <div className="controls-grid">
                    <div className="control-item">
                        <label>Sets</label>
                        <input
                            type="number"
                            name="sets"
                            value={sets}
                            onChange={(e) => setSets(e.target.value)}
                            min="1"
                        />
                        {/*<button className="btn-remove-control" onClick={() => handleRemoveControl('sets')}>✕</button>*/}
                    </div>

                    <div className="control-item">
                        <label>Reps</label>
                        <input
                            type="number"
                            name="reps"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            min="1"
                            required
                        />
                        {/*<button className="btn-remove-control" onClick={() => handleRemoveControl('reps')}>✕</button>*/}
                    </div>
                    <label>Weight</label>

                    <div className="control-item control-item-weight"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap : '10px',
                            marginBottom: '10px'
                        }}>
                        <select
                            value={weightType}
                            onChange={handleWeightTypeChange}
                            
                        >
                            <option value="weight">Weighted</option>
                            <option value="bodyweight">Bodyweight</option>
                        </select>

                        {/* When using weight, allow entering a numeric value */}
                        {!useBodyweight && (
                            <>
                                <div className="control-item">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="weight"
                                        value={weightValue}
                                        onChange={(e) => setWeightValue(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <select
                                    value={weightUnit}
                                    onChange={(e) => setWeightUnit(e.target.value)}
                                    
                                >
                                    <option>kg</option>
                                    <option>lb</option>
                                </select>
                            </>
                        )}

                        {/*<button className="btn-remove-control" onClick={() => handleRemoveControl('weight')}>✕</button>*/}
                    </div>
                </div>

                {/* Weight Display Row */}
                {useBodyweight && (
                    <div className="weight-input-row">
                        <div className="bodyweight-check">
                            <input type="checkbox" checked readOnly />
                            <span>Bodyweight</span>
                        </div>
                    </div>
                )}

                {/* Finish Set Button */}
                <button className="btn-finish-set" onClick={handleFinishSet}>Finish Set</button>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button className="btn-add-set" onClick={handleFinishSet}>+ Add set</button>
                    <button className="btn-next-exercise" onClick={handleNextExercise}>→ Next Exercise</button>

                    {completedExercises.length > 0 && (
                        <button className="btn-finish-workout" onClick={handleFinishWorkout} disabled={isSaving}>
                            {isSaving ? 'Saving...' : '✓ Finish Workout'}
                        </button>
                    )}
                </div>

                {/* Completed Sets List */}
                {completedSets.length > 0 && (
                    <div className="completed-sets"
                        style={{ marginTop : '20px', marginBottom : '20px' }}>
                    
                        <h4>Completed Sets</h4>
                        {completedSets.map((set, idx) => (
                            <div key={set.id} className="completed-set-item" style={{ marginTop : '20px', marginBottom : '20px' }}>
                                <div className="set-info" 
                                    style={{ display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%' }}
                                    >
                                    <span className="set-details">
                                        Set {idx + 1}: {set.reps} reps {set.weightValue ? `@ ${set.weightValue} ${set.weightUnit}` : ''}
                                    </span>
                                
                                <button
                                    className="btn-remove-set"
                                    onClick={() => removeCompletedSet(set.id)}
                                >
                                    ✕
                                </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutCard;
