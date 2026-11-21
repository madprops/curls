# Curls

![](https://i.imgur.com/VjrgPIL.gif)

*(In the demo above, each color profile has its own set of curls, and the picker switches between curls you own.)*

---

## What is this?

Curls is a minimalist text status host.

Users claim a `curl` (an ASCII lowercase alphanumeric identifier, up to 20 characters) and receive a one-time secret key to update its text status (up to 2,000 characters).

For example, `https://curls.merkoba.com/funone` returns the current plain-text status of `funone`.

There is no history, feed algorithm, comments, or tracking — only the current status text. HTML pages are provided for claiming, updating, and monitoring curls, and the API is designed to be called directly from your own scripts or apps.

---

## Intended Use

Share your curl name with others so they can add it to a dashboard or polling script (e.g., checking for changes every 5 minutes) to see live statuses from many people at a glance.

It also works well for lightweight scripts or software that need a pointer to a small piece of dynamic plain text.

---

## Accounts & Keys

There are no user accounts. You claim a curl once and receive its secret key once.

- Keys are stored **hashed** on the server (never in plaintext).
- There is **no way to recover a lost key** — save it somewhere secure.

---

## API

Public API endpoints (`GET /<curl>`, `POST /curls`, and `POST /change`) allow cross-origin (`Access-Control-Allow-Origin: *`) requests so external apps can read and update statuses directly.

### Get a curl's current status (plain text)

```bash
curl https://curls.merkoba.com/<curl>
```

- `200 OK` — returns the status text (or `Not updated yet` if never set).
- `404 Not Found` — returns `Not claimed yet`.
- `400 Bad Request` — invalid or reserved curl name.

### Update a curl's status (plain text)

```bash
curl -X POST -d "curl=mycurl&key=mykey&status=mystatus" https://curls.merkoba.com/change
```

- `200 OK` — returns `ok`.
- `400 Bad Request` — missing fields, invalid curl, or status exceeds 2,000 characters.
- `401 Unauthorized` — `Error: Invalid key`.
- `413 Payload Too Large` — request body exceeds 16 KiB.
- `429 Too Many Requests` — per-IP or per-curl rate limit exceeded.

### Fetch multiple curls (JSON)

```bash
curl -X POST -d "curl=somecurl&curl=othercurl" https://curls.merkoba.com/curls
```

Returns a JSON array of objects (`created`, `curl`, `status`, `updated`, `changes`) for up to 100 curls per request.

### Claim a curl

Visit `/claim` in a browser, solve the CAPTCHA, and save the returned key.

---

## Dashboard

A built-in web dashboard is available at `/dashboard` (live demo: `https://curls.merkoba.com/dashboard`).

- Template: [server/templates/dashboard.html](server/templates/dashboard.html)
- Frontend code: [server/static/dashboard](server/static/dashboard)

### Colors

Each color profile maintains its own independent list of followed curls (up to 100 per color).

### Picker

When you successfully update a curl, it is added to the picker (`C` button) so you can quickly switch between curls you own.

- Curl names are saved in `localStorage` so your owned list persists across sessions.
- Secret keys are kept in **`sessionStorage` only** (cleared when the browser tab closes) and are never persisted to `localStorage`.

---

## Upgrading to v28 (Key Hashing Migration)

Starting in **v28**, Curls stores curl keys as salted password hashes (`scrypt`/`pbkdf2`) rather than plaintext.

If you are upgrading an existing deployment from **v27 or earlier**, existing curls in `server/curls.db` still have plaintext keys and will return `401 Error: Invalid key` on `/change` until migrated.

### Migrating `curls.db`

1. Back up your existing database:
   ```bash
   cp server/curls.db server/curls.db.bak
   ```
2. Preview how many plaintext keys will be hashed:
   ```bash
   cd server
   venv/bin/python migrate_keys.py --dry-run
   ```
   *(With Nix: `nix develop --command python server/migrate_keys.py --dry-run`)*
3. Run the migration in place (safe and idempotent — already-hashed keys are skipped):
   ```bash
   venv/bin/python migrate_keys.py
   ```
4. Verify your curls update normally, then remove the plaintext backup:
   ```bash
   rm server/curls.db.bak
   ```

### Other v28 Deployment Notes

- **CAPTCHA secret is mandatory:** The server no longer falls back to `"changeMe"`. Provide a random secret of at least 16 characters via `server/captcha_key.txt` or `CURLS_CAPTCHA_KEY`.
- **Reverse proxy IP handling:** `CURLS_PROXY_COUNT` defaults to `1` (for a single reverse proxy like Apache). Set `CURLS_PROXY_COUNT=0` when running directly without a proxy, or increase it to match the exact number of trusted proxies in front of Gunicorn.
- **Dashboard picker keys:** Any legacy plaintext keys previously saved in browser `localStorage["picker"]` are automatically migrated to `sessionStorage` for the current tab and scrubbed from `localStorage` on first visit.

---

## Installing & Running

### Option 1: Nix Flake

```bash
# Local development server (auto-generates dev captcha_key.txt and curls.db if missing)
nix run .#dev

# Initialize the SQLite database manually
nix run .#init-db

# Production Gunicorn server (requires CURLS_CAPTCHA_KEY or server/captcha_key.txt)
nix run .

# Enter development shell (Python env, Redis, SQLite, Ruff, Mypy, Pyright, Node.js)
nix develop
```

### Option 2: Python Virtualenv

Everything runs from inside `server/`:

```bash
cd server
python3 -m venv venv
venv/bin/pip install -r requirements.txt
./init_db.sh
```

Create a CAPTCHA secret (at least 16 random characters):

```bash
python3 -c "import secrets; print(secrets.token_hex(32))" > server/captcha_key.txt
chmod 600 server/captcha_key.txt
```

#### Development

```bash
cd server
CURLS_PROXY_COUNT=0 venv/bin/python -m flask --app app run --debug --port 5000
```

To bypass the CAPTCHA while developing locally, create `server/captcha_cheat.txt` with your chosen cheat string. This bypass is **only** active when Flask runs with `--debug`.

#### Production

1. Pre-bundle dashboard JS assets:
   ```bash
   cd server && venv/bin/python bundle.py
   ```
2. Run with `gunicorn` under a non-root `systemd` service:
   ```bash
   gunicorn --workers 4 --bind 127.0.0.1:5000 app:app
   ```
3. Place Apache (or Nginx) in front of Gunicorn as a reverse proxy, ensuring it sets/overwrites `X-Forwarded-For` cleanly so clients cannot spoof their IP.
4. Run a local `redis` instance for shared multi-worker rate limiting and CAPTCHA replay protection.

---

## Configuration (Environment Variables)

| Variable | Default | Description |
| --- | --- | --- |
| `CURLS_CAPTCHA_KEY` | *(from `server/captcha_key.txt`)* | Secret key (min 16 chars) used to sign CAPTCHA JWTs. Required. |
| `CURLS_REDIS_URI` | `redis://localhost:6379` | Redis connection URI for rate limiting and cross-worker CAPTCHA replay tracking (`memory://` for local testing). |
| `CURLS_PROXY_COUNT` | `1` | Number of trusted reverse proxies in front of Gunicorn (`0` when running without a proxy). |
| `CURLS_SERVER_DIR` | `./server` | Server directory used by the Nix flake runner scripts. |
| `HOST` / `PORT` / `WORKERS` | `127.0.0.1` / `5000` / `4` | Bind address, port, and Gunicorn worker count for the Nix runner apps. |
| `CURLS_ALLOW_SEED` | *(unset)* | Must be `1` (alongside `--force`) to allow `server/fill.py` to wipe and seed `curls.db` with dev data. |

---

## Bundling

Dashboard JS files under `server/static/dashboard/js/{libs,main}` are concatenated into `bundle.libs.js` and `bundle.main.js`.

- On server startup, `bundle.ensure_bundles()` checks file timestamps and rebuilds atomically (with file locking) only when bundles are missing or stale.
- To force a rebuild manually (e.g., during deployment):
  ```bash
  python3 server/bundle.py
  ```

---

## Rate Limiting & Security

- All endpoints use `Flask-Limiter` with a `moving-window` strategy backed by `redis` (with automatic in-memory fallback if Redis becomes unreachable).
- `POST /change` enforces both per-IP (`5/min`) and per-curl (`5/min`) rate limits.
- Solved CAPTCHA tokens are atomically claimed in Redis (`SET NX EX`) so they cannot be replayed across Gunicorn workers.
- Request bodies are capped at 16 KiB (`MAX_CONTENT_LENGTH`).

---

## Schema

The SQLite schema (WAL journal mode) is intentionally minimal — see [server/schema.sql](server/schema.sql).
