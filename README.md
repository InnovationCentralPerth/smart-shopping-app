# Smart Shopping App

An AI-assisted supermarket shopping simulator with in-store navigation. Built around a Coles supermarket layout for CiscoLive 2026 Melbourne MasterTech Hackathon, it lets you build a trolley using natural language or a photo of a handwritten list, then hands off to an in-store pathfinding navigator to guide you through the aisles.

## Architecture

Three services work together:

| Service | Port | Stack |
|---|---|---|
| Frontend | 5174 | React 19, Vite, Tailwind CSS |
| Backend API | 8000 | Python, FastAPI, OpenAI GPT-4o |
| Store Navigator | 8001 | Python, FastAPI, vanilla JS/HTML |

```
Browser (port 5174)
    └── Backend API (port 8000)         ← AI recommendations, image OCR
    └── Store Navigator (port 8001)     ← A* pathfinding, in-store routing
```

## Features

- **AI product recommendations** — describe items or meals in plain language; GPT-4o matches them to the product catalogue with budget/quality/inspiration preferences
- **Handwritten list scanning** — photograph a shopping list and GPT-4o vision extracts the items automatically
- **Dietary filters** — free-text field (e.g. "gluten-free", "dairy-free") constrains all recommendations
- **Trolley management** — add/remove items, see live pricing
- **In-store navigation** — "Find your items in store" passes your trolley to the navigator, which calculates an optimised A\* route through the entire trip (not just item-to-item), sticking to walkable aisles

## Requirements

- Node.js 18+
- Python 3.11+
- OpenAI API key

## Setup

### 1. Backend API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
OPENAI_API_KEY=sk-...
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. Store Navigator

Uses the backend's virtual environment — no separate install needed.

## Running

### With systemd (recommended for server deployment)

Copy service files and install:

```bash
sudo cp brannigan-updates/smart-shop-backend.service /etc/systemd/system/
sudo cp brannigan-updates/smart-shop-frontend.service /etc/systemd/system/
sudo cp brannigan-updates/smart-shop-navigating.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable smart-shop-backend smart-shop-frontend smart-shop-navigating
sudo systemctl start smart-shop-backend smart-shop-frontend smart-shop-navigating
```

Or use the provided installer:

```bash
cd brannigan-updates && chmod +x install-services.sh && ./install-services.sh
```

Check status:
```bash
sudo systemctl status smart-shop-backend smart-shop-frontend smart-shop-navigating
```

View logs:
```bash
sudo journalctl -u smart-shop-backend -f
sudo journalctl -u smart-shop-frontend -f
sudo journalctl -u smart-shop-navigating -f
```

### Manual (development)

```bash
# Terminal 1 — backend API
cd backend && source .venv/bin/activate && python main.py

# Terminal 2 — store navigator
cd smart-navigating && source ../backend/.venv/bin/activate && python store_locator.py

# Terminal 3 — frontend
cd frontend && npm run dev
```

## Configuration

If deploying to a new host, update the hostname in two files:

**`frontend/src/App.jsx`** — top of file:
```js
const API_BASE_URL = 'http://<your-host>:8000';
```

And the navigator redirect (search for `8001`):
```js
window.location.href = `http://<your-host>:8001/?items=...`
```

**`smart-navigating/app.js`** — top of file:
```js
const API_URL = 'http://<your-host>:8001';
```

**`backend/main.py`** — CORS origins list:
```python
allow_origins=["http://<your-host>:5174", ...]
```

## Project Structure

```
smart-shop/
├── frontend/               # React app (Vite)
│   └── src/App.jsx         # Main UI — trolley, recommendations, image scan
├── backend/
│   ├── main.py             # FastAPI — /api/recommend, /api/products, /api/extract-text
│   ├── products.json       # Product catalogue
│   └── requirements.txt
├── smart-navigating/
│   ├── store_locator.py    # FastAPI — A* pathfinding API + serves static frontend
│   ├── index.html          # In-store navigator UI
│   ├── app.js
│   ├── style.css
│   └── items.json          # Store item-to-aisle mapping
└── brannigan-updates/      # systemd service files and install script
```

## Authors

- Smart Shop frontend & backend — Brian Ngo @baongo97 https://github.com/baongo97
- Store navigator & A\* pathfinding — Basil Toufexis
