import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_JSON = path.join(__dirname, '../../ai-services/data/routes.json');

let cachedRoutes = null;

export async function loadRoutesDataset() {
  if (cachedRoutes) {
    return cachedRoutes;
  }
  const raw = await readFile(ROUTES_JSON, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('routes dataset must be a JSON array');
  }
  cachedRoutes = data;
  return cachedRoutes;
}

/**
 * Routes whose stop list contains the given location (case-insensitive trimmed match).
 */
export function findAffectedRouteNames(routes, location) {
  const loc = String(location ?? '').trim().toLowerCase();
  if (!loc) {
    return [];
  }
  const names = [];
  for (const route of routes) {
    const stops = route?.stops;
    if (!Array.isArray(stops)) {
      continue;
    }
    const hit = stops.some((stop) => String(stop).trim().toLowerCase() === loc);
    if (hit && typeof route?.name === 'string' && route.name.trim()) {
      names.push(route.name.trim());
    }
  }
  return names;
}

/**
 * Up to `max` route names that are not in the affected set (dataset-driven).
 */
export function pickReroutes(allRouteNames, affectedSet, max = 2) {
  const reroutes = [];
  for (const name of allRouteNames) {
    if (!affectedSet.has(name) && reroutes.length < max) {
      reroutes.push(name);
    }
  }
  return reroutes;
}
