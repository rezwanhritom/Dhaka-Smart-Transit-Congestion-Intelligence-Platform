# Module 3 Member 1 Functional Requirement 3

## AI model training and configuration management system (complete master note)

This document is the full, viva-ready explanation of **Module 3 -> Member 1 -> Functional Requirement 3**:

> Authorized ML/DevOps staff can retrain ETA/congestion models on new data, deploy new versions, roll back models, and configure feature flags for experiments.

---

## 1) What this feature does

The system provides:
- offline retraining scripts for ETA/crowding/congestion/incidents,
- model registry and lifecycle APIs (register, activate, archive, rollback),
- runtime model manifest for active serving metadata,
- feature-flag driven experiment routing hooks,
- audit log traceability for model/flag actions.

---

## 2) End-to-end flow

1. ML engineer retrains models using Python scripts and artifacts in `ai-services/models` + `ai-services/encoders`.
2. DevOps registers model versions through `/api/ml/models` (with metadata).
3. Activation/rollback updates DB status and writes runtime manifest.
4. AI service startup reads `active_model_manifest.json` and loads active artifact path for congestion serving.
5. Planner reads experiment flag (`traffic_prediction_mode`) and forwards variant tag to AI traffic endpoint.

---

## 3) Key files and responsibilities

### Training
- `ai-services/training/train_eta.py`
- `ai-services/training/train_crowd.py`
- `ai-services/training/train_congestion.py`
- `ai-services/training/train_incidents.py`
- `ai-services/training/augment_return_training_data.py`

### Registry and lifecycle
- `backend/models/ModelRegistry.js`
  - includes `modelKey`, `version`, `status`, `metrics`, `artifactPath`, `checksum`.
- `backend/controllers/mlOpsController.js`
  - register/activate/archive/rollback,
  - runtime manifest writer,
  - runtime manifest read endpoint.
- `backend/routes/mlOpsRoutes.js`
  - `/api/ml/*` endpoints including `/runtime-manifest`.
- `backend/models/FeatureFlag.js`
- `backend/models/AuditLog.js`

### Runtime artifact selection
- `ai-services/data/active_model_manifest.json`
  - active artifact pointer(s) and timestamp.
- `ai-services/app/main.py`
  - reads active manifest during startup and configures congestion artifact loading.
- `ai-services/app/api/congestion.py`
  - supports runtime artifact configuration and serving.

### Experiment routing
- `backend/services/plannerService.js`
  - reads `traffic_prediction_mode` flag and sends model variant to AI.
- `ai-services/app/api/congestion.py`
  - returns `model_variant` in planner traffic response.

---

## 4) API behavior highlights

- `POST /api/ml/models`
  - supports version registration with `artifactPath` and `checksum`.
- `POST /api/ml/models/:id/activate`
  - marks active and updates runtime manifest.
- `POST /api/ml/models/:id/rollback`
  - activates previous version and updates runtime manifest.
- `GET /api/ml/runtime-manifest`
  - returns currently active model manifest data.
- `PUT /api/ml/flags/:key`
  - updates experiment flags.

---

## 5) Completion statement

For project/demo scope, FR-3 is implemented end-to-end:
- training/retraining pipeline is present,
- model lifecycle and rollback APIs are functional,
- active model runtime metadata is exposed and persisted,
- experiment flag path is wired from backend planner to AI service,
- auditability exists for critical MLOps actions.
