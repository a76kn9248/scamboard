# SCAMBOARD

A community-powered memecoin scammer watchlist where users submit deployer addresses or Twitter handles, describe the scam, and the community confirms and comments. Everything is bot-proof and human-verified through Cloudflare Turnstile, rate limiting, and authentication requirements.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Docker (local dev)
- **ORM**: Prisma
- **Auth**: NextAuth.js with credentials provider (email + password, bcrypt hashing, JWT sessions)
- **Bot Protection**: Cloudflare Turnstile
- **Styling**: Tailwind CSS
- **Process Manager (prod)**: PM2
- **Reverse Proxy (prod)**: Nginx

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd scamboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and update if needed:

```bash
cp .env.example .env
```

The default `.env` file is pre-configured for local development with test Turnstile keys.

### 4. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Default (Dev) |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://scamboard:scamboard_dev@localhost:5432/scamboard` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | `dev-secret-change-in-production-PLACEHOLDER` |
| `NEXTAUTH_URL` | Base URL for NextAuth | `http://localhost:3000` |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | `1x00000000000000000000AA` (test key) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key | `1x0000000000000000000000000000000AA` (test key) |

**Note**: The default Turnstile keys are test keys that always pass verification. Replace them with real keys for production.

## API Routes

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (login/session)

### Reports
- `GET /api/reports` - List reports (supports `sort`, `search`, `page`, `limit` params)
- `POST /api/reports` - Create report (auth + Turnstile required)
- `GET /api/reports/[id]` - Get single report with comments

### Confirms
- `POST /api/reports/[id]/confirm` - Toggle confirm (auth + Turnstile required)

### Comments
- `POST /api/reports/[id]/comments` - Add comment (auth + Turnstile required)

## Anti-Bot Measures

1. **Cloudflare Turnstile** - Verified on all write operations
2. **Server-side rate limiting** - Per-user limits on reports (30s) and comments (15s)
3. **Input validation** - All inputs sanitized, HTML stripped
4. **Auth required** - No anonymous writes
5. **Identifier validation** - Wallet addresses and Twitter handles validated

## Production Deployment

### On Ubuntu VPS (Hetzner)

1. Install Node.js 18+, PostgreSQL, Nginx, PM2
2. Clone repo and install dependencies
3. Set up production `.env` with real values:
   - Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - Get real Turnstile keys from Cloudflare dashboard
   - Update `DATABASE_URL` for production PostgreSQL
4. Run migrations: `npx prisma migrate deploy`
5. Build: `npm run build`
6. Start with PM2: `pm2 start npm --name scamboard -- start`
7. Configure Nginx reverse proxy to port 3000
8. Set up SSL with Certbot

## License

MIT
