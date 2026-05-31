# Shafique Ahmed — Portfolio

A full-stack personal portfolio website built with Next.js 14 (App Router) on the frontend and FastAPI on the backend, with PostgreSQL, Cloudinary, and Resend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, JavaScript, Tailwind CSS |
| Backend | FastAPI (Python 3.14), SQLAlchemy 2.0 |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 (`Mapped` / `mapped_column`) |
| DB Driver | psycopg v3 (`psycopg[binary]`) |
| Auth | JWT (access + refresh) + bcrypt (direct, no passlib) |
| Files | Cloudinary |
| Email | Resend |

---

## Project Structure

```
portfolio/
├── backend/
│   ├── alembic/          # Database migrations
│   ├── auth/             # JWT, bcrypt hashing, dependencies
│   ├── models/           # SQLAlchemy models (13 tables)
│   ├── routes/           # FastAPI routers (public + admin)
│   ├── schemas/          # Pydantic v2 schemas
│   ├── services/         # Cloudinary, Resend email
│   ├── config.py         # pydantic-settings
│   ├── database.py       # Engine, session, Base
│   ├── main.py           # App entry point
│   ├── seed.py           # Initial data seeder
│   ├── utils.py          # slugify + ensure_unique_slug
│   └── requirements.txt
└── frontend/
    ├── app/              # Next.js App Router pages
    │   ├── page.jsx              # Home
    │   ├── about/
    │   ├── projects/             # List + [slug] detail
    │   ├── skills/
    │   ├── experience/
    │   ├── education/
    │   ├── blog/                 # List + [slug] detail
    │   ├── contact/
    │   └── admin/                # Full admin panel
    ├── components/
    │   ├── admin/        # AdminGuard, AdminShell, modals
    │   └── ui/           # Reusable public components
    ├── lib/              # api.js, auth.js, utils.js
    └── package.json
```

---

## Setup Guide — Windows + Python 3.14 + PostgreSQL + Node.js 24

> **Read the whole step before running any command. Run all commands in PowerShell inside VS Code.**
> Confirm each step before moving to the next.

---

### STEP 1 — Install Python 3.14

1. Go to https://www.python.org/downloads/ and download the latest **Python 3.14** Windows installer (64-bit).
2. Run the installer. On the first screen:
   - ✅ Check **"Add python.exe to PATH"**
   - Click **"Install Now"**
3. When it finishes, open a **new** PowerShell terminal in VS Code (Terminal → New Terminal) and verify:

```powershell
python --version
# Should print: Python 3.14.x
```

> **⚠️ If `python` is not found:** Close and reopen VS Code, then try again. If still not found, search Windows for "Environment Variables", open it, find PATH under "User variables", and make sure the Python folder is listed.

---

### STEP 2 — Install PostgreSQL

1. Go to https://www.postgresql.org/download/windows/ and download the installer for PostgreSQL 16.
2. Run the installer with defaults. When prompted:
   - Set a password for the `postgres` superuser — **write this down**, you need it
   - Leave port as **5432**
   - Leave locale as default
3. Finish installation. **Do not** check "Stack Builder" at the end.
4. Add PostgreSQL to PATH:
   - Search Windows for "Edit environment variables for your account"
   - Under "User variables", click **PATH** → **Edit** → **New**
   - Add: `C:\Program Files\PostgreSQL\16\bin`
   - Click OK on all dialogs
5. Open a **new** PowerShell and verify:

```powershell
psql --version
# Should print: psql (PostgreSQL) 16.x
```

> **⚠️ Note:** The `psql` tool and the `postgres` Windows service run as different users. You connect to psql as the `postgres` database user (not your Windows user). Keep your PostgreSQL password handy.

---

### STEP 3 — Create the PostgreSQL Database

```powershell
psql -U postgres
```

It will prompt for the password you set during installation. Then run these SQL commands:

```sql
CREATE DATABASE portfolio_db;
\q
```

That's it. The database is ready.

---

### STEP 4 — Install Node.js 24

1. Go to https://nodejs.org/ and download **Node.js 24 LTS** (the "Current" or "LTS" version showing v24.x).
2. Run the installer with all defaults.
3. Open a **new** PowerShell and verify:

```powershell
node --version
# Should print: v24.x.x

npm --version
# Should print: 10.x.x
```

---

### STEP 5 — Set Up the Backend

Open PowerShell and navigate to the backend folder:

```powershell
cd portfolio\backend
```

Create a virtual environment:

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

> **⚠️ If you see an error about execution policy**, run this first, then try again:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

Your terminal prompt should now start with `(venv)`.

Install dependencies:

```powershell
pip install -r requirements.txt
```

> This may take 1–2 minutes. `psycopg[binary]` downloads pre-built wheels — **no C++ compiler needed**.

---

### STEP 6 — Configure Backend Environment

Copy the example env file:

```powershell
Copy-Item .env.example .env
```

Open `.env` in VS Code and fill in:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOURPASSWORD@localhost:5432/portfolio_db
SECRET_KEY=generate-a-random-64-char-string-here
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=yourpassword
```

> **Generate a SECRET_KEY** — run this in PowerShell:
> ```powershell
> python -c "import secrets; print(secrets.token_hex(32))"
> ```
> Copy the output into SECRET_KEY.

For Cloudinary and Resend, you can leave them blank for now — uploads and email won't work, but everything else will.

---

### STEP 7 — Run the Backend

Make sure your venv is active (`(venv)` in prompt), then:

```powershell
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
[seed] Admin user created: your@email.com
[seed] Default profile created.
[seed] Sample categories created.
[seed] Sample skills created.
[seed] Sample education created.
[seed] Sample experience created.
```

Visit http://localhost:8000/api/docs to see the interactive API documentation.

> **Keep this terminal open.** The backend must be running while you use the frontend.

---

### STEP 8 — Set Up the Frontend

Open a **second** PowerShell terminal in VS Code (click the `+` icon in the terminal panel):

```powershell
cd portfolio\frontend
```

Install dependencies:

```powershell
npm install
```

> This takes 1–3 minutes on first run.

Copy the env file:

```powershell
Copy-Item .env.local.example .env.local
```

The defaults are correct for local development — no changes needed.

---

### STEP 9 — Run the Frontend

```powershell
npm run dev
```

You should see:
```
▲ Next.js 14.x
- Local:  http://localhost:3000
```

Visit http://localhost:3000 — your portfolio is live!

---

### STEP 10 — Access the Admin Panel

Go to http://localhost:3000/admin/login

Use the credentials you set in `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

From the admin panel you can:
- Edit your profile and upload a photo
- Add projects, skills, experience, education
- Write blog posts
- View messages from the contact form
- Check analytics

---

## Changing Admin Credentials Later

Edit your `.env` file with the new email/password, then set:

```env
ADMIN_FORCE_UPDATE=true
```

Restart the backend. The seed function will update the admin record. Set `ADMIN_FORCE_UPDATE=false` again afterward.

---

## Database Migrations with Alembic

After the first run, tables are auto-created. For schema changes, use Alembic:

```powershell
# Generate a migration after changing a model
alembic revision --autogenerate -m "add something"

# Apply migrations
alembic upgrade head
```

---

## Setting Up Cloudinary (for image uploads)

1. Create a free account at https://cloudinary.com/
2. From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add to your backend `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart the backend.

---

## Setting Up Resend (for contact form emails)

1. Create a free account at https://resend.com/
2. Go to API Keys → Create API Key
3. Add to backend `.env`:
   ```env
   RESEND_API_KEY=re_your_key
   CONTACT_NOTIFICATION_EMAIL=your@email.com
   ```
4. Restart the backend.

> The free tier allows 100 emails/day, enough for a personal portfolio.

---

## Production Deployment Notes

- Set `APP_ENV=production` in the backend `.env`
- Use a proper `SECRET_KEY` (at least 32 random bytes)
- Set `CORS_ORIGINS` to your actual domain
- Run the backend with: `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`
- Deploy the frontend with `npm run build` then `npm start`, or to Vercel
- Set `NEXT_PUBLIC_API_URL` to your backend's public URL

---

## Planned Upgrades (Stubs in Codebase)

The settings page lists these — they're wired to be added without restructuring:

- 🌐 i18n (Urdu + English toggle)
- 📧 Newsletter signup (Resend Audiences or Buttondown)
- 💬 Blog comment system (admin-moderated)
- 👁️ View counter per project / blog post
- 🔍 Global search
- 📡 RSS feed for blog
- 📊 GitHub stats integration
- 📋 Public guestbook / webmentions
- 🚧 "Currently building" project tracker on the home page

---

## Common Issues

| Problem | Solution |
|---|---|
| `psql` not found | Add `C:\Program Files\PostgreSQL\16\bin` to your user PATH |
| `venv\Scripts\Activate.ps1` fails | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Backend crashes on start | Check `.env` — especially `DATABASE_URL` and that PostgreSQL is running |
| `ADMIN_FORCE_UPDATE` not working | Make sure it's `=true` (not `=True`) and restart the backend |
| Images not showing | Add your Cloudinary credentials to `.env` and restart |
| CORS error in browser | Check `CORS_ORIGINS` in `.env` includes `http://localhost:3000` |
