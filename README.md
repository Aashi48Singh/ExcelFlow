# ExcelFlow

Excel/CSV automation for teams: upload → preview/edit → clean → validate → automate (visual builder, saved workflows, templates, natural-language commands) → report → export. MERN stack.

## Run locally
```bash
# 1. API  (needs a MongoDB Atlas URI)
cd server && cp .env.example .env     # fill MONGO_URI and JWT_SECRET
npm install && npm run dev            # http://localhost:4000

# 2. Web
cd client && cp .env.example .env     # VITE_API_URL=http://localhost:4000/api
npm install && npm run dev            # http://localhost:5173
```
Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
Engine tests (no database needed): `cd server && npm run test:engine`

## Deploy
**Database – MongoDB Atlas:** create a free cluster, add a database user, allow network access (0.0.0.0/0 for Render/Railway), copy the connection string.

**Backend – Render (or Railway):** New Web Service → root directory `server` → build `npm install` → start `npm start`.
Env vars: `MONGO_URI`, `JWT_SECRET`, `ALLOWED_ORIGIN=https://<your-app>.vercel.app` (comma-separate multiple origins). `PORT` is set by the platform.
Health check path: `/health`.

**Frontend – Vercel:** import the repo → root directory `client` → framework Vite. Env var: `VITE_API_URL=https://<your-api>.onrender.com/api`. `vercel.json` already rewrites all routes to `index.html`.
Then update `ALLOWED_ORIGIN` on the backend to your final Vercel URL.

## How it works
- Uploads are parsed in memory (Multer memory storage, 5 MB cap) with SheetJS; rows are stored in MongoDB, so the API is stateless and works on hosts with ephemeral disks.
- Workspace edits, cleaning, validation and automation results happen on the *working copy*; nothing is persisted until **Save** (Undo is available before that).
- Running a saved automation on a file **does** overwrite that file's data and stores the output workbook in History.
- Automations are JSON rules interpreted by a whitelist of handlers in `server/services/engine.js`. No `eval`, no user JavaScript. Natural-language commands are regex-matched to those same rules.
- Rule columns are matched case/space/underscore-insensitively ("Total Salary" = "total_salary").

## Limits / notes
- First sheet of a workbook is processed; max 50,000 rows and 5 MB per file (MongoDB's 16 MB document limit).
- Ambiguous dates (01/10/2026) follow the day-first/month-first choice you pick; impossible readings fall back to the other order.
- `xlsx` 0.18.5 is the last npm release of SheetJS and has published advisories (prototype pollution / ReDoS on untrusted files). Mitigated here by file-size limits and auth, but for stricter environments install SheetJS from its CDN tarball (see docs.sheetjs.com/docs/getting-started/installation/nodejs).
