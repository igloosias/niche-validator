#!/bin/bash
# NicheValidator Backend Quick Start Script

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         NicheValidator Backend Server Setup              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Python version
echo "📋 Checking Python version..."
python3 --version || { echo "❌ Python not found. Please install Python 3.10+"; exit 1; }

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies (this may take a few minutes)..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
playwright install chromium --with-deps

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  source venv/bin/activate"
echo "  python scraper_server.py"
echo ""
echo "Server will run at: http://localhost:8000"
echo ""

# Try to start the server
read -p "Start the server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 Starting server..."
    python scraper_server.py
fi
