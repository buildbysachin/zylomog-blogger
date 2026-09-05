# Zylomog — Tech Blogging Platform

A full-stack, production-grade tech blogging website.

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn-style UI, Lucide icons
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Media**: ImageKit (thumbnails, avatars, site logo)
- **Auth**: JWT in httpOnly cookies + bcrypt password hashing

```
zylomog/
├── client/     # Next.js frontend
└── server/     # Express REST API
```

---

## 1. Prerequisites

- Node.js 18+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A free [ImageKit.io](https://imagekit.io) account

## 2. Backend Setup (`/server`)

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Any long random string |
| `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_URL_ENDPOINT` | From ImageKit Dashboard → Developer → API Keys |
| `CLIENT_URL` | `http://localhost:3000` in dev |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credentials for the first admin account |

Create the initial admin account and default site settings:

```bash
npm run seed
```

Start the API:

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start       # production
```

The API runs at `http://localhost:5000` — verify with `GET /api/health`.

## 3. Frontend Setup (`/client`)

```bash
cd client
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` in dev |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in dev |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | Same public key as the backend |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | Same URL endpoint as the backend |

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`. Log in at `/login` with the seeded admin credentials, then go to `/admin` to start publishing.

## 4. Production Deployment Notes

- **Backend**: Deploy to Render / Railway / Fly.io / a VPS. Set `NODE_ENV=production`, a real `MONGO_URI` (Atlas), and `CLIENT_URL` to your deployed frontend origin (cookies require this to match for CORS + `SameSite=None; Secure`).
- **Frontend**: Deploy to Vercel. Set the three `NEXT_PUBLIC_*` env vars in the Vercel dashboard.
- Because auth uses httpOnly cookies across two different domains in production, the backend cookie is set with `SameSite=None; Secure` automatically when `NODE_ENV=production` — this requires **HTTPS** on both ends.
- Add your production frontend domain to `remotePatterns` in `next.config.mjs` if you switch ImageKit endpoints.

## 5. Key Features Implemented

**Public**
- Home page: hero/featured post, latest articles grid, trending sidebar
- Full-text search with debounce, category filtering
- Single post page: table of contents, author bio, share buttons, related posts, likes & comments
- Dark/light theme toggle

**Auth**
- Register / Login / Logout via JWT httpOnly cookies, bcrypt hashing
- Route protection middleware (`protect`, `isAdmin`) on the API
- Client-side `AdminGuard` for `/admin/*` routes

**Admin Dashboard** (`/admin`)
- Overview stats (post counts, views, users)
- Post management: list, filter by status, delete
- Rich text editor (TipTap) with image embedding, create/edit/draft/publish posts
- Drag-and-drop thumbnail upload via ImageKit
- Site settings: logo, name, tagline, meta description, social links
- User management: promote/demote admin, activate/deactivate, delete

**User Profile** (`/profile`)
- Update name, bio, avatar (ImageKit upload)

**Security & Production Readiness**
- Helmet, CORS (credentialed, origin-locked), rate limiting (global + strict on auth), mongo-sanitize, hpp
- Zod validation on all mutating endpoints
- Centralized Express error handler with normalized JSON responses
- SEO: per-page `generateMetadata`, Open Graph/Twitter cards, Next.js `<Image>` optimization

## 6. API Reference (summary)

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Private |
| GET | `/api/auth/me` | Private |
| GET | `/api/posts` | Public (search/category/tag/pagination) |
| GET | `/api/posts/trending` | Public |
| GET | `/api/posts/:slug` | Public |
| POST | `/api/posts` | Admin |
| PUT | `/api/posts/:id` | Admin |
| DELETE | `/api/posts/:id` | Admin |
| GET | `/api/posts/admin/all` | Admin |
| GET | `/api/posts/admin/:id` | Admin |
| POST | `/api/posts/:id/like` | Private |
| POST | `/api/posts/:id/comments` | Private |
| PUT | `/api/users/me` | Private |
| GET / PUT / DELETE | `/api/users/:id` | Admin |
| GET | `/api/uploads/auth` | Private (signed ImageKit params) |
| POST | `/api/uploads` | Private (server-side upload fallback) |
| GET | `/api/settings` | Public |
| PUT | `/api/settings` | Admin |
