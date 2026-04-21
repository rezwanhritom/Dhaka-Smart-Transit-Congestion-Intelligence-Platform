import axios from 'axios';

let cachedClient = null;
let cachedBaseUrl = null;

function getAiClient() {
  const baseURL = (process.env.AI_SERVICE_URL || '').trim().replace(/\/$/, '');
  if (!baseURL) {
    const err = new Error('AI_SERVICE_URL is not configured');
    err.statusCode = 503;
    throw err;
  }
  if (cachedClient && cachedBaseUrl === baseURL) {
    return cachedClient;
  }
  cachedBaseUrl = baseURL;
  cachedClient = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return cachedClient;
}

async function timed(label, fn) {
  const started = Date.now();
  try {
    const out = await fn();
    const elapsedMs = Date.now() - started;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[aiService] ${label} ok in ${elapsedMs}ms`);
    }
    return out;
  } catch (error) {
    const elapsedMs = Date.now() - started;
    console.warn(`[aiService] ${label} failed in ${elapsedMs}ms`);
    throw error;
  }
}

export const getETA = async (payload) => {
  const { data } = await timed('eta', () => getAiClient().post('/eta', payload));
  return data;
};

export const getCrowding = async (payload) => {
  const { data } = await timed('crowding', () => getAiClient().post('/crowding', payload));
  return data;
};

export const classifyIncident = async (payload) => {
  const { data } = await getAiClient().post('/incidents/classify', payload);
  return data;
};

export const getImpact = async (payload) => {
  const { data } = await getAiClient().post('/incidents/impact', payload);
  return data;
};

/**
 * Aggregate congestion index for commute planner (HIGH/MEDIUM/LOW).
 * Returns null if AI service is unavailable or endpoint missing.
 */
export const getPlannerTrafficLevel = async (payload) => {
  try {
    const { data } = await getAiClient().post('/congestion/planner-traffic', payload ?? {});
    return data?.traffic_level ?? null;
  } catch {
    return null;
  }
};

export const predictCongestion = async (payload) => {
  const { data } = await timed('congestion.predict', () =>
    getAiClient().post('/congestion/predict', payload),
  );
  return data;
};

export const getCongestionCurrent = async (params = {}) => {
  const { data } = await timed('congestion.current', () =>
    getAiClient().get('/congestion/current', { params }),
  );
  return data;
};

export const getCongestionForecast = async (params) => {
  const { data } = await timed('congestion.forecast', () =>
    getAiClient().get('/congestion/forecast', { params }),
  );
  return data;
};
