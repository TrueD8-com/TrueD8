# Vercel Deployment Setup Guide

## 🎯 Production Branch Configuration

### Method 1: Vercel Dashboard (Recommended)

Since the UI might vary, try these locations:

1. **New Vercel UI (2024+)**:
   - Go to your project on Vercel
   - Click **Settings** (top navigation)
   - Click **Git** (left sidebar)
   - Scroll to find **"Production Branch"** or **"Git Configuration"**
   - Set to `main` or your desired branch

2. **Alternative Path**:
   - Project → **Settings** → **General**
   - Look for **"Git Repository"** section
   - Find **"Production Branch"** setting

3. **If you still can't find it**:
   - It might be under **Domains** section
   - The domain marked as "Production" shows which branch is production
   - You can reassign branches there

### Method 2: Vercel CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd /home/ali/BlockchainProjects/ETHGlobal2025/TrueD8
vercel link

# Set production branch (this sets it via config)
# The vercel.json files I created will handle this
```

### Method 3: Project Settings JSON

The `vercel.json` files I created include:

```json
"git": {
  "deploymentEnabled": {
    "main": true,
    "production": true,
    "master": true
  }
}
```

This tells Vercel which branches should auto-deploy to production.

## 📁 Files Created

### 1. Root Level: `/TrueD8/vercel.json`
- Configures monorepo deployment
- Routes `/api/*` to backend
- Routes everything else to frontend
- Sets production branches

### 2. Frontend: `/TrueD8/frontend/vercel.json`
- Next.js specific configuration
- Build commands
- Environment variables setup
- Security headers

### 3. Backend: `/TrueD8/backend/vercel.json`
- Node.js/TypeScript configuration
- Routes all traffic to Express app
- ESM support via tsx

## 🚀 How It Works Now

### Automatic Production Deployment:

1. **When you push to `main` branch**:
   - Vercel detects the push
   - Reads `vercel.json` configuration
   - Deploys to **Production** (not preview)
   - No manual promotion needed ✅

2. **When you push to other branches** (e.g., `dev`, `feature/*`):
   - Vercel creates a **Preview** deployment
   - Gets a unique URL
   - Does NOT go to production automatically

### Manual Override:

If you still want to manually promote:
1. Go to Vercel Dashboard → Deployments
2. Find your preview deployment
3. Click **"..."** menu
4. Click **"Promote to Production"**

## 🔧 Testing Your Setup

1. **Test Backend ESM**:
```bash
cd backend
npm start
# Should start without "ERR_REQUIRE_ESM" error
```

2. **Test Frontend Build**:
```bash
cd frontend
npm run build
# Should build successfully
```

3. **Deploy to Vercel**:
```bash
# Push to main branch
git add .
git commit -m "Configure Vercel auto-deployment"
git push origin main

# Or use Vercel CLI for immediate deployment
vercel --prod
```

## 🎨 Production Branch Scenarios

### Scenario 1: Main Branch as Production
```
main branch → Production (auto) ✅
dev branch  → Preview
feature/*   → Preview
```

### Scenario 2: Production Branch as Production
```
production branch → Production (auto) ✅
main branch       → Preview
dev branch        → Preview
```

## 📝 Environment Variables

Don't forget to set these in Vercel Dashboard:

**Frontend**:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_CHAIN_ID`
- Any other `NEXT_PUBLIC_*` variables

**Backend**:
- `MONGO_DATABASE`
- `PORT`
- All your backend env vars

**How to set**:
1. Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Add variables for Production/Preview/Development

## ✅ Verification Checklist

- [ ] `vercel.json` files exist in root, frontend, and backend
- [ ] Production branch is set to `main` in Vercel dashboard
- [ ] Environment variables are configured in Vercel
- [ ] Backend starts with `npm start` (no ESM errors)
- [ ] Frontend builds with `npm run build`
- [ ] Push to main branch auto-deploys to production

## 🆘 Troubleshooting

### "Can't find Production Branch setting"
- Try the new Vercel UI path: **Settings → Git → Production Branch**
- Or check: **Settings → Domains** to see which branch serves production domain
- The `vercel.json` config should handle this automatically

### "Preview still not auto-promoting"
- Check that your branch name matches the `vercel.json` config
- Verify in **Deployments** tab that it's deploying to the right environment
- Make sure you're pushing to `main` (or your configured production branch)

### "Backend still has ESM errors"
- Verify `"type": "module"` is in `backend/package.json`
- Check that `lodash-es` is installed (not `lodash`)
- Ensure `tsx` is in devDependencies
- Run `npm install` in backend folder

## 🎉 Success Indicators

When everything is working:
1. Push to `main` → Green checkmark on GitHub → Production URL updates
2. Push to other branches → Green checkmark → Preview URL created
3. No manual promotion needed for `main` branch
4. Backend runs without ESM errors
