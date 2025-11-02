# Visual ChangeNet - Netlify Deployment

## Quick Deploy to Netlify

### Option 1: One-Click Deploy (Recommended)

1. Push this folder to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Netlify will auto-detect the configuration from `netlify.toml`
6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
cd changenet-deploy

# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy with a new site
netlify deploy --prod

# Follow the prompts to create a new site
```

### Option 3: Drag and Drop (Easiest)

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the entire `changenet-deploy` folder
3. Wait for deployment to complete

**Note:** For Netlify Functions to work, you need to deploy via GitHub or CLI, not drag-and-drop.

## Project Structure

```
changenet-deploy/
├── public/
│   └── index.html          # Frontend application
├── netlify/
│   └── functions/
│       └── compare.js      # Serverless function for API calls
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## Environment Variables

The NVIDIA API key is hardcoded in the function. For production, you should:

1. Go to your Netlify site settings
2. Navigate to "Environment variables"
3. Add your NVIDIA API key
4. Update `netlify/functions/compare.js` to use: `process.env.NVIDIA_API_KEY`

## Local Testing

To test locally before deploying:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Install dependencies
npm install

# Start local dev server
netlify dev
```

This will run the site with Netlify Functions at `http://localhost:8888`

## Features

- Drag & drop image upload
- Real-time preview
- NVIDIA AI-powered change detection
- Beautiful, responsive UI
- Serverless architecture
- No backend server needed

## Tech Stack

- Frontend: HTML, Tailwind CSS, Vanilla JavaScript
- Backend: Netlify Functions (Node.js)
- AI: NVIDIA Visual ChangeNet API
- Hosting: Netlify

## Support

For issues or questions, refer to:
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [NVIDIA AI API Documentation](https://docs.api.nvidia.com/)
