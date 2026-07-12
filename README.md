# Muhasib — FBR Digital Invoicing SaaS

Issue FBR-compliant digital invoices, transmit them to PRAL in real time, and manage
every client from one dashboard. Built for Pakistani SMEs and tax consultants.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · MongoDB (Mongoose) · JWT sessions (jose + httpOnly cookies)

## Features
- **Auth** — email/password, bcrypt hashing, 30-day JWT session cookie, middleware-protected dashboard
- **Client (buyer) directory** — registered/unregistered buyers, NTN/CNIC, province
- **Invoice builder** — line items with HS codes, per-line tax rates, live totals
- **FBR transmission** — swappable adapter layer:
  - `sandbox` (default): validates the payload the way FBR does and issues a 22-digit invoice № + QR payload, so you can demo/test with zero credentials
  - `pral`: posts to the PRAL Digital Invoicing API (`PRAL_API_URL` + per-user bearer token from Settings)
- **Bulk CSV import** — one row per line item, rows grouped by `invoiceRef`, all imported as drafts
- **Compliance overview** — accepted/draft/rejected counts + estimated Section 33 penalty exposure
- **Free SEO tools** (no login): `/tools/penalty-calculator` and `/tools/irn-validator`

## Run locally
```bash
cp .env.example .env       # set MONGODB_URI and JWT_SECRET
npm install
npm run dev                # http://localhost:3000
```
MongoDB Atlas free tier works fine for `MONGODB_URI`.

## Going live with FBR
1. Register as an integrator via the IRIS portal and obtain PRAL sandbox credentials.
2. Set `PRAL_API_URL` in `.env` and paste your bearer token in **Dashboard → Settings**.
3. Switch the FBR connection from **Sandbox** to **Live** and complete FBR scenario testing
   before issuing production invoices.
4. Verify the exact request/response field names against the current PRAL DI spec —
   `src/lib/fbr/pral.ts` follows the published shape but the spec changes; the adapter is
   isolated so updates touch one file.

## Legal note
Penalty figures in `src/lib/penalty.ts` reflect amounts widely cited by licensed
integrators under Section 33, Sales Tax Act 1990; published sources conflict on exact
statutory wording. Keep the `lastVerified` date current and show the disclaimer wherever
figures appear. This software is not legal or tax advice.
