"""
Congestion: current snapshot, forecast, planner traffic index, segment predict.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

import ml_paths

router = APIRouter()

_seg_encoder = None
_congestion_clf = None
_segment_keys: list[str] = []
_observed_cache: dict[str, Any] = {"segments": {}, "updated_at": None}
_runtime_model_path: Path | None = None
_runtime_encoder_path: Path | None = None


def load_congestion_artifacts() -> bool:
    global _seg_encoder, _congestion_clf, _segment_keys
    try:
        encoder_path = _runtime_encoder_path or ml_paths.CONGESTION_SEGMENT_ENCODER
        model_path = _runtime_model_path or ml_paths.CONGESTION_MODEL
        _seg_encoder = joblib.load(encoder_path)
        _congestion_clf = joblib.load(model_path)
    except FileNotFoundError:
        _seg_encoder = None
        _congestion_clf = None
        _segment_keys = []
        return False
    _segment_keys = list(_seg_encoder.classes_)
    return True


def configure_runtime_artifacts(model_path: str | None = None, encoder_path: str | None = None) -> bool:
    global _runtime_model_path, _runtime_encoder_path
    _runtime_model_path = Path(model_path).resolve() if model_path else None
    _runtime_encoder_path = Path(encoder_path).resolve() if encoder_path else None
    return load_congestion_artifacts()


def _routes_path() -> Any:
    return ml_paths.DATA_DIR / "routes.json"


def _observed_path() -> Path:
    return ml_paths.DATA_DIR / "congestion_observed.json"


def _load_observed_cache() -> None:
    global _observed_cache
    p = _observed_path()
    if not p.exists():
        _observed_cache = {"segments": {}, "updated_at": None}
        return
    try:
        raw = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        _observed_cache = {"segments": {}, "updated_at": None}
        return
    rows = raw.get("segments") if isinstance(raw, dict) else []
    out = {}
    if isinstance(rows, list):
        for row in rows:
            key = str((row or {}).get("segment_key", "")).strip()
            lvl = str((row or {}).get("level", "")).strip().upper()
            if not key or lvl not in {"LOW", "MEDIUM", "HIGH"}:
                continue
            out[key] = lvl
    _observed_cache = {
        "segments": out,
        "updated_at": raw.get("updated_at") if isinstance(raw, dict) else None,
    }


def _predict_row(segment_key: str, hour: int, dow: int) -> str:
    if _seg_encoder is None or _congestion_clf is None:
        return "MEDIUM"
    try:
        si = int(_seg_encoder.transform(np.array([segment_key]))[0])
    except ValueError:
        si = 0
    X = np.array([[si, hour, dow]], dtype=np.float64)
    return str(_congestion_clf.predict(X)[0]).upper()


def _model_confidence(level: str) -> float:
    if level == "HIGH":
        return 0.82
    if level == "LOW":
        return 0.78
    return 0.74


class PredictBody(BaseModel):
    segment_keys: list[str] = Field(default_factory=list)
    hour: int = Field(ge=0, le=23, default_factory=lambda: datetime.now().hour % 24)
    dow: int = Field(ge=0, le=6, default_factory=lambda: datetime.now().weekday())


@router.post("/predict")
def predict_congestion(body: PredictBody) -> dict[str, Any]:
    keys = body.segment_keys if body.segment_keys else _segment_keys[: min(40, len(_segment_keys))]
    out = []
    for k in keys:
        lvl = _predict_row(k, body.hour, body.dow)
        out.append({"segment_key": k, "level": lvl})
    return {"hour": body.hour, "dow": body.dow, "predictions": out}


@router.get("/current")
def congestion_current(
    hour: int | None = Query(default=None, ge=0, le=23),
    dow: int | None = Query(default=None, ge=0, le=6),
) -> dict[str, Any]:
    now = datetime.now()
    h = hour if hour is not None else now.hour
    d = dow if dow is not None else now.weekday()
    keys = _segment_keys if _segment_keys else []
    if not keys:
        raw = json.loads(_routes_path().read_text(encoding="utf-8"))
        for r in raw:
            name = r.get("name", "")
            stops = r.get("stops") or []
            for i in range(len(stops) - 1):
                a = str(stops[i]).strip()
                b = str(stops[i + 1]).strip()
                keys.append(f"{name}|{a}->{b}")
    _load_observed_cache()
    observed = _observed_cache.get("segments", {})
    segments = []
    for k in keys[:80]:
        model_level = _predict_row(k, h, d)
        observed_level = observed.get(k)
        final_level = observed_level or model_level
        source = "observed+model" if observed_level else "model"
        segments.append(
            {
                "segment_key": k,
                "level": final_level,
                "model_level": model_level,
                "source": source,
            }
        )
    return {
        "hour": h,
        "dow": d,
        "segments": segments,
        "observed_updated_at": _observed_cache.get("updated_at"),
    }


@router.get("/forecast")
def congestion_forecast(
    start_hour: int = Query(default=0, ge=0, le=23),
    steps: int = Query(default=6, ge=1, le=24),
    dow: int | None = Query(default=None, ge=0, le=6),
) -> dict[str, Any]:
    d = dow if dow is not None else datetime.now().weekday()
    timeline = []
    for t in range(steps):
        h = (start_hour + t) % 24
        keys = _segment_keys[:30] if _segment_keys else []
        levels = [_predict_row(k, h, d) for k in keys]
        high = sum(1 for x in levels if x == "HIGH")
        med = sum(1 for x in levels if x == "MEDIUM")
        low = sum(1 for x in levels if x == "LOW")
        timeline.append(
            {
                "hour": h,
                "summary": {"HIGH": high, "MEDIUM": med, "LOW": low},
                "confidence": {
                    "HIGH": _model_confidence("HIGH"),
                    "MEDIUM": _model_confidence("MEDIUM"),
                    "LOW": _model_confidence("LOW"),
                },
            }
        )
    return {"dow": d, "timeline": timeline}


@router.post("/planner-traffic")
def planner_traffic(payload: dict[str, Any]) -> dict[str, Any]:
    hour = int(payload.get("hour", datetime.now().hour) or 0)
    hour = max(0, min(23, hour))
    dow = datetime.now().weekday()
    keys = _segment_keys if _segment_keys else []
    model_variant = str(payload.get("model_variant", "baseline")).strip() or "baseline"
    if not keys:
        return {"traffic_level": "MEDIUM", "sample_size": 0, "model_variant": model_variant}
    sample = keys[: min(60, len(keys))]
    levels = [_predict_row(k, hour, dow) for k in sample]
    high = sum(1 for x in levels if x == "HIGH")
    med = sum(1 for x in levels if x == "MEDIUM")
    low = sum(1 for x in levels if x == "LOW")
    n = len(levels)
    if high / n >= 0.35:
        tl = "HIGH"
    elif (high + med) / n >= 0.45:
        tl = "MEDIUM"
    else:
        tl = "LOW"
    return {
        "traffic_level": tl,
        "sample_size": n,
        "counts": {"HIGH": high, "MEDIUM": med, "LOW": low},
        "model_variant": model_variant,
    }
