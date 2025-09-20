# Manual Deployment Guide

This guide will walk you through manually deploying your Recurring Scheduler application using **Vercel** for the frontend and **Render** for the backend.

## Prerequisites

- GitHub account with your code repository
- Vercel account (free tier available)
- Render account (free tier available)
- PostgreSQL database (we'll use Neon.tech free tier)
- Clerk account for authentication (free tier available)

## Part 1: Authentication Setup (Clerk)

1. **Create a Clerk Application:**
   - Go to [Clerk.com](https://clerk.com) and sign up
   - Create a new application
   - Choose your preferred sign-in methods (email, social logins, etc.)
   - Copy your **Publishable Key** and **Secret Key** from the dashboard

## Part 2: Database Setup (Neon.tech)

## Part 2: Database Setup (Neon.tech)

1. **Create a Neon Database:**
   - Go to [Neon.tech](https://neon.tech) and sign up
   - Create a new project
   - Copy the connection string (it looks like: `postgresql://username:password@host/database?sslmode=require`)

## Part 3: Backend Deployment (Render)

### Step 1: Prepare your repository
Make sure your code is pushed to GitHub with the latest changes.

### Step 2: Deploy on Render

1. **Go to Render Dashboard:**
   - Visit [render.com](https://render.com) and sign in
   - Click "New +" and select "Web Service"

2. **Connect Repository:**
   - Connect your GitHub account
   - Select your `recurring-scheduler` repository
   - Choose the `main` branch

3. **Configure the Service:**
   - **Name:** `recurring-scheduler-backend`
   - **Environment:** `Node`
   - **Region:** Choose the closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`

4. **Environment Variables:**
   Add these environment variables in the Render dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=<your_neon_database_connection_string>
   PORT=10000
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
   
   **Note:** You'll update the `FRONTEND_URL` after deploying the frontend

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete
   - Copy the backend URL (e.g., `https://recurring-scheduler-backend.onrender.com`)

### Step 3: Run Database Migrations

1. **In Render Dashboard:**
   - Go to your service
   - Click on "Shell" tab
   - Run the following commands:
   ```bash
   npm run migrate
   npm run seed
   ```

## Part 4: Frontend Deployment (Vercel)

### Step 1: Deploy on Vercel

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "New Project"

2. **Import Repository:**
   - Select "Import Git Repository"
   - Choose your `recurring-scheduler` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `frontend`
   - **Build and Output Settings:** Leave as default
   - **Install Command:** `npm ci`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. **Environment Variables:**
   Add these environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```
   Replace `your-backend-url` with your actual Render backend URL
   Replace the Clerk keys with your actual keys from Clerk dashboard

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build and deployment to complete
   - Copy the frontend URL (e.g., `https://your-app-name.vercel.app`)

### Step 2: Update Backend CORS

1. **Go back to Render:**
   - Open your backend service
   - Go to "Environment" tab
   - Update the `FRONTEND_URL` variable with your actual Vercel URL
   - Save changes (this will redeploy your backend)

## Part 5: Configure Clerk Domain Settings

After deploying to Vercel:

1. **Update Clerk Settings:**
   - Go to your Clerk dashboard
   - Navigate to "Domains" in the sidebar
   - Add your Vercel domain (e.g., `https://your-app-name.vercel.app`)
   - This allows Clerk to work with your deployed frontend

## Part 6: Verification

### Test Your Deployment

1. **Visit your frontend URL**
2. **Check that the application loads**
3. **Test creating and managing slots**
4. **Verify the calendar functionality works**

### Common URLs to Check:
- Frontend: `https://your-app-name.vercel.app`
- Backend Health: `https://your-backend-url.onrender.com/health`
- Backend API: `https://your-backend-url.onrender.com/api/slots`

## Troubleshooting

### Backend Issues:

#### TypeScript Build Errors:
If you encounter TypeScript errors during build like "Could not find a declaration file for module 'express'":
- Ensure all `@types/*` packages are in `dependencies` (not `devDependencies`) in `backend/package.json`
- This is because Render needs these types during the production build process

#### Other Backend Issues:
- Check Render logs in the "Logs" tab
- Ensure database migrations ran successfully
- Verify environment variables are set correctly

### Frontend Issues:
- Check Vercel function logs in the dashboard
- Verify `NEXT_PUBLIC_API_URL` points to your backend
- Check browser console for API errors

### Database Issues:
- Verify Neon database connection string
- Check if migrations completed successfully
- Ensure database allows SSL connections

## Environment Variables Summary

### Backend (Render):
```env
NODE_ENV=production
DATABASE_URL=<neon_connection_string>
PORT=10000
FRONTEND_URL=https://your-app-name.vercel.app
```

### Frontend (Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Post-Deployment Notes

1. **Custom Domains:** You can add custom domains in both Vercel and Render dashboards
2. **SSL:** Both platforms provide SSL certificates automatically
3. **Monitoring:** Both platforms provide basic monitoring and logs
4. **Scaling:** Free tiers have limitations; upgrade as needed

## Maintenance

- **Database:** Neon free tier has usage limits
- **Backend:** Render free tier spins down after inactivity
- **Frontend:** Vercel free tier has bandwidth and build limits
- **Updates:** Push to your GitHub repository to trigger automatic redeployments

Your application should now be live and accessible to users worldwide!