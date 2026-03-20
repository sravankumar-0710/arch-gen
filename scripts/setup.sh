#!/bin/bash
# filepath: scripts/setup.sh
# Purpose: Initialize development environment for ArchGen AI

set -e

echo "================================"
echo "ArchGen AI — Development Setup"
echo "================================"
echo ""

# Check Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create Python virtual environment
echo ""
echo "📦 Setting up Python virtual environment..."
cd backend || exit 1

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate venv and install dependencies
source venv/bin/activate || . venv/Scripts/activate 2>/dev/null || true

echo ""
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed"

# Initialize database
echo ""
echo "🗄️  Initializing database..."
python -c "from database import init_db; init_db(); print('✅ Database initialized')"

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Activate the Python venv: cd backend && source venv/bin/activate"
echo "  2. Start the backend: python -m uvicorn app:app --reload"
echo "  3. In another terminal, start frontend: npm run dev:frontend"
echo "  4. In another terminal, start Electron: npm run dev:electron"
echo ""
echo "Or run all at once: npm run dev"
