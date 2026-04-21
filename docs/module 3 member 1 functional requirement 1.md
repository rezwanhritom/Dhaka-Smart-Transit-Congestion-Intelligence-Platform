# Module 3 Member 1 Functional Requirement 1

## Real-time congestion monitoring and prediction system (complete master note)

This document is the full, viva-ready explanation of **Module 3 -> Member 1 -> Functional Requirement 1**:

> The transport authority sees a city map with current congestion and AI-predicted congestion for upcoming time windows, enabling proactive management (e.g., adding buses, altering routes).

---

## 1) What this feature does

The authority dashboard can:
- view segment-level congestion on a city map,
- inspect current congestion state with observed + model context,
- inspect short-horizon forecast windows,
- receive live map updates via server-sent events (SSE),
- use congestion outputs to support proactive operational decisions.

---

## 2) End-to-end flow

1. Frontend `CongestionMap` requests `/api/congestion/map`.
2. Backend controller fetches current congestion from AI service.
3. AI service predicts segment levels and merges observed overrides from `congestion_observed.json`.
4. Backend enriches segment keys with stop coordinates from `stops.json`.
5. Frontend renders colored map lines and corridor hotspot summary.
6. For near-live behavior, frontend subscribes to `/api/congestion/map/stream`.
7. Forecast endpoint provides timeline summaries with confidence metadata.

---

## 3) Key files and responsibilities

### Frontend
- `frontend/src/pages/CongestionMap.jsx`
  - map rendering (Leaflet),
  - current/predicted mode selector,
  - SSE stream subscription,
  - corridor hotlist.

### Backend
- `backend/routes/congestionRoutes.js`
  - exposes `/current`, `/forecast`, `/map`, `/map/stream`, `/predict`.
- `backend/controllers/congestionController.js`
  - map feature assembly and SSE push events.
- `backend/services/aiService.js`
  - AI client wrappers + latency/error timing logs.

### AI service
- `ai-services/app/api/congestion.py`
  - `/current`, `/forecast`, `/predict`, `/planner-traffic`,
  - observed data merge,
  - confidence metadata for forecast.
- `ai-services/app/main.py`
  - congestion router wiring and artifact loading.

### Data inputs
- `ai-services/data/routes.json`
- `ai-services/data/stops.json`
- `ai-services/data/congestion_observed.json`
- `ai-services/data/congestion_train.csv`

---

## 4) API behavior highlights

- `GET /api/congestion/current`
  - returns segment list with `level`, `model_level`, `source`, and observation timestamp.
- `GET /api/congestion/forecast`
  - returns hourly summary with confidence block.
- `GET /api/congestion/map`
  - returns map-ready features (route, from/to stop + coordinates, level/source).
- `GET /api/congestion/map/stream`
  - pushes `congestion_update` events when segment state changes.

---

## 5) Completion statement

For project/demo scope, FR-1 is implemented end-to-end:
- current + predicted congestion API pipeline,
- map visualization with enriched segment features,
- observed-data merge and confidence-enabled forecasting,
- push-style map refresh path (SSE),
- operations-oriented corridor hotspot visibility.
