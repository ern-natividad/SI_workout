# Debugging Guide: Workout Plan Save Issue

## Summary of Changes Made

1. **Frontend Auth Flow Fixed**
   - `AuthContext` now uses `sessionStorage` for login state
   - `fetchMiddleware` injects `Authorization: Bearer <token>` header
   - App wrapped with `AuthProvider` in `main.jsx`
   - Login page now calls `AuthContext.login()` instead of using only `localStorage`

2. **Backend Compatibility Fixed**
   - `saveWorkoutPlan.php` now handles missing `target` column in `workouts` table
   - Added better error logging and response messages

3. **Error Logging Added**
   - Frontend logs `planData`, `saveWorkoutPlan result`, and errors to console
   - Backend logs incoming requests and errors to server error log

## Step-by-Step Testing

### Step 1: Verify Setup
1. Ensure MySQL/MariaDB is running with `workout_app` database
2. Ensure Apache/PHP is running on `http://localhost/react-api/`
3. Ensure Vite dev server is running on `http://localhost:5174`

### Step 2: Open Browser DevTools
- Press **F12** to open DevTools
- Go to **Console** tab (you'll see debug logs here)
- Go to **Network** tab (you'll see API requests here)
- Go to **Application → Session Storage** (to verify login tokens)

### Step 3: Log In
1. Navigate to http://localhost:5174
2. Go to Login page (should redirect automatically)
3. Enter credentials:
   - Email: `ernnatividad10@gmail.com`
   - Password: (whatever was set when the account was created)

4. **Watch the Console for:**
   ```
   AuthContext: login() { id: 3, token: "..." }
   ```
   This confirms the context received the login.

5. **Check Session Storage:**
   - Should have `authToken` (the token from the login response)
   - Should have `userId` (should be `3` for the demo account)

### Step 4: Go to Information Setup
1. After successful login, navigate to `/information_setup`
2. Select equipment, muscles, and exercises
3. When ready, click "Finish Setup" button

### Step 5: Monitor the Save Request
**In the Console, watch for:**
```
Sending planData: {
  user_id: 3,
  title: "My Workout Plan",
  goal: "Custom workout plan",
  exercises: [ { name: "...", equipment: "...", bodyPart: "...", target: "..." }, ... ]
}
```

**In the Network tab:**
- Find the request to `saveWorkoutPlan.php`
- Check **Request Headers:**
  - Should include `Authorization: Bearer <token>`
  - Should include `Content-Type: application/json`
- Check **Request Body:**
  - Should match the `planData` from the console
- Check **Response:**
  - Status should be `200` (success) or `400` (bad request)
  - Body should show `{"success": true/false, "message": "...", "plan_id": ...}`

**If the request fails:**
```
saveWorkoutPlan failed: <error message>
```
This error message comes from the backend response.

### Step 6: Common Failure Scenarios

#### Scenario A: "User ID and exercises are required"
- **Check:** Did you select any exercises before clicking "Finish Setup"?
- **Solution:** Select at least one exercise before saving

#### Scenario B: "Failed to create workout plan"
- **Check:** Is the `user_id` valid? (should be `3` for demo account)
- **Check:** Does a user with id `3` exist in the `users` table?
- **Solution:** Verify the account exists in MySQL

#### Scenario C: "Failed to add exercise"
- **Check:** Are the `workouts` table columns correct?
- **Run in MySQL:**
  ```sql
  DESC workouts;
  ```
- **Expected columns:** `id`, `category_id`, `name`, `description`, `equipment`, `muscle_group`, `difficulty`

#### Scenario D: Authorization Header Missing
- **Check:** Open DevTools → Network → saveWorkoutPlan.php request
- **Check Request Headers for:** `Authorization: Bearer ...`
- **If missing:** 
  - Check Session Storage for `authToken`
  - Verify `AuthContext.login()` was called (check console log)
  - Restart the browser (clear session)

#### Scenario E: CORS Error
- **Check:** Browser console for CORS error
- **Solution:** Verify the PHP files have these headers:
  ```php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  ```

### Step 7: Check Backend Logs
If the issue persists, check the PHP error log:
- On Windows with Apache: Check `C:\xampp\apache\logs\error.log` (or equivalent)
- Or check `php://stderr` output

The `saveWorkoutPlan.php` now logs:
- Incoming request data: `error_log('saveWorkoutPlan received: ' . json_encode($data));`
- Any errors: `error_log('saveWorkoutPlan error: ' . $e->getMessage());`

## Quick Checklist

- [ ] MySQL/Apache/Vite all running
- [ ] Can log in successfully (see `AuthContext: login()` in console)
- [ ] Session Storage has `authToken` and `userId` after login
- [ ] Select exercises and click "Finish Setup"
- [ ] Check Network tab for `saveWorkoutPlan.php` request
- [ ] Request has `Authorization: Bearer` header
- [ ] Response shows `{"success": true}` or specific error message

## If Still Stuck

Provide the following information:
1. **Console output** when you click "Finish Setup" (paste screenshot or text)
2. **Network tab** for the `saveWorkoutPlan.php` request:
   - Request Headers (especially `Authorization`)
   - Request Body
   - Response (full JSON)
3. **Session Storage** contents after login (keys and values)
4. **PHP error log** contents (from your server's error log file)
