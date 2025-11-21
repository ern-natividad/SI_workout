import React, { useMemo, useEffect } from 'react';
import placeholder from '../assets/background.jpg';

// Secure ExerciseImage component
// Usage:
//  - <ExerciseImage exerciseId="0123" />           // will call server proxy /api/exercises/image/:id
//  - <ExerciseImage gifUrl="https://.../some.gif" /> // will proxy exercisedb host through /api/exercises/image?url=...
// NOTE: Do NOT put RapidAPI keys in client code. This component routes requests to your server proxy.

const EXERCISE_DB_HOST = 'exercisedb.p.rapidapi.com';

const ExerciseImage = ({ exerciseId, gifUrl, className, alt, width = '360', resolution = '360' }) => {
  // Prefer explicit gifUrl if provided, otherwise fall back to exerciseId route
  const src = useMemo(() => {
    if (gifUrl) {
      try {
        const u = new URL(gifUrl);
        // If the gifUrl points to exercisedb host, use server proxy that adds RapidAPI headers
        if (u.hostname === EXERCISE_DB_HOST) {
          return `/api/exercises/image?url=${encodeURIComponent(gifUrl)}`;
        }
        // Otherwise return the gifUrl directly (public URL)
        return gifUrl;
      } catch (e) {
        // If gifUrl is a relative path (server-proxy path like '/api/...') or a data URL,
        // new URL() will throw without a base. Treat common relative/data forms as valid src.
        if (typeof gifUrl === 'string' && (
          gifUrl.startsWith('/') ||
          gifUrl.startsWith('./') ||
          gifUrl.startsWith('../') ||
          gifUrl.startsWith('data:')
        )) {
          return gifUrl;
        }
        return null;
      }
    }
    if (exerciseId) return `/api/exercises/imageById?exerciseId=${encodeURIComponent(exerciseId)}&resolution=${encodeURIComponent(resolution)}`;
    return null;
  }, [exerciseId, gifUrl, resolution]);

  // Debug logging to help trace mismatched images during development.
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug('[ExerciseImage] props:', { exerciseId, gifUrl, resolution, width, className });
      // eslint-disable-next-line no-console
      console.debug('[ExerciseImage] resolved src:', src);
    } catch (e) {
      // ignore
    }
  }, [src, exerciseId, gifUrl, resolution, width, className]);

  const handleError = (e) => {
    try {
      if (e && e.currentTarget) e.currentTarget.src = placeholder;
    } catch (err) {
      // ignore
    }
  };

  return (
    <img
      src={src || placeholder}
      alt={alt || 'Exercise demonstration'}
      width={width}
      height="auto"
      onError={handleError}
      className={className || ''}
      style={{ borderRadius: 8 }}
    />
  );
};

export default ExerciseImage;
