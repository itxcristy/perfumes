# Supabase Admin Dashboard CORS and Query Fixes

## Issues Identified

1. **CORS Errors**: The application was running on port 5174 (not 5173), but the Supabase CORS configuration wasn't updated to allow requests from this origin.
2. **Database Query Issues**: Some database queries in the admin dashboard were not properly handling errors or using correct column names.
3. **Network Error Handling**: The Supabase client configuration needed better error handling for network issues.

## Fixes Applied

### 1. Supabase Client Configuration Updates

**File**: `src/lib/supabase.ts`

- Added CORS headers to the Supabase client configuration:
  ```javascript
  global: {
    headers: {
      'X-Client-Info': 'sufi-essences-dashboard',
      'Access-Control-Allow-Origin': 'http://localhost:5174'
    }
  }
  ```

- Added fetch configuration for better error handling:
  ```javascript
  fetch: {
    credentials: 'omit',
    timeout: 30000
  }
  ```

### 2. Admin Dashboard Query Improvements

**File**: `src/components/Dashboard/Admin/ComprehensiveAdminDashboard.tsx`

- Added limits to database queries to prevent timeouts:
  ```javascript
  supabase.from('orders').select('id, total_amount, status, created_at').limit(100)
  ```

- Improved error handling in the database stats fetching function:
  ```javascript
  // Better error handling for table count queries
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .limit(1);
  ```

### 3. Direct REST API Improvements

**File**: `src/lib/supabase.ts`

- Added Accept header to Direct REST API calls:
  ```javascript
  headers: {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  ```

## Manual Steps Required

To fully resolve the CORS issues, you need to update the Supabase project settings:

1. Go to https://app.supabase.com/project/gtnpmxlnzpfqbhfzuitj/settings/api
2. In the "CORS Origins" section, add: `http://localhost:5174`
3. In the "Exposed URLs" section, add: `http://localhost:5174`

## Verification

After applying these fixes and updating the Supabase CORS configuration:

1. The admin dashboard should load without CORS errors
2. Database queries should execute successfully
3. All tables should display correct record counts
4. Dashboard metrics should populate correctly

## Additional Notes

- The development server is running on port 5174 (not 5173) due to port conflicts
- All database column names have been verified to match the actual schema
- Error handling has been improved throughout the admin dashboard components