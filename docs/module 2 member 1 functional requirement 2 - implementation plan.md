# Module 2 Member 1 Functional Requirement 2 - Implementation Plan

## Feature scope (only this FR)

**Functional Requirement:**  
AI-based impact estimation system  
"For high-severity incidents, AI estimates affected routes and likely delay duration and suggests reroutes; the system updates ETAs and alerts commuters automatically."

This plan tracks only this feature. It does not include unrelated user/admin/auth concerns.

---

## Tracking status legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked

---

## MVP status (what is already implemented now)

- `[x]` Impact API exists: `POST /api/incidents/impact`.
- `[x]` Impact model exists in AI service (`/incidents/impact`) with ML + fallback.
- `[x]` Inputs include `category`, `severity`, `affected_routes`, optional `hour`.
- `[x]` Route impact context is computed from incident geo/location before impact call.
- `[x]` Delay + recovery prediction is returned (`delay`, `recovery_time`).
- `[x]` Basic reroute suggestions are returned from unaffected route names.
- `[x]` Out-of-network validation is handled before impact estimation.

---

## Gap to final-product-ready

Current MVP is good for estimation output, but these parts are still missing for full FR completion:

- `[ ]` "High-severity only" execution policy is not strictly enforced in API flow.
- `[ ]` Affected routes are derived mainly by stop/segment proximity; no severity-weighted multi-hop network propagation yet.
- `[ ]` Reroutes are basic exclusions, not scored by expected additional travel burden.
- `[ ]` ETA updates are not yet pushed into planner/live ETA computation pipeline automatically.
- `[ ]` Commuter alert generation/dispatch pipeline is not implemented yet.

---

## Final-product readiness plan

## Phase 1 - Impact decision policy hardening

- `[x]` Enforce policy: impact-estimation mode auto-triggers for `HIGH` severity incidents.
- `[x]` Add policy fallback for medium severity (`opt-in`) without changing high-severity guarantee.
- `[x]` Add policy metadata in response (`trigger_reason`, `policy_applied`).
- `[x]` Add explicit "insufficient context" response code when impact confidence is too low.

**Exit criteria:** High-severity incidents always follow impact-estimation policy deterministically.

---

## Phase 2 - Better affected-route inference

- `[x]` Add route-segment influence scoring (nearest segment + neighboring segments).
- `[x]` Add time-aware spread factor (peak/off-peak propagation differences).
- `[x]` Add incident-type multipliers (e.g., road_blockage > breakdown for spread).
- `[x]` Return ranked affected routes with impact scores (not only list).

**Exit criteria:** Affected route output is ranked, explainable, and context-aware.

---

## Phase 3 - Reroute intelligence upgrade

- `[x]` Replace simple reroute pick with scoring:
  - overlap penalty with impacted segments,
  - expected added delay,
  - route capacity/crowding factor (if available).
- `[x]` Return top-N reroutes with reasons and confidence.
- `[x]` Add deterministic fallback reroutes if AI model is unavailable.

**Exit criteria:** Reroute suggestions are quality-ranked and operationally meaningful.

---

## Phase 4 - Automatic ETA update integration (core logic only)

- `[x]` Integrate active incident impact into planner ETA calculation pipeline.
- `[x]` Apply delay multipliers at segment level for impacted routes.
- `[x]` Expose incident-adjusted ETA in planner response (`eta_base`, `eta_adjusted`, `impact_delta`).
- `[x]` Add cache/versioning for active incidents to avoid stale ETA calculations.

**Exit criteria:** ETA responses automatically reflect live incident impact.

---

## Phase 5 - Commuter alert engine (core backend only)

- `[x]` Build alert event payload from high-severity impact result.
- `[x]` Add targeting rules (affected route subscribers / stop proximity).
- `[x]` Add dedup + cooldown logic to prevent alert spam.
- `[x]` Persist alert events for traceability and replay.

**Exit criteria:** System can generate and manage commuter alerts automatically from impact events.

---

## Suggested implementation order (feature-only)

1. Phase 1 (policy hardening)
2. Phase 2 (affected-route ranking)
3. Phase 3 (reroute intelligence)
4. Phase 4 (ETA integration)
5. Phase 5 (alert engine)

---

## Current known constraints

- Impact training data is currently small (`impact_train.csv`) and should be expanded for stable generalization.
- Recovery/delay predictions are scalar outputs; uncertainty bands are not yet exposed.
- No automated alert dispatch channel is wired in this FR yet.

---

## Change log

- 2026-04-21: Initial FR-2 implementation plan created (MVP status + final-product roadmap).
- 2026-04-21: Implemented impact policy hardening (HIGH-only auto, MEDIUM opt-in), ranked affected routes, scored reroutes, and explicit insufficient-context response.
- 2026-04-21: Integrated active incident impacts into planner ETA responses with `eta_base`, `eta_adjusted`, `impact_delta`, and impact profile version tagging.
- 2026-04-21: Added backend commuter alert engine for high-severity impact results with dedup/cooldown and JSONL alert history persistence.
- 2026-04-21: Completed remaining Phase 2/3 items with time-aware + category-weighted impact scoring and deterministic reroute/impact fallback when AI impact endpoint is unavailable.

