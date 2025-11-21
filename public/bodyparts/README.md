Add curated body-part demo images here to improve UX when `gifUrl` is not available.

- Filenames should match the keys used in the app mapping.
  - Examples:
    - `chest.jpg`
    - `back.jpg`
    - `legs.jpg`
    - `shoulders.jpg`
    - `upper_arms.jpg`
    - `lower_arms.jpg`
    - `upper_legs.jpg`
    - `lower_legs.jpg`
    - `core.jpg`
    - `waist.jpg`
    - `neck.jpg`
    - `cardio.jpg`

- Recommended image specs:
  - Format: JPEG or PNG
  - Size: ~360px wide for thumbnails; provide larger variants for detail (480px+) if possible
  - Keep aspect ratio consistent (landscape 16:9 or 4:3 works well)

- Where to place files:
  - Drop images into `public/bodyparts/` — they will be served at `/bodyparts/<filename>` during development and in production.

- How the app uses them:
  - When `gifUrl` is missing, the frontend will set the `gifUrl` to `/bodyparts/<bodyPart>.jpg` and `ExerciseImage` will render that.

If you want, I can add a small sample set of images (you need to provide the image files or let me know if I should fetch permissively-licensed placeholders).