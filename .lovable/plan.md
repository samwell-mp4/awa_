# Plan - Fix Numbers Update Persistence

The user reports that changes made to the "Aprender Números" (Learn Numbers) section in the admin panel are not persisting after a page refresh.

## Proposed Changes

### 1. Fix Persistence in Admin Panel
- Modify `src/components/admin/numbers-admin.tsx` to ensure the `save` function correctly updates the remote configuration.
- Improve state management during saving to prevent UI flicker or race conditions.
- Add more robust error handling and feedback.

### 2. Improve Data Fetching and Cache Management
- Ensure `src/routes/aprender-numeros.tsx` and the admin component consistently use the same query keys.
- Force immediate cache invalidation and re-fetching after successful updates.
- Verify that `staleTime: 0` is correctly applied to prevent serving outdated cached data.

### 3. Verification
- Use Playwright to simulate an admin session (if possible) or verify the SQL schema and RPC function behavior.
- Confirm that `updateSiteConfig` correctly targets the `aprender_numeros` key in the `site_config` table.

## Technical Details
- The current admin uses `useServerFn` for `updateNumbersConfig` which calls `updateSiteConfig`.
- The `site_config` table uses an `upsert` strategy. I will verify if RLS or unique constraints are interfering.
- I will also check if the `aprender_numeros_content` query key in the user-facing route matches what the admin invalidates.
