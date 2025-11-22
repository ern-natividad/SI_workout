// This helper now uses the server proxy to fetch exercise data so the RapidAPI key
// remains on the server. The server exposes `/api/exercises/name/:name` which
// forwards the request to the upstream exercisedb API with the proper headers.
export const getExerciseImageUrl = async (exerciseName) => {
  if (!exerciseName) return null;
  const encodedExerciseName = encodeURIComponent(exerciseName.toLowerCase());
  const API_BASE = import.meta.env.VITE_API_BASE || '';
  const url = API_BASE + `/api/exercises/name/${encodedExerciseName}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) return null;
    const data = await response.json();
    return data && data.length > 0 ? data[0].gifUrl : null;
  } catch (err) {
    console.error('Error fetching exercise via server proxy:', err);
    return null;
  }
};