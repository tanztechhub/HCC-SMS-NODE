# HCC School SMS server

Standalone Express API for Hospitality Competence Center Africa.

## Setup

Use Node.js 22 or newer.

```bash
npm ci
cp .env.example .env
```

Configure `HCC_SMS_MONGODB_URI`, `HCC_SMS_DB_NAME`, a strong
`HCC_SMS_JWT_SECRET`, and `CORS_ORIGINS` for the frontend's origin.
MongoDB must support transactions (Atlas or a replica set).
Configure the email and Cloudinary environment variables when using those features.

```bash
npm run dev
```

Production start: `npm start`. API prefix: `/hcc-sms`.
Health: `/hcc-sms/api/health` (also available through `/api/health`).

## Verification

`npm run check` checks syntax, standalone imports, route mounting, health, CORS
and 404 handling without accessing a live database or sending email.
Database-backed workflows require a configured test database.

Environment files and credentials are local configuration and must stay out of Git.
Maintenance scripts in `PROD-UTILS` are manual tools and do not run on startup.
Official contact and banking information remains pending HCC confirmation.
