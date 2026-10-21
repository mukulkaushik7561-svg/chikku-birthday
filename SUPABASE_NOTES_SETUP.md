# Private birthday notes: Supabase setup

This site is static GitHub Pages. The Supabase Project URL and **publishable** key are intentionally browser-visible; they are not secrets. The database permissions below make that public client insert-only.

Never put an `sb_secret_...` key, legacy `service_role` key, database password, or private admin token in this project.

## 1. Create a project

1. Create a project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the project and wait until it is ready.
3. Open **SQL Editor** and create a new query.

## 2. Create the insert-only table and policy

Run this SQL exactly once in the SQL Editor:

```sql
begin;

create table if not exists public.birthday_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  message text not null check (char_length(btrim(message)) > 0)
);

alter table public.birthday_notes enable row level security;

-- Start with no public database permissions.
revoke all on table public.birthday_notes from anon, authenticated;

-- The public birthday page is unsigned-in, so only anon may insert.
grant insert on table public.birthday_notes to anon;

-- Re-running this guide will safely replace only this INSERT policy.
drop policy if exists "Public birthday site can insert notes" on public.birthday_notes;

create policy "Public birthday site can insert notes"
on public.birthday_notes
for insert
to anon
with check (char_length(btrim(message)) > 0);

commit;
```

This deliberately creates **no** public `SELECT`, `UPDATE`, or `DELETE` policy and grants no such table permissions to `anon` or `authenticated`.

## 3. Confirm the policy is private

In **Authentication > Policies** or the Table Editor, verify that `birthday_notes` has only the `INSERT` policy above for the `anon` role. Do not add a public read policy just to test the site.

The table is readable privately through your Supabase Dashboard as the project owner. The public website has no code path for reading notes.

## 4. Add browser-safe configuration

1. Open **Connect** in the Supabase Dashboard, or go to **Settings > API Keys**.
2. Copy the **Project URL**.
3. Copy a current **publishable** key (it starts with `sb_publishable_`). Do **not** copy a secret key.
4. Edit `supabase-notes-config.js` in this project:

```js
window.BIRTHDAY_NOTES_CONFIG = Object.freeze({
  supabaseUrl: "https://your-project-ref.supabase.co",
  publishableKey: "sb_publishable_your_browser_safe_key"
});
```

This file is intentionally served to the browser on GitHub Pages. A frontend `.env` file would not hide a browser key, so this project does not pretend that it does. The RLS policy and grants are the security boundary.

If your project only offers the legacy `anon` key, it is browser-safe but older Supabase terminology. Prefer the current publishable key when available; never use the legacy `service_role` key.

## 5. Test a submission

1. Serve the project locally with `python -m http.server 8000`.
2. Open `http://localhost:8000` and complete the existing birthday journey.
3. Open the last “Leave something for me ♡” page.
4. Submit a non-empty test message.
5. Confirm the site shows `Your note has been tucked away safely ♡`.
6. Open **Table Editor > birthday_notes** in your private Supabase Dashboard to read the inserted row.

The client sends one `POST` insert request using `Prefer: return=minimal`; it does not request the row back and contains no `SELECT` call.

## Security and spam note

The browser disables the button during a request and after a confirmed success, preventing normal double-click submissions. This is usability protection, not real rate limiting: a public static site can still be targeted outside the UI. Keep RLS enabled, retain the least-privilege grant above, and do not add public read/update/delete access for convenience.

Useful official references:

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase JavaScript insert reference](https://supabase.com/docs/reference/javascript/insert)
