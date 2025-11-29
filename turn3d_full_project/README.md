Turn3D — Full Project (Prototype)
================================

This ZIP contains a full prototype: React client + Node/Express server with Stripe subscriptions, webhook handling,
file upload (local), MongoDB (optional), S3 placeholder, and Nodemailer email sending.

Quick start (local)
-------------------
1. Install Node.js (LTS) and npm.
2. Extract the ZIP.
3. Open a terminal.

Server:
  cd server
  npm install
  create a file `.env` (see .env.example)
  npm start

Client:
  cd client
  npm install
  create a file `client/.env` with your Stripe publishable key and price IDs
  npm start
  Open http://localhost:3000

Stripe webhooks (local testing):
  Install Stripe CLI: https://stripe.com/docs/stripe-cli
  Run:
    stripe listen --forward-to localhost:4242/webhook
  Copy the webhook secret into server/.env (STRIPE_WEBHOOK_SECRET)

Notes:
- The server stores uploaded originals in server/uploads directory.
- For production, replace local storage with S3, replace JSON file sessions with a real DB.
- Replace SMTP placeholders with real SMTP or use SendGrid.
- The client uses react-scripts for simplicity.

If you want, I can:
- Configure MongoDB Atlas and wire it in.
- Configure S3 and sign upload URLs.
- Add Docker files for easier deployment.
- Deploy to Render / Vercel for you.

