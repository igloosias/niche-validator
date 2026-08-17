#!/bin/bash
# ===========================================
# NicheValidator Local Setup Script
# Runs both Frontend + Backend locally
# ===========================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         NicheValidator Local Setup                        ║"
echo "║         Frontend + Backend + All Scrapers               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# ===========================================
# STEP 1: Check Prerequisites
# ===========================================
echo -e "${YELLOW}[1/5] Checking prerequisites...${NC}"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo "✓ Python $PYTHON_VERSION found"
else
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.10+${NC}"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo "✓ Node.js $NODE_VERSION found"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    echo "✓ pnpm found"
else
    echo "⚠ pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

# ===========================================
# STEP 2: Setup Python Backend
# ===========================================
echo ""
echo -e "${YELLOW}[2/5] Setting up Python Backend...${NC}"

cd server

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python packages (this may take a few minutes)..."
pip install --upgrade pip > /dev/null 2>&1
pip install fastapi uvicorn pytrends httpx aiohttp pandas numpy beautifulsoup4 lxml slowapi > /dev/null 2>&1

# Install optional packages (with warnings suppressed)
pip install scrapegraphai agent-reach crawl4ai playwright 2>/dev/null || echo "⚠ Some optional packages failed to install - using fallback modes"

# Install Playwright browsers
echo "Installing Playwright browsers..."
playwright install chromium 2>/dev/null || echo "⚠ Playwright setup skipped"

# Go back to project root
cd ..

echo -e "${GREEN}✓ Python backend ready${NC}"

# ===========================================
# STEP 3: Setup Frontend
# ===========================================
echo ""
echo -e "${YELLOW}[3/5] Setting up Frontend...${NC}"

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install > /dev/null 2>&1
fi

# Update .env to point to local backend
echo "Configuring frontend to use local backend..."
cat > .env.local << 'EOF'
VITE_FIRECRAWL_API_KEY=fc-7158887092ea4f7d90604b07f40e6184
VITE_SCRAPER_SERVER_URL=http://localhost:8000
EOF

echo -e "${GREEN}✓ Frontend ready${NC}"

# ===========================================
# STEP 4: Build Frontend
# ===========================================
echo ""
echo -e "${YELLOW}[4/5] Building Frontend...${NC}"

pnpm build > /dev/null 2>&1
echo -e "${GREEN}✓ Frontend built${NC}"

# ===========================================
# STEP 5: Start Services
# ===========================================
echo ""
echo -e "${YELLOW}[5/5] Starting Services...${NC}"
echo ""

# Start backend in background
echo "Starting Backend Server (port 8000)..."
cd server
source venv/bin/activate
python scraper_server.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend running at http://localhost:8000${NC}"
else
    echo -e "${YELLOW}⚠ Backend may need a moment to start...${NC}"
fi

# Start frontend preview server
echo "Starting Frontend Preview (port 4173)..."
pnpm preview --port 4173 --host &
FRONTEND_PID=$!

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETE!                         ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║  🌐 Frontend:  http://localhost:4173                     ║"
echo "║  🔧 Backend:   http://localhost:8000                     ║"
echo "║                                                           ║"
echo "║  Press Ctrl+C to stop all services                      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Handle shutdown
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✓ Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
echo "Services running... Press Ctrl+C to stop."
wait
