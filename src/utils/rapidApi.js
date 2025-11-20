// IMPORTANT: Replace 'YOUR_RAPIDAPI_KEY_HERE' with your actual RapidAPI Key.
// For production, strongly consider using environment variables (e.g., process.env.REACT_APP_RAPIDAPI_KEY)
// and proxying these requests through your backend to keep your API key secure.
const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY_HERE';
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';

export const getExerciseImageUrl = async (exerciseName) => {
  if (!exerciseName) {
    console.warn("Exercise name is required to fetch image.");
    return null;
  }

  // ExerciseDB often uses lowercase and URL-encoded names for image lookups.
  // NOTE: The correct endpoint for getting an exercise by name which includes the gifUrl is not /image.
  // We will use the /name/{exerciseName} endpoint which returns the full exercise object including 'gifUrl'.
  const encodedExerciseName = encodeURIComponent(exerciseName.toLowerCase());
  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodedExerciseName}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) return null; // Fail silently if image not found

    const data = await response.json();
    // The API returns an array, we'll take the first result's gifUrl.
    return data && data.length > 0 ? data[0].gifUrl : null;
  } catch (error) {
    console.error(`Network error fetching image for ${exerciseName}:`, error);
    return null;
  }
};