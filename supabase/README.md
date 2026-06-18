# Hollywood School — Supabase + Deno backend

All data access goes through **Deno Edge Functions**. The browser only ever
holds the public **anon key** and calls functions; functions use the
**service_role** key (server-side) to reach the database, so tables stay
locked down by RLS.

## One-time setup

1. **Create the project** at https://supabase.com (you're doing this now).
2. Install the CLI: `npm i -g supabase` (or `scoop install supabase`).
3. Link the repo to your project:
   ```bash
   supabase login
   supabase link --project-ref YOUR-PROJECT-REF
   ```

## Database (schema + data migration)

```bash
# create the tables
supabase db push                       # applies migrations/0001_init.sql
# load the data migrated from the mock content
supabase db execute --file supabase/seed.sql
```
(or paste both files into the Supabase Studio → SQL editor and run them.)

## Edge Functions

```bash
supabase functions deploy catalog
supabase functions deploy registrations
supabase functions deploy courses
```
The runtime injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` automatically —
no secrets to set for these.

## Frontend

Copy `.env.example` → `.env` and fill in (Settings → API):
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```
Restart `npm run dev`. The app auto-switches from mock data to the live
backend once these are set (see `src/lib/supabase.ts`).

## Endpoints

| Function        | Method | Purpose                                  |
|-----------------|--------|------------------------------------------|
| `catalog`       | GET    | All public data (categories, courses, summer, testimonials, media) |
| `registrations` | POST   | Create a registration (enroll wizard)    |
| `registrations` | GET    | List registrations (admin)               |
| `registrations` | PATCH  | Update status `{ id, status }` (admin)   |
| `courses`       | POST/PATCH/DELETE | Course CRUD (admin)           |

## TODO before go-live
- Add Supabase Auth and protect the admin functions (`courses`, registrations
  GET/PATCH). They are currently open.
- Move images to Supabase Storage (tables store an asset-key string for now).
