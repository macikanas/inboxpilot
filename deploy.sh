#!/bin/bash
# InboxPilot — Full Deployment Script
# Deploys to Vercel with Neon PostgreSQL (free tier)

set -e

echo "🚀 InboxPilot Deployment"
echo "========================"
echo ""

# ─── Pre-checks ──────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo "❌ Node.js required. Install: https://nodejs.org"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git required. Install: https://git-scm.com"
    exit 1
fi

# Install Vercel CLI if needed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ All tools ready"
echo ""

# ─── Step 1: Generate secrets ────────────────────────────────
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "🔐 Generated secrets"

# ─── Step 2: Database setup ──────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 1: Set up a PostgreSQL database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Recommended: Neon (free tier)"
echo "  1. Go to https://neon.tech"
echo "  2. Create a free account"
echo "  3. Create a new project called 'inboxpilot'"
echo "  4. Copy the connection string"
echo ""
read -p "Paste your DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Database URL required."
    exit 1
fi

# ─── Step 3: API keys ────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 STEP 2: AI Provider API Keys"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Enter at least one API key:"
echo ""
read -p "Anthropic API key (or press Enter to skip): " ANTHROPIC_API_KEY
read -p "OpenAI API key (or press Enter to skip): " OPENAI_API_KEY

if [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ At least one AI API key is required."
    exit 1
fi

# ─── Step 4: Create .env for Prisma push ─────────────────────
cat > .env << EOF
DATABASE_URL="${DATABASE_URL}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"
OPENAI_API_KEY="${OPENAI_API_KEY}"
EOF

# ─── Step 5: Install & push database ─────────────────────────
echo ""
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "🗄️  Pushing database schema..."
npx prisma generate
npx prisma db push

echo "✅ Database ready"

# ─── Step 6: Init git if needed ──────────────────────────────
if [ ! -d .git ]; then
    git init
    echo "node_modules/" > .gitignore
    echo ".env" >> .gitignore
    echo ".next/" >> .gitignore
    git add -A
    git commit -m "Initial InboxPilot commit"
    echo "✅ Git initialized"
fi

# ─── Step 7: Deploy to Vercel ────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 STEP 3: Deploying to Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will open Vercel login if needed..."
echo ""

# Set environment variables and deploy
vercel env add DATABASE_URL production <<< "$DATABASE_URL" 2>/dev/null || true
vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET" 2>/dev/null || true
vercel env add ENCRYPTION_KEY production <<< "$ENCRYPTION_KEY" 2>/dev/null || true

if [ -n "$ANTHROPIC_API_KEY" ]; then
    vercel env add ANTHROPIC_API_KEY production <<< "$ANTHROPIC_API_KEY" 2>/dev/null || true
fi
if [ -n "$OPENAI_API_KEY" ]; then
    vercel env add OPENAI_API_KEY production <<< "$OPENAI_API_KEY" 2>/dev/null || true
fi

# Deploy to production
vercel --prod

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Open the URL shown above"
echo "  2. Create your account"
echo "  3. Connect your email in Settings"
echo "  4. Start chatting with your inbox!"
echo ""
echo "⚠️  IMPORTANT: Go to Vercel dashboard → Settings → Environment Variables"
echo "   and add NEXTAUTH_URL = your-deployed-url (e.g. https://inboxpilot.vercel.app)"
echo ""
