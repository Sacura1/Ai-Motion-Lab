# AI Motion Lab

React and TypeScript landing page with an Express API, Paystack checkout,
PostgreSQL enrollment records, and one-member Telegram channel invitations.

## Local development

```powershell
npm install
Copy-Item backend/.env.example backend/.env
npm run db:migrate -w backend
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` to the backend at
`http://localhost:3001`.

## Railway deployment

The simplest deployment is one Railway service. Run `npm run build` as the build
command and `npm start` as the start command from the repository root. The start
command applies the repeatable database migration, starts Express, serves `/api/*`,
and serves the compiled React app with SPA fallback for payment callbacks.

Set `FRONTEND_URL` to that same Railway public origin. Leave `VITE_API_URL` unset;
the frontend will call `/api` on its own origin. After deploying, both of these
must return JSON:

- `https://YOUR_DOMAIN/api/health`
- `https://YOUR_DOMAIN/api/offer`

If either URL returns the website HTML, Railway is still starting a static-only
frontend command instead of the root `npm start` command.

## Separate frontend and backend deployments

When the services use different domains, configure both directions:

- On the **frontend deployment**, set `VITE_API_URL` to the backend origin, such
  as `https://your-backend.up.railway.app`. It is a Vite build variable, so
  redeploy the frontend after setting it. Both the bare origin and a value ending
  in `/api` are accepted.
- On the **backend deployment**, set `FRONTEND_URL` to the public frontend origin,
  such as `https://your-site.vercel.app`. This value controls the Paystack return
  URL and the browser CORS allowlist. It must not contain a path or point back to
  the backend. Set `TRUST_PROXY_HOPS=1` for Railway so request rate limiting uses
  the visitor address supplied by Railway's reverse proxy.

Required backend variables are listed in [backend/.env.example](backend/.env.example).
Resend and `EMAIL_FROM` are optional. Run `npm run db:migrate -w backend` against
the deployed database before opening enrollment. The backend `npm start` command
also runs the compiled migration automatically when Railway uses the `backend`
folder as its service root.

After payment, the callback verifies the transaction status, reference, saved
amount, and currency. A successful buyer sees a confirmation panel with their
one-member Telegram invitation. The invitation expires after 24 hours.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```
