# Menu Planner

A personal weekly meal planner: keep a recipe box, assign recipes to days/meals, and get an
auto-generated grocery list for the week. Built with React + Vite, backed by Supabase
(Postgres + Auth) so your data syncs across devices.

## One-time setup

1. **Create a Supabase project** at https://supabase.com (free tier is fine).
2. **Run the schema**: open the project's SQL Editor and run the contents of
   [`supabase/schema.sql`](supabase/schema.sql). This creates the `recipes` and `week_plans`
   tables with row-level security so only you can read/write your own rows.
3. **Create your user account**: in the Supabase dashboard, go to Authentication → Users →
   "Add user" and create yourself an email/password (or use the SQL editor /
   `supabase.auth.signUp` once from a scratch script). There's no public sign-up screen in
   the app — it's a single-user tool.
4. **Get your API keys**: Project Settings → API → copy the "Project URL" and the "anon public"
   key.
5. **Configure the app**: copy `.env.example` to `.env` and fill in those two values:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

## Running it

```sh
npm install
npm run dev
```

Open the printed local URL and sign in with the account you created in step 3.

## Notes

- No pricing/cost tracking anywhere by design — ingredients are free-text (e.g. "2 cups
  flour"), and the grocery list groups them by a normalized ingredient name rather than doing
  unit math.
- Data lives in Supabase (Postgres), not in the browser, so it's the same across any device
  you sign into.
