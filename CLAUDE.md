# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a full-stack Pokemon stats viewer with two parts:

- **Backend** (`app.py`): Flask REST API that loads Pokemon data from `pokemon_data.pkl` (a pandas DataFrame) and serves it via JSON endpoints.
- **Frontend** (`pokemon-dashboard/`): React app (Create React App) with two views — a single Pokemon dashboard and a side-by-side comparison view.

The frontend hardcodes `http://localhost:5000/api` as the API base URL in both component files.

### Data Model

The pickle file contains a pandas DataFrame (`df_evolve`) with columns including:
- `Name`, `Pokedex Number`, `Type 1`, `Type 2`, `Image`
- `HP`, `Attack`, `Defense`, `Special Attack`, `Special Defense`, `Speed`
- `{Stat} Percentile` columns for each of the six stats (e.g., `HP Percentile`)
- `Evolve From`, `Evolve To`, `Base Evolution`, `Final Evolution`
- `Weak to {Type}` boolean columns for type weaknesses

### API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/pokemon` | All pokemon names (sorted) |
| GET | `/api/pokemon/<name>` | Full data for one pokemon |
| GET | `/api/pokemon/<name>/stats` | Stats + percentiles formatted for radar chart |
| POST | `/api/pokemon/compare` | Compare two pokemon; body: `{pokemon1, pokemon2}` |
| GET | `/api/pokemon/random` | Random pokemon name |

## Development Commands

### Backend (Flask)
```bash
# Activate virtual environment first
source .venv/Scripts/activate  # Windows bash

# Run the Flask server (port 5000)
python app.py
```

### Frontend (React)
```bash
cd pokemon-dashboard

# Install dependencies
npm install

# Start dev server (port 3000)
npm start

# Run tests
npm test

# Run a single test file
npm test -- --testPathPattern=ComponentName

# Build for production
npm run build
```

Both servers must run simultaneously for the app to function. Flask on port 5000, React on port 3000.
