import React, { useState } from 'react';
import '../style/WorkoutCard.css';

import fetchWithMiddleware from '../utils/fetchMiddleware';

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
                // Call the same completion endpoint to create new plan
                await fetchWithMiddleware(
                    'http://localhost:5000/api/workouts/complete',
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
                        }),
                    }
                );
                alert('Workout completed! 🎉 New workout plan created.');
                if (onWorkoutComplete) {
                    onWorkoutComplete();
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
            // Save workout completion to database
            const response = await fetchWithMiddleware(
                'http://localhost:5000/api/workouts/complete',
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
                    }),
                }
            );

            if (response && response.success) {
                alert('Workout completed and saved! 🎉');
                if (onWorkoutComplete) {
                    onWorkoutComplete();
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

    return (
        <div className="workout-card">
            {/* Completed Exercises */}
            {completedExercises.length > 0 && (
                <div className="completed-exercises-section">
                    <div className="completed-exercises-grid">
                        {completedExercises.map((ex) => (
                            <div key={ex.id} className="completed-exercise-card">
                                <div className="exercise-card-dot"></div>
                                <h4 className="exercise-card-name">{ex.name}</h4>
                                <p className="exercise-card-sets">{ex.totalSets} sets completed</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Exercise Header */}
            <div className="workout-card-header">
                <div className="exercise-header-top">
                    <div className="exercise-dot"></div>
                    <h3 className="exercise-title">{currentExercise.name}</h3>
                                <button className="btn-close-workout" onClick={onClose}>✕</button>
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
                        <button className="btn-remove-control" onClick={() => handleRemoveControl('sets')}>✕</button>
                    </div>

                    <div className="control-item">
                        <label>Reps</label>
                        <input 
                            type="number" 
                            name="reps" 
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            min="1"
                        />
                        <button className="btn-remove-control" onClick={() => handleRemoveControl('reps')}>✕</button>
                    </div>

                    <div className="control-item control-item-weight">
                        <label>Weight</label>
                        <select
                            value={weightType}
                            onChange={handleWeightTypeChange}
                            className="weight-select"
                        >
                            <option value="weight">Weight</option>
                            <option value="bodyweight">Bodyweight</option>
                            <option value="2.2">2.2</option>
                            <option value="2.5">2.5</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        
                        {!useBodyweight && (
                            <>
                                <select 
                                    value={weightUnit}
                                    onChange={(e) => setWeightUnit(e.target.value)}
                                    className="weight-unit-select"
                                >
                                    <option>kg</option>
                                    <option>lb</option>
                                </select>
                                
                                <input 
                                    type="number" 
                                    value={weightValue}
                                    onChange={(e) => setWeightValue(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                />
                            </>
                        )}
                        
                        <button className="btn-remove-control" onClick={() => handleRemoveControl('weight')}>✕</button>
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
                    <div className="completed-sets">
                        <h4>Completed Sets</h4>
                        {completedSets.map((set, idx) => (
                            <div key={set.id} className="completed-set-item">
                                <div className="set-info">
                                    <input type="checkbox" defaultChecked />
                                    <span className="set-details">
                                        Set {idx + 1}: {set.reps} reps {set.weightValue ? `@ ${set.weightValue} ${set.weightUnit}` : ''}
                                    </span>
                                </div>
                                <button 
                                    className="btn-remove-set" 
                                    onClick={() => removeCompletedSet(set.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutCard;
