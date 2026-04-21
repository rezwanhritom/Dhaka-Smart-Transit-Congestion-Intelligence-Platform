# Module 3 Member 1 Functional Requirement 2

## Route configuration and optimization system (complete master note)

This document is the full, viva-ready explanation of **Module 3 -> Member 1 -> Functional Requirement 2**:

> Admins manage routes, stops, and schedules; the system suggests potential optimizations based on demand distribution and congestion patterns.

---

## 1) What this feature does

The system provides:
- admin route CRUD with audit trail,
- schedule-related route metadata (headway + service window),
- congestion-informed optimization suggestions,
- planner-route consistency improvements via DB-first route loading.

---

## 2) End-to-end flow

1. Admin calls `/api/admin/routes/*` with admin key.
2. Route data is saved/updated in Mongo `TransitRoute`.
3. Planner loads route network from DB first (fallback to static JSON when DB is empty/unavailable).
4. Optimization endpoint fetches congestion snapshot and computes route-wise suggestions.
5. Suggestions include actionable metadata (`expected_impact`, `recommended_window`).

---

## 3) Key files and responsibilities

### Data model
- `backend/models/TransitRoute.js`
  - route identity + stops,
  - `headwayMinutes`,
  - `serviceWindowStart`,
  - `serviceWindowEnd`.

### Backend route management
- `backend/routes/routeAdminRoutes.js`
  - admin route APIs.
- `backend/controllers/routeAdminController.js`
  - create/list/get/update/delete and schedule-field handling.
- `backend/middleware/requireAdminKey.js`
  - protects admin endpoints.

### Optimization logic
- `backend/services/routeOptimizationService.js`
  - computes route-level congestion pressure,
  - returns prioritized suggestions with impact and window.

### Planner consistency
- `backend/services/plannerService.js`
  - DB-first route loading,
  - fallback to `ai-services/data/routes.json`,
  - schedule-aware scoring component via route headway.

---

## 4) API behavior highlights

- `GET /api/admin/routes/optimization-suggestions`
  - returns suggestions like `add_frequency`, `monitor`, `data_hygiene`.
  - includes `priority`, `expected_impact`, and `recommended_window`.
- `POST /api/admin/routes` / `PUT /api/admin/routes/:id`
  - supports schedule fields for optimization readiness.

---

## 5) Completion statement

For project/demo scope, FR-2 is implemented end-to-end:
- configurable routes in admin backend,
- schedule metadata captured in model/controller,
- optimization recommendations generated from congestion state,
- planner moved toward source-of-truth consistency with DB-first route loading.
