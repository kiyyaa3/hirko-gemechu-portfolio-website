# Render Deployment

This project is configured for split hosting:

- Render Web Service: Express API at `/api/...`
- Netlify static site: React frontend from `client/dist`

Use `render.yaml` as a Blueprint in Render for the backend API.

## Required Environment Variables

Set these in Render when creating the service:

```text
MONGO_URI
ADMIN_EMAIL
ADMIN_PASSWORD
CLIENT_URL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
NOTIFY_EMAIL
SERVE_CLIENT
RATE_LIMIT_MAX
OLLAMA_BASE_URL
OLLAMA_MODEL
```

Render will generate `JWT_SECRET` from the Blueprint.

## Values

- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_USER`: your Gmail address
- `SMTP_PASS`: your Google app password without spaces
- `SMTP_FROM`: your Gmail address
- `NOTIFY_EMAIL`: the inbox that should receive contact form notifications
- `CLIENT_URL`: your frontend URL after Netlify deploy, for example `https://your-site.netlify.app`
- `SERVE_CLIENT`: `false`
- `RATE_LIMIT_MAX`: `1000`
- `OLLAMA_BASE_URL`: your Ollama server URL, for example `https://your-ollama-host.example.com`
- `OLLAMA_MODEL`: the installed Ollama model name, for example `llama3.1`

If Ollama is not reachable, `/api/chat` still returns helpful portfolio fallback answers instead of failing.

## Commands Render Runs

```text
npm install
npm run seed
npm start
```

After deploy, check:

```text
/api/health
/api/content
```

## Netlify Frontend

This repo includes `netlify.toml` and `client/public/_redirects`.

Set this environment variable in Netlify:

```text
VITE_API_URL=https://your-render-backend.onrender.com
```

Netlify will run:

```text
npm install && npm run build
```

and publish:

```text
client/dist
```

After Netlify deploys, copy the Netlify URL into Render as `CLIENT_URL`, then redeploy/restart the Render service.
