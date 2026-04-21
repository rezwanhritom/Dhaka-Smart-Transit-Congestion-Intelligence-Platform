/**
 * Commute planner: validates input and delegates to plannerService.
 */

import axios from 'axios';
import { getAllStops, planCommute } from '../services/plannerService.js';

function parseHour(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 23) {
    return { ok: false, error: 'hour must be an integer between 0 and 23' };
  }
  return { ok: true, hour: n };
}

function parseTimeString(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return { ok: false, error: 'time must be in HH:MM format' };
  }
  const s = value.trim();
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(s);
  if (!m) return { ok: false, error: 'time must be in HH:MM format' };
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  return { ok: true, hour, minute, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
}

function parseTimeContext(hourRaw, timeRaw) {
  if (timeRaw !== undefined && timeRaw !== null && String(timeRaw).trim() !== '') {
    const parsed = parseTimeString(timeRaw);
    if (!parsed.ok) return parsed;
    return { ok: true, hour: parsed.hour, minute: parsed.minute, time: parsed.time };
  }
  if (hourRaw === undefined || hourRaw === null || hourRaw === '') {
    return { ok: false, error: 'Provide either `time` (HH:MM) or `hour` (0-23).' };
  }
  const hourParsed = parseHour(hourRaw);
  if (!hourParsed.ok) return hourParsed;
  return {
    ok: true,
    hour: hourParsed.hour,
    minute: 0,
    time: `${String(hourParsed.hour).padStart(2, '0')}:00`,
  };
}

function parsePreference(value) {
  const s = String(value ?? '')
    .trim()
    .toLowerCase();
  if (s === 'less_crowded') return 'less_crowded';
  if (s === 'fewer_transfers') return 'fewer_transfers';
  return 'fastest';
}

export const getStops = async (req, res, next) => {
  try {
    const data = await getAllStops();
    return res.json({ data });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(500).json({
        message: 'Transit routes dataset could not be read',
      });
    }
    next(error);
  }
};

export const postCommute = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      hour: hourRaw,
      time: timeRaw,
      time_type: timeTypeRaw,
      preference: preferenceRaw,
    } = req.body ?? {};

    if (typeof origin !== 'string' || !origin.trim()) {
      return res.status(400).json({ message: 'origin is required (non-empty string)' });
    }
    if (typeof destination !== 'string' || !destination.trim()) {
      return res
        .status(400)
        .json({ message: 'destination is required (non-empty string)' });
    }

    const timeContext = parseTimeContext(hourRaw, timeRaw);
    if (!timeContext.ok) {
      return res.status(400).json({ message: timeContext.error });
    }

    const tt =
      typeof timeTypeRaw === 'string' && timeTypeRaw.trim().toLowerCase() === 'arrive_by'
        ? 'arrive_by'
        : 'leave_after';

    const data = await planCommute({
      origin: origin.trim(),
      destination: destination.trim(),
      hour: timeContext.hour,
      minute: timeContext.minute,
      requested_time: timeContext.time,
      time_type: tt,
      preference: parsePreference(preferenceRaw),
    });

    return res.json({ data });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(500).json({
        message: 'Transit routes dataset could not be read',
      });
    }
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail ?? error.response?.data;
      return res.status(502).json({
        message: error.response
          ? 'AI service returned an error'
          : 'AI service unreachable',
        status: status ?? null,
        detail: detail ?? error.message,
      });
    }
    if (error.statusCode === 503) {
      return res.status(503).json({ message: error.message });
    }
    next(error);
  }
};
