# Plan: Fix Intermittent Errors and Admin Stability

Investigate and resolve reported intermittent application errors and improve administrative panel stability, specifically focusing on hydration mismatches and missing backend resources.

## User Review Required

> [!NOTE]
> The "permission denied" error for the leaderboard was fixed by creating and granting permissions for the `weekly_top_learners` database function. The "Supabase client not found" error was handled by improving the robustness of server functions.

- Are there any specific pages where the "app encountered an error" message is more frequent?
- Should the emergency login credentials be made even more visible in the admin panel for your team?

## Proposed Changes

### Database & Backend
- **Leaderboard Fix**: Re-create `weekly_top_learners` function with correct return types and explicit `GRANT EXECUTE` to all roles.
- **Auth Middleware**: Make `requireSupabaseAuth` more resilient to missing tokens during server-side pre-rendering, preventing hard failures.
- **AI Integration**: Update `askAkua` to check for both `LOVABLE_API_KEY` and `AI_GATEWAY_TOKEN` to ensure service continuity.

### Administrative Panel
- **Tab Consolidation**: Reorganize the admin dashboard into a simpler, 5-tab structure (Appearance, Adult Area, Kids Area, Content, Security).
- **Branding Management**: Centralize all logo and video URL settings in the "Appearance" tab.
- **Site Management**: Add explicit controls for AI behavior (Professor Akuã and Translator) and emergency access settings.
- **Music Review Mode**: Ensure the new quality checklist and sync suggestions are fully integrated.

### Frontend & UX
- **Hydration Fix**: Resolve hydration mismatches in the `Logo` component by ensuring server/client text consistency.
- **Code-Splitting**: Move the large `MusicasInfantilPage` component to a separate file to optimize bundle size and resolve build warnings.
- **Audio Feedback**: Verify that all interactive elements in the Kids area provide immediate audio feedback as requested.

## Technical Details

- **Database**: SQL migration to drop and re-create `public.weekly_top_learners`.
- **Server Functions**: Update `src/lib/admin-layout.functions.ts` to remove redundant client checks that were throwing errors.
- **Auth**: Modify `src/integrations/supabase/auth-middleware.ts` to handle optional tokens gracefully.
- **Admin Components**: Refactor `src/components/admin/layout-admin.tsx` for the new tab structure.
