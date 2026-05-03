# Gatewise Events

Gatewise Events is a premium event management platform for Canadian hosts across all industries.

It includes:
- Host accounts with isolated event ownership
- Event builder wizard with age gates and certification requirements
- RSVP + lead capture fields (store, brand, role, certification)
- Invite flows and attendee management
- Policy acceptance and legal audit fields at sign-up

## Tech Stack

- Next.js 16 + App Router
- TypeScript
- Prisma 7 + SQLite (dev)
- NextAuth (credentials)
- Resend (email)
- Vercel Blob (uploads)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Generate Prisma client:

```bash
DATABASE_URL="file:./dev.db" npx prisma generate
```

4. Run development server:

```bash
npm run dev
```

5. Open http://localhost:3000

## Build

```bash
DATABASE_URL="file:./dev.db" npm run build
```

## Legal Notes

This platform supports age-gated and regulated events but does not replace legal advice.
Hosts are responsible for permits, compliance, and event operations under applicable Canadian laws.
