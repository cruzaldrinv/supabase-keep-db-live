# Supabase Keep-Alive

GitHub Actions workflow to prevent Supabase databases from pausing due to inactivity.

## Why

Supabase pauses free-tier databases after periods of inactivity. This workflow periodically pings your databases to keep them active.

## Features

- Schedule automated pings via cron
- Support for multiple databases in one workflow
- No table configuration needed - uses REST API health check
- Manual trigger support
- Detailed per-database logging

## Setup

### 1. Add GitHub Secret

Go to your repository **Settings** → **Secrets and variables** → **Actions** → **Secrets** tab and create a new secret:

**Name:** `SUPABASE_CONFIGS`

**Value:** JSON array of your database configs

**Single database:**
```json
[{"name":"Production","url":"https://xxx.supabase.co","key":"your_anon_key"}]
```

**Multiple databases:**
```json
[
  {"name":"Production","url":"https://xxx.supabase.co","key":"anon_key_1"},
  {"name":"Staging","url":"https://yyy.supabase.co","key":"anon_key_2"}
]
```

Get your credentials from Supabase Dashboard → Settings → API:
- `url` = Project URL
- `key` = anon/public key (recommended) or service_role key

**Note:** The config is stored as a Secret (not visible after creation). To see which databases you're pinging, check the Action logs after running the workflow - it prints the database names and URLs.

### 2. Adjust Schedule (Optional)

Default: Runs Monday and Thursday at 9:00 AM UTC

Edit `.github/workflows/ping-supabase.yml`:
```yaml
schedule:
  - cron: '0 9 * * 1,4'
```

Common schedules:
- Daily: `0 9 * * *`
- Every 12 hours: `0 */12 * * *`
- Twice weekly: `0 9 * * 1,4`

### 3. Test

Go to **Actions** tab → Select workflow → **Run workflow**

## Local Testing

```bash
npm install
cp env.example .env
# Edit .env with your configs
npm run ping
```

Example output:
```
Pinging 2 database(s)...
Timestamp: 2025-10-12T16:00:00.000Z
------------------------------------------------------------

[1/2] Production
URL: https://xxx.supabase.co
Success! Response time: 245ms

[2/2] Staging
URL: https://yyy.supabase.co
Success! Response time: 198ms

------------------------------------------------------------
Summary:
  Successful: 2
  Failed: 0
  Total: 2

All databases pinged successfully!
```

## How It Works

The workflow makes an HTTP request to `{url}/rest/v1/` to verify the database is reachable. It doesn't require any specific tables or data - just a successful connection to the Supabase REST API.

## FAQ

**Do I need to specify table names?**  
No. The workflow pings the REST API endpoint directly.

**Can I use multiple databases?**  
Yes. Add multiple objects to the `SUPABASE_CONFIGS` array.

**Which API key should I use?**  
The anon/public key is recommended. Service role key works too but isn't necessary.

**How often should I run this?**  
Twice a week is sufficient. Adjust based on your Supabase tier's inactivity timeout.

**Will this consume my API quota?**  
Minimal impact - just a few requests per week.