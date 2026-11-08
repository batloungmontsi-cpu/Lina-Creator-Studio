# Mila Mokoena — Creator Studio

A responsive React experience for a content creator and their audience. The public portal helps viewers find and interact with stories; the creator studio organizes content, comments, and publishing plans.

## Features

### Viewer portal

- Creator introduction and featured story
- Published story cards with category filters, keyword search, and sorting
- Story detail dialog, likes, share-link copying, and comments
- Comment submissions are held for creator approval
- Newsletter sign-up interaction
- Responsive layouts, keyboard focus styles, and reduced-motion support

### Creator studio

- Overview of stories, publishing status, community comments, and views
- Create, edit, and delete stories; save drafts, publish immediately, or schedule a date and time
- Automatically publish due scheduled stories while the API is running
- Choose one featured story for the public home page
- Filter content by publication status
- Review, approve, hide, or delete comments
- Upcoming-content calendar

## Technology

- React and JavaScript
- Create React App (`react-scripts`)
- CSS
- Node.js and Express API (`server/`)
- MongoDB Atlas with Mongoose models
- JWT creator authentication and bcrypt password hashing
- React frontend connected to the Express API
- Browser storage is used for an anonymous viewer ID and a temporary creator-session token

## Run locally

Requires Node.js and npm.

```bash
npm install
npm start
```

The development server opens the app at `http://localhost:3000`.

Run the tests and create an optimized production build:

```bash
npm test -- --watchAll=false
npm run build
```

## MongoDB Atlas and API setup

The Express API and MongoDB models are in `server/`. To connect them:

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password. Do not use your Atlas account password.
3. In Atlas **Network Access**, allow your development machine's IP address. Avoid opening access to `0.0.0.0/0` except temporarily when you understand the risk.
4. In Atlas, choose **Connect → Drivers** and copy the connection string.
5. Copy `server/.env.example` to `server/.env`. Replace the MongoDB URI placeholders with the Atlas URI, set a randomly generated `JWT_SECRET` of at least 32 characters, and set a strong creator email/password. Keep `server/.env` private; it is ignored by Git.
6. Install the API dependencies. Create the initial creator account once:

   ```bash
   npm --prefix server install
   npm --prefix server test
   npm run server:create-admin
   ```

   If you created the example `creator@example.com` account with a placeholder password, set your actual `ADMIN_EMAIL` and a new `ADMIN_PASSWORD` (at least 12 characters) in `server/.env`. If changing the email, set `ADMIN_PREVIOUS_EMAIL` to the email of the already-created account. Then run:

   ```bash
   npm --prefix server run reset-admin-password
   ```

7. Start the API and React app in separate terminals:

   ```bash
   npm run server
   npm start
   ```

8. Visit `http://localhost:5000/api/health`. A successful response means the API started after connecting to MongoDB.

The backend exposes `POST /api/auth/login`, public `GET /api/contents` and `GET /api/contents/:id`, authenticated content create/update/delete and listing, public comment submission and approved-comment reads, authenticated comment moderation, likes, and authenticated dashboard stats. Creator routes require a JWT bearer token.

The frontend reads and writes stories, likes, and comments through the API. By default it connects to `http://localhost:5000/api`. Set `REACT_APP_API_URL` in the React environment/deployment platform to use another API URL. Set the API's `CORS_ORIGINS` to the exact frontend origin when deploying. Never put the Atlas URI or JWT secret in frontend variables.

### MongoDB collections

- `users`: creator account and bcrypt password hash
- `contents`: story details, publishing status, views, and likes
- `viewers`: anonymous viewer IDs and display names
- `comments`: viewer comments and moderation status
- `likes`: one like per viewer per story

The API expects the Atlas database and credentials to be configured before it will start. No database secrets are included in this repository.

### Optional demo content

After configuring `server/.env` to connect to the intended Atlas database, run:

```bash
npm --prefix server run seed
```

This inserts seven clearly labelled `Sample:` stories, including articles, a podcast, a video, a photo story, and an image. It is safe to repeat and creates no creator account or password. Do not publish creator login credentials in this README or in a public submission. Remove the sample posts from the authenticated dashboard before presenting them as real creator publications.

The seed also adds four clearly labelled sample comments across those stories: two Approved and two Pending, so the public comments and creator moderation views can be demonstrated. Re-running the seed does not duplicate existing sample stories or comments. The sample podcast and video have no external media link, avoiding placeholder links.

To remove only the seven known seeded sample stories and their associated comments and likes from the configured database, run:

```bash
npm --prefix server run seed:clear
```

This cleanup does not remove other content, comments, or likes. Confirm `server/.env` points to the intended database before running either command. Neither command creates a creator login.

## Project structure

```text
src/
  components/
    AboutCreator.js       Creator introduction section
    CalendarView.js       Upcoming stories
    CommentManager.js     Comment moderation
    ConfirmDialog.js      Accessible destructive-action confirmation
    ContentManager.js     Story listing and actions
    CreatorLogin.js       Authenticated creator sign-in
    DashboardOverview.js  Creator statistics and recent stories
    DashboardSidebar.js   Creator-studio navigation
    FeaturedStory.js      Featured story panel
    HeroSection.js        Viewer-portal introduction
    NewsletterSignup.js   Newsletter form interaction
    SiteFooter.js         Shared page footer
    SiteHeader.js         Shared responsive navigation
    StatusTag.js          Reusable content-status indicator
    StoryCard.js          Story card and engagement actions
    StoryDialog.js        Story details and viewer comments
    StoryForm.js          Create and edit story form
    StoryLibrary.js       Searchable, filterable story collection
    ToastMessage.js       Reusable status notification
  data/
    creatorData.js        Example stories, comments, and categories
  pages/
    CreatorDashboard.js   Creator dashboard page composition
    ViewerPortal.js       Public viewer page composition
  utils/
    creatorUtils.js       Storage and number-formatting helpers
    apiMappers.js         Convert MongoDB API responses to UI models
  hooks/
    useDialogAccessibility.js  Escape, focus trapping, and focus restoration
  services/
    api.js                Frontend API client and session token handling
  App.js                  Application state and shared event handlers
  App.css                 Application component and responsive styles
  App.test.js             Viewer and creator interaction tests
  index.css               Global styles and typography
  index.js                React application entry point
server/
  src/config/             MongoDB connection
  src/middleware/         JWT authentication and error handling
  src/models/             User, content, viewer, comment, and like schemas
  src/routes/             Authentication, content, engagement, and stats APIs
  src/scripts/             Creator setup, password reset, and demo-content seed
  .env.example             Safe environment-variable template
```

## Data and deployment status

The repository now has a **MongoDB-backed local application**: the React frontend calls the Express API, which reads and writes Atlas data. Creator-dashboard operations require login. API automated tests do not connect to a real cluster; the project owner has separately confirmed that their local API connects to Atlas.

The public hosting URL has not been configured. Deploy both services before treating the project as the full-stack assessment submission.

### Deployment checklist

1. Push the source to a private GitHub repository only after rotating any credentials that were included in a local file or archive. Keep `server/.env` out of Git and submission ZIP files; commit only `server/.env.example`.
2. In Render, create a **Web Service** for this repository with root directory `server`, build command `npm install`, and start command `npm start`.
3. Configure these Render environment variables without placing secrets in frontend settings:
   - `MONGODB_URI`: Atlas cluster URI with the database name
   - `DB_USER` and `DB_PASSWORD`: Atlas database-user credentials
   - `JWT_SECRET`: a randomly generated secret of at least 32 characters
   - `CORS_ORIGINS`: the exact deployed frontend origin, without a trailing slash
   - `NODE_ENV`: `production`
4. In Atlas **Network Access**, allow the backend host to connect. If the host requires `0.0.0.0/0`, use a unique strong database password and restrict the Atlas database user to only the required database permissions.
5. In Vercel or Netlify, deploy the React app and set `REACT_APP_API_URL` to `https://<your-render-service>.onrender.com/api`. This value is included at build time, so redeploy after changing it.
6. Create the initial admin account once with `npm run server:create-admin` from the project root using the local `server/.env` values for the same Atlas database.
7. Test the deployed frontend and API: check `/api/health`, creator login, publishing and scheduling, story details, likes, comments, and comment moderation. Record the public frontend and GitHub URLs for submission.

To add clearly labelled sample stories to the configured MongoDB database for a demonstration, run `npm --prefix server run seed`. The command is safe to repeat and does not create a creator account or set any login credentials. Replace or remove sample stories from the authenticated dashboard before presenting the site as the creator's real publications.

If credentials were included in an archive, remove those files and rotate the Atlas database password, `JWT_SECRET`, and creator password before pushing. Changing `JWT_SECRET` invalidates existing creator sessions. After updating the local admin email/password settings, run `npm --prefix server run reset-admin-password` to update the stored creator account.

## Customizing the example content

The story and comment fixtures in `src/data/creatorData.js` are used by automated tests; create real published stories from the authenticated creator dashboard.
