# Relay outreach workspace

A self-contained draft of Carson's personal CRM and daily outreach task app.

## Run locally

Run a local server:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Included in this draft

- Two-tab workflow: CRM and Tasks
- CSV-only lead import directly from the CRM
- Pre-import review showing every proposed record
- Duplicate warnings based on normalized website domains; duplicate rows start unchecked but can be included manually
- Manual company entry from the CRM
- Company-first records with contact forms, emails, and phone numbers
- Ranked contact methods with move-up and move-down controls
- Editable company, contact, stage, and fit-note fields inside the CRM
- Confirmed company deletion, including its contact methods, history, and saved task drafts
- Editable CRM history entries, including activity type, date, and notes
- Chronological outreach numbering displayed directly on the history timeline
- Retroactive date edits automatically resort and renumber the entire history
- CRM history is the single source of truth; tasks are never stored separately
- History-date changes immediately change the live stale/overdue task query
- Company-level Mark Responded action that adds an inbound CRM event and excludes the company from the task query
- Unlimited additional contact forms, emails, phone numbers, LinkedIn profiles, and other methods
- Camera and house icons distinguishing the two company segments
- Task messages that can be edited and copied
- Open-contact and Mark as Sent actions
- Configurable quiet-period filtering for companies that have gone stale
- Configurable outreach limits calculated independently for every contact method
- Current contact methods repeat until their individual limit; once exhausted, Relay advances to the highest-ranked eligible method
- Visible outreach settings panel for changing the follow-up delay and per-method attempt limit
- Supabase email/password authentication
- Normalized Supabase persistence for companies, contact methods, history, drafts, and settings
- Automatic one-time migration prompt when Supabase is empty and browser CRM data exists
- LocalStorage fallback only while Supabase remains unconfigured
- Browser-local calendar dates, avoiding UTC date shifts

No messages are sent automatically. Lead collection is CSV-based in this draft.

## Supabase setup

Follow `SUPABASE_SETUP.md`. Run `supabase-schema.sql`, create your app user, then place the project URL and publishable key in `supabase-config.js`. Never place a secret or service-role key in browser code.

## CSV upload template

Use `relay-crm-upload-template.xlsx` to prepare imports. Complete the `Upload` sheet, export that sheet as a UTF-8 CSV, then choose **Import CSV** in the CRM. `Company Name` is required. A website is strongly recommended because duplicate matching uses its normalized domain (for example, `www.example.com/contact` and `example.com` are treated as the same company domain).
