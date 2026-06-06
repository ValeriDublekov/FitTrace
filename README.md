# FitTrace

## Overview
FitTrace is a high-performance progressive web application (PWA) designed primarily for mobile devices and optimized for desktop environments, empowering gym enthusiasts to track their workouts on the fly. Users can construct flexible workout sessions by selecting exercises dynamically, logging detailed set metrics tailored to specific load types (weights/reps, levels/reps, or cardio), utilizing a non-intrusive automatic rest timer, and monitoring historical progress with elegant data visualizations.

Built with an offline-first philosophy, FitTrace implements local database caching to ensure smooth operation in the low-connectivity or offline environment of a fitness club or gym.

## Stack
- **Frontend Framework:** React 19 + TypeScript
- **Bundler & Build Tool:** Vite
- **Styling:** Tailwind CSS (v4)
- **Database / Auth / Storage:** Firebase (Cloud Firestore with local offline persistence, Firebase Authentication, and Cloud Storage for exercise thumbnails)
- **Data Visualizations:** Recharts for progressive liftoff and load charting
- **Progressive Web App (PWA):** `vite-plugin-pwa` for robust service worker asset caching

## Local Development
To run FitTrace in your local development environment:

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Configure Firebase Application Connection:**
   FitTrace expects its Firebase configurations to be present in `firebase-applet-config.json` at the project root. Create or update `firebase-applet-config.json` with your Firebase project credentials:

   ```json
   {
     "apiKey": "your-api-key",
     "authDomain": "your-project-id.firebaseapp.com",
     "projectId": "your-project-id",
     "storageBucket": "your-project-id.appspot.com",
     "messagingSenderId": "your-sender-id",
     "appId": "your-app-id",
     "measurementId": "your-measurement-id"
   }
   ```

3. **Start the Express Development Server:**

   ```bash
   npm run dev
   ```

   This executes the custom development server defined in `server.ts` (using `tsx`), integrating Vite as middleware.

## Build

To package and compile the application for production deployment:

```bash
npm run build
```

This processes the sound assets, compiles the React TypeScript client application, and generates deployable production assets inside the `/dist` directory.

## Firebase Requirements

FitTrace relies on the following Firebase services:

- **Firebase Authentication:** Managed logins via Google OAuth (`GoogleAuthProvider`).
- **Cloud Firestore:** Dedicated data schemas for global and personal logs (`admins`, `exercises`, `workouts`).
- **Cloud Storage:** Admin exercise thumbnail storage bucket access.
- **Rules Deployment:** Deploy standard secure routing and collection permissions using `firestore.rules`.

## Architecture Pointers

For a deep dive into schemas, structures, and product flows, see the following references:

- **[ARCHITECTURE.md](ARCHITECTURE.md):** Directory mapping, detailed collection schemas, offline caching, and routing rules.
- **[PRD.md](PRD.md):** Target personas, core logging requirements, load types, and feature mapping.

## Server & PWA Hosting Assumptions

- **Express Dev Server (`server.ts`):** Development starts through the Express server, hosting sound manifest helpers under `/api/sounds` and booting the Vite server in middleware mode. In production environments, it is configured statically to host compiled code from `/dist` with SPA fallbacks.
- **Routing & Base Path Assumptions:** Uses a client-side `HashRouter` (in `/src/App.tsx`) to guarantee completely standalone routing across different environments and static CDNs without server-side routing custom integrations.
- **PWA Service Workers:** Configured via `vite-plugin-pwa` to cache resources dynamically during boot, allowing instant loading times and absolute offline access in network-dead zones at the gym.
