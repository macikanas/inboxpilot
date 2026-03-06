#!/bin/bash
# InboxPilot — Local Development Setup Script

set -e

echo "🚀 InboxPilot Setup"
echo "==================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Install from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env

    # Generate secrets
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)

    # Replace placeholders
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|generate-a-random-secret-here|$NEXTAUTH_SECRET|" .env
        sed -i '' "s|generate-64-hex-chars-here|$ENCRYPTION_KEY|" .env
    else
        sed -i "s|generate-a-random-secret-here|$NEXTAUTH_SECRET|" .env
        sed -i "s|generate-64-hex-chars-here|$ENCRYPTION_KEY|" .env
    fi

    echo "✅ .env created with generated secrets"
    echo ""
    echo "⚠️  You still need to set these in .env:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - ANTHROPIC_API_KEY and/or OPENAI_API_KEY"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Initialize Prisma
echo "🗄️  Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your database URL and API keys"
echo "  2. Run: npx prisma db push    (creates database tables)"
echo "  3. Run: npm run dev            (starts dev server at http://localhost:3000)"
echo ""
echo "Then:"
echo "  1. Open http://localhost:3000"
echo "  2. Create an account"
echo "  3. Connect your email in Settings"
echo "  4. Start chatting!"
