#!/bin/bash

echo "🚀 Visual ChangeNet - Netlify Deployment Script"
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

echo "🔐 Logging in to Netlify..."
netlify login

echo ""
echo "📤 Deploying to Netlify..."
echo ""

netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your site should now be live. Check the URL above."
