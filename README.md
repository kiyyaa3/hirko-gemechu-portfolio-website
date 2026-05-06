# Hirko Gemechu MERN Portfolio CMS

This project is a full MERN portfolio and admin CMS with public pages, downloads, blog posts, testimonials, certificates, and contact management.

## What it does

Admin can:

- Log in with JWT authentication
- Change the admin password
- Add, edit, feature, and delete projects
- Upload project images
- Upload public files such as CVs, PDFs, DOCX files, certificates, and images
- Edit homepage content, contact details, footer text, and links
- Publish blog and news posts
- Manage testimonials and certificates
- View, archive, and delete contact requests
- Receive email notifications when contact requests are submitted if SMTP is configured

Users can:

- View updated portfolio content from MongoDB
- Browse projects, blog posts, testimonials, and certificates
- Download shared files
- Email directly
- Call directly
- Submit a contact request stored in the admin dashboard

## Project structure

```text
client/              React frontend and admin dashboard
server/              Express API, auth, MongoDB models, uploads
server/uploads/      Uploaded files and images
render.yaml          Render deployment blueprint
modules/             Older static version kept as reference
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Use the root `.env` file:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/hirko_portfolio
JWT_SECRET=change_this_to_a_long_random_secret
ADMIN_EMAIL=admin@hirko.dev
ADMIN_PASSWORD=ChangeMe123!
CLIENT_URL=http://localhost:5173
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Hirko Portfolio <your-email@gmail.com>
NOTIFY_EMAIL=hirkogemechu10@gmail.com
```

3. Use `client/.env`:

```bash
VITE_API_URL=http://localhost:5000
```

4. Seed the admin account and starter content:

```bash
npm run seed
```

5. Run development:

```bash
npm run dev
```

Public site: `http://localhost:5173`

Admin login: `http://localhost:5173/admin/login`

## Default local admin

- Email: `admin@hirko.dev`
- Password: `ChangeMe123!`

Change the password from the admin dashboard before real deployment.

## Email notifications

SMTP is optional. If `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `NOTIFY_EMAIL` are filled, every contact form submission will also send an email notification to the admin inbox address.

For Gmail, use an app password instead of your normal password.

## Render + MongoDB Atlas hosting

This repo is prepared for hosting, but actual live deployment still needs your accounts and credentials.

### MongoDB Atlas

1. Create a free Atlas cluster
2. Create a database user
3. Add your Render IP access rule or allow `0.0.0.0/0` for testing
4. Copy the connection string into `MONGO_URI`

### Render

1. Push this repo to GitHub
2. Create a new Render Web Service from the repo
3. Render will read `render.yaml`
4. Set these environment variables in Render:

- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLIENT_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `NOTIFY_EMAIL`

5. After the first deploy, open Render Shell and run:

```bash
npm run seed
```

## Notes

- The profile image has been compressed for faster load time.
- Uploaded files are stored on the app server. For larger production use, move uploads to cloud storage such as Cloudinary, S3, or Supabase Storage.
- Live hosting cannot be completed from this workspace alone because it requires your Render and MongoDB Atlas account access.
