# Bar Entertainer Platform API

Backend API for a bar and entertainer booking platform. The service supports organizer/bar accounts, entertainer accounts, event publishing, event applications, direct bookings, profile management, anonymous reviews, email OTP flows, and Azure Blob uploads.

## Tech Stack

- Node.js with Express 5
- MongoDB with Mongoose
- JSON Web Tokens for authentication
- Nodemailer for OTP and notification emails
- Azure Blob Storage for media uploads
- ES modules (`type: "module"`)

## Project Structure

```text
server.js                 # Express app entry point
routes/                   # Route definitions
controllers/              # Request handlers by user domain
models/                   # Mongoose schemas
middleware/               # Auth middleware
config/                   # MongoDB and Azure Blob setup
utils/                    # JWT, email, cursor, and update helpers
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bar_entertainer_platform
JWT_SECRET=replace-with-a-secure-secret

EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password-or-app-password
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

AZURE_STORAGE_CONNECTION_STRING=your-azure-connection-string
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
AZURE_STORAGE_ACCOUNT_KEY=your-storage-key
AZURE_STORAGE_CONTAINER_NAME=your-container
```

Run the development server:

```bash
npm run dev
```

Run in production mode:

```bash
npm start
```

The API listens on `http://localhost:<PORT>` and exposes a health check at `/`.

## API Overview

### Entertainer Routes

Base path: `/api/entertainer`

- Auth: `POST /send-otp`, `/resend-otp`, `/verify-otp`, `/login`
- Password reset: `POST /password-reset/send-otp`, `/verify-otp`, `/set-new`
- Profile: `GET /profile`, `PATCH /profile`
- Uploads: `POST /uploads/sas`, `POST /uploads/confirm`
- Bookings: `GET /bookings`, `PATCH /bookings/:bookingId/status`, `GET /bookings/stats`
- Events: `GET /events`, `GET /events/:eventId/profile`, `POST /events/:eventId/apply`

### Organizer/Bar Routes

Base path: `/api/bar`

- Auth and password reset endpoints mirror entertainer routes.
- Profile: `GET /profile`, `PATCH /profile`
- Entertainers: `GET /entertainer`, `GET /entertainer/:entertainerId`, `GET /entertainer/search/query/`
- Events: `POST /event`, `GET /event`, `GET /event/:eventId`, `PATCH /event/:eventId`, `DELETE /event/:eventId`
- Bookings: `POST /bookings`, `GET /bookings`, `GET /bookings/stats`, `GET /bookings/search/query`
- Applications: `GET /applications`, `GET /applications/shortlisted`, `PATCH /applications/:applicationId/status`
- Reviews: token generation, public review submission, and event review stats

Protected routes require an authorization token handled by `middleware/auth.middleware.js`.

## Scripts

```bash
npm run dev   # Start with nodemon
npm start     # Start with node
npm test      # Placeholder; no test suite is configured yet
```

## Testing

No automated test suite is currently configured. When adding tests, prefer API-level tests with Supertest and a test MongoDB instance or mocks for MongoDB, email, and Azure Blob Storage.

## Security Notes

- Do not commit `.env` files or secrets.
- Use a strong `JWT_SECRET` outside local development.
- Keep Azure keys, connection strings, and email credentials in environment variables.
- Validate authenticated user ownership before modifying bookings, events, profiles, or uploads.

￼
￼
￼
