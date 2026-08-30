# Relay Supabase setup

## 1. Create the database

Open your Supabase project, go to **SQL Editor**, paste the entire contents of `supabase-schema.sql`, and run it once. The script creates all tables, indexes, relationships, cascade deletion, grants, and Row Level Security policies.

Do not disable Row Level Security. The browser must contain your Supabase project URL and publishable key; RLS is what makes those public browser credentials safe to use. Never place the secret or service-role key in `supabase-config.js`.

## 2. Create your app login

Your Supabase dashboard login is not an application user. Go to **Authentication → Users**, choose **Add user**, and create the email/password you will use to sign into Relay. If this remains a one-user app, disable public user registration in the Supabase Authentication settings and create users only from the dashboard.

## 3. Configure Relay

Open `supabase-config.js` and replace both placeholders:

```js
window.RELAY_SUPABASE = {
  projectUrl: "https://YOUR_PROJECT.supabase.co",
  publishableKey: "YOUR_PUBLISHABLE_KEY"
};
```

Find these under **Project Settings → API**. Use the publishable key (or legacy anon key if that is what your project displays), never the service-role key.

## 4. Deploy and sign in

Deploy all included files together on a stable HTTPS domain. On first sign-in, if the Supabase database is empty but this browser already contains Relay companies, the app asks whether to copy those records into Supabase. After migration, Supabase becomes the system of record and the old localStorage record is removed.

## Exact database structure

### `companies`

| Field | Type | Purpose |
|---|---|---|
| `owner_id` | `uuid` | Authenticated owner; references `auth.users` |
| `id` | `text` | Relay company ID |
| `company_name` | `text` | Company name |
| `company_type` | `text` | `Photography` or `Airbnb Management` |
| `location` | `text` | Market/location |
| `website` | `text` | Company website |
| `website_domain` | `text` | Normalized domain used for duplicate review |
| `contact_form` | `text` | Primary contact-form URL |
| `primary_email` | `text` | Primary email |
| `primary_phone` | `text` | Primary phone |
| `contact_name` | `text` | Optional contact name |
| `contact_title` | `text` | Optional contact title |
| `stage` | `text` | CRM stage |
| `fit_notes` | `text` | Company notes |
| `source_url` | `text` | Research/import source |
| `snoozed_until` | `date` | Optional task postponement date |
| `contact_method_order` | `text[]` | Ranked order of every method ID |
| `created_at` | `timestamptz` | Creation time |
| `updated_at` | `timestamptz` | Last database update |

Primary key: `(owner_id, id)`.

### `contact_methods`

| Field | Type | Purpose |
|---|---|---|
| `owner_id` | `uuid` | Authenticated owner |
| `id` | `text` | Contact-method ID |
| `company_id` | `text` | Parent company |
| `method_type` | `text` | `form`, `email`, `phone`, `linkedin`, or `other` |
| `label` | `text` | Display/contact label |
| `value` | `text` | URL, email, or phone number |
| `rank` | `integer` | Stored ordering for additional methods |
| `created_at` | `timestamptz` | Creation time |

Primary key: `(owner_id, id)`. Company deletion cascades to these rows.

### `activities`

| Field | Type | Purpose |
|---|---|---|
| `owner_id` | `uuid` | Authenticated owner |
| `id` | `text` | History-entry ID |
| `company_id` | `text` | Parent company |
| `direction` | `text` | `outbound`, `inbound`, or `note` |
| `method_id` | `text` | Contact method used, when known |
| `method_value` | `text` | Historical contact value |
| `method_label` | `text` | Historical contact label |
| `channel` | `text` | Form, email, phone, LinkedIn, or other |
| `kind` | `text` | Activity title |
| `activity_date` | `date` | User-controlled CRM date |
| `subject` | `text` | Email subject, if applicable |
| `message` | `text` | Exact outreach message |
| `detail` | `text` | Notes/details |
| `created_at` | `timestamptz` | Stable tie-break and creation time |

Primary key: `(owner_id, id)`. Company deletion cascades to these rows.

### `message_drafts`

| Field | Type | Purpose |
|---|---|---|
| `owner_id` | `uuid` | Authenticated owner |
| `draft_key` | `text` | Company/method/attempt identifier |
| `body` | `text` | Edited task message |
| `updated_at` | `timestamptz` | Last edit time |

Primary key: `(owner_id, draft_key)`.

### `user_settings`

| Field | Type | Purpose |
|---|---|---|
| `user_id` | `uuid` | Authenticated user and primary key |
| `attempt_threshold` | `integer` | Maximum attempts per contact method |
| `stale_days` | `integer` | Days until follow-up eligibility |
| `updated_at` | `timestamptz` | Last settings update |
