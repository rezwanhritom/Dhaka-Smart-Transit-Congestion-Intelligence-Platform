import axios from 'axios';
import { classifyIncident as classifyIncidentWithAi, getImpact } from '../services/aiService.js';
import {
  findAffectedRouteNames,
  loadRoutesDataset,
  pickReroutes,
} from '../services/incidentImpactService.js';

function assignAuthority(severityRaw) {
  const severity = String(severityRaw ?? '').toUpperCase();
  if (severity === 'HIGH') {
    return 'Emergency Response Unit';
  }
  if (severity === 'MEDIUM') {
    return 'Traffic Control';
  }
  return 'Monitoring Team';
}

export const classifyIncident = async (req, res, next) => {
  try {
    const { description, location } = req.body ?? {};

    if (typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'description is required (non-empty string)' });
    }
    if (typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({ message: 'location is required (non-empty string)' });
    }

    const trimmedDesc = description.trim();
    const trimmedLoc = location.trim();

    const { category, severity } = await classifyIncidentWithAi({
      text: trimmedDesc,
      location: trimmedLoc,
    });

    const assigned_to = assignAuthority(severity);

    return res.json({
      category,
      severity,
      assigned_to,
      location: trimmedLoc,
    });
  } catch (error) {
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

export const estimateImpact = async (req, res, next) => {
  try {
    const { location, category, severity } = req.body ?? {};

    if (typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({ message: 'location is required (non-empty string)' });
    }
    if (category === undefined || category === null || String(category).trim() === '') {
      return res.status(400).json({ message: 'category is required' });
    }
    if (severity === undefined || severity === null || String(severity).trim() === '') {
      return res.status(400).json({ message: 'severity is required' });
    }

    const trimmedLoc = location.trim();
    const routes = await loadRoutesDataset();
    const affected_routes = [...new Set(findAffectedRouteNames(routes, trimmedLoc))];
    const allNames = routes
      .map((r) => r?.name)
      .filter((n) => typeof n === 'string' && n.trim())
      .map((n) => n.trim());
    const affectedSet = new Set(affected_routes);
    const reroutes = pickReroutes(allNames, affectedSet, 2);

    const aiPayload = {
      location: trimmedLoc,
      category,
      severity,
      affected_routes,
    };

    const { delay, recovery_time } = await getImpact(aiPayload);

    return res.json({
      affected_routes,
      delay,
      recovery_time,
      reroutes,
    });
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
