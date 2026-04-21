import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import api from '../services/api';

const inputClass =
  'w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20';

function crowdTextClass(crowd) {
  const key = String(crowd ?? '')
    .trim()
    .toUpperCase();
  if (key === 'LOW') return 'text-green-400';
  if (key === 'MEDIUM') return 'text-yellow-400';
  if (key === 'HIGH') return 'text-red-400';
  return 'text-slate-300';
}

function crowdLabel(crowd) {
  const key = String(crowd ?? '')
    .trim()
    .toUpperCase();
  if (key === 'LOW') return 'Low';
  if (key === 'MEDIUM') return 'Medium';
  if (key === 'HIGH') return 'High';
  return String(crowd ?? '—');
}

const routeItemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const DHAKA_CENTER = [23.8103, 90.4125];

function crowdLineColor(crowd) {
  const key = String(crowd ?? '').toUpperCase();
  if (key === 'HIGH') return '#ef4444';
  if (key === 'MEDIUM') return '#eab308';
  return '#22c55e';
}

function Planner() {
  const [stops, setStops] = useState([]);
  const [stopsLoading, setStopsLoading] = useState(true);
  const [stopsError, setStopsError] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('09:00');
  const [timeType, setTimeType] = useState('leave_after');
  const [preference, setPreference] = useState('fastest');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStopsError('');
      try {
        const { data } = await api.get('/planner/stops');
        const list = Array.isArray(data?.data) ? data.data : [];
        if (!cancelled) setStops(list);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Could not load stops.';
        if (!cancelled) setStopsError(typeof msg === 'string' ? msg : String(msg));
      } finally {
        if (!cancelled) setStopsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedRoutes = useMemo(() => {
    if (!Array.isArray(results) || results.length === 0) return [];
    return [...results].sort((a, b) => {
      const sa = Number(a?.score);
      const sb = Number(b?.score);
      if (Number.isFinite(sa) && Number.isFinite(sb)) return sa - sb;
      const ea = Number(a?.eta);
      const eb = Number(b?.eta);
      if (!Number.isFinite(ea) && !Number.isFinite(eb)) return 0;
      if (!Number.isFinite(ea)) return 1;
      if (!Number.isFinite(eb)) return -1;
      return ea - eb;
    });
  }, [results]);

  const bestRouteMapSegments = useMemo(() => {
    if (!sortedRoutes.length) return [];
    const segments = sortedRoutes[0]?.map_segments;
    return Array.isArray(segments) ? segments.filter((s) => Array.isArray(s?.polyline) && s.polyline.length > 1) : [];
  }, [sortedRoutes]);

  const bestRouteLandmarks = useMemo(() => {
    const dedupe = new Map();
    for (const seg of bestRouteMapSegments) {
      const landmarks = Array.isArray(seg?.landmarks) ? seg.landmarks : [];
      for (const lm of landmarks) {
        const name = String(lm?.name ?? '').trim();
        const lat = Number(lm?.lat);
        const lon = Number(lm?.lon);
        if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const key = `${name}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
        if (!dedupe.has(key)) dedupe.set(key, { name, lat, lon });
      }
    }
    return Array.from(dedupe.values());
  }, [bestRouteMapSegments]);

  const handlePlanRoute = async () => {
    setError('');
    setResults([]);

    if (!origin?.trim() || !destination?.trim()) {
      setError('Please select both origin and destination.');
      return;
    }
    if (origin === destination) {
      setError('Origin and destination must be different.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      setError('Enter a valid time in HH:MM format.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/planner/commute', {
        origin: origin.trim(),
        destination: destination.trim(),
        time,
        time_type: timeType,
        preference,
      });
      const list = Array.isArray(data?.data) ? data.data : [];
      setResults(list);
      setHasFetched(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Something went wrong. Try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <h2 className="mb-6 text-2xl font-semibold text-white">
              Plan Your Commute
            </h2>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Origin
                </span>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  disabled={loading || stopsLoading || stops.length === 0}
                  className={inputClass}
                >
                  <option value="">
                    {stopsLoading ? 'Loading stops…' : 'Select origin'}
                  </option>
                  {stops.map((name) => (
                    <option key={name} value={name} className="bg-slate-900">
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Destination
                </span>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={loading || stopsLoading || stops.length === 0}
                  className={inputClass}
                >
                  <option value="">
                    {stopsLoading ? 'Loading stops…' : 'Select destination'}
                  </option>
                  {stops.map((name) => (
                    <option key={name} value={name} className="bg-slate-900">
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Trip time mode
                </span>
                <select
                  value={timeType}
                  onChange={(e) => setTimeType(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                >
                  <option value="leave_after" className="bg-slate-900">
                    Leave after (time = travel context)
                  </option>
                  <option value="arrive_by" className="bg-slate-900">
                    Arrive by (shows feasible options only)
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Preferred ranking
                </span>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                >
                  <option value="fastest" className="bg-slate-900">Fastest</option>
                  <option value="less_crowded" className="bg-slate-900">Less crowded</option>
                  <option value="fewer_transfers" className="bg-slate-900">Fewer transfers</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Time (HH:MM)
                </span>
                <input
                  type="time"
                  step={60}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handlePlanRoute}
              disabled={
                loading ||
                stopsLoading ||
                stops.length === 0 ||
                Boolean(stopsError)
              }
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Planning…' : 'Plan Route'}
            </button>

            <AnimatePresence>
              {stopsError ? (
                <motion.p
                  key="stops-err"
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
                >
                  Stops: {stopsError}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {error ? (
                <motion.p
                  key="err"
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100"
                >
                  {error}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          {bestRouteMapSegments.length > 0 ? (
            <div className="h-[280px] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
              <MapContainer center={DHAKA_CENTER} zoom={12} className="h-full w-full" scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {bestRouteMapSegments.map((seg, idx) => (
                  <Polyline
                    key={`${seg.route}-${seg.from_stop}-${seg.to_stop}-${idx}`}
                    positions={seg.polyline}
                    pathOptions={{ color: crowdLineColor(seg.crowd), weight: 5, opacity: 0.9 }}
                  >
                    <Tooltip sticky>
                      {seg.route}: {seg.from_stop} → {seg.to_stop} ({crowdLabel(seg.crowd)})
                    </Tooltip>
                  </Polyline>
                ))}
                {bestRouteLandmarks.map((lm, idx) => (
                  <CircleMarker
                    key={`${lm.name}-${idx}`}
                    center={[lm.lat, lm.lon]}
                    radius={4}
                    pathOptions={{ color: '#38bdf8', fillColor: '#22d3ee', fillOpacity: 0.9 }}
                  >
                    <Tooltip direction="top" offset={[0, -2]} opacity={0.95}>
                      Landmark: {lm.name}
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-base font-medium text-slate-300"
              >
                Calculating best routes...
              </motion.p>
            </div>
          ) : null}

          {!loading && sortedRoutes.length === 0 && !error ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <p className="max-w-sm text-center text-slate-400">
                {hasFetched
                  ? timeType === 'arrive_by'
                    ? 'No feasible routes before your arrival deadline. Try a later arrival time or different stops.'
                    : 'No routes found for this trip. Try a different pair or time.'
                  : 'Enter details to see routes'}
              </p>
            </div>
          ) : null}

          {!loading && sortedRoutes.length > 0 ? (
            <motion.ul
              className="space-y-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                },
              }}
            >
              {sortedRoutes.map((row, index) => {
                const stopsText = Array.isArray(row?.stops)
                  ? row.stops.join(' → ')
                  : '';
                const eta = row?.eta;
                const etaLabel = Number.isFinite(Number(eta))
                  ? `${Number(eta)} min`
                  : '—';
                const isBest = index === 0;
                const preferenceLabel =
                  row?.preference === 'less_crowded'
                    ? 'Less crowded'
                    : row?.preference === 'fewer_transfers'
                      ? 'Fewer transfers'
                      : 'Fastest';

                return (
                  <motion.li
                    key={`${row?.route ?? 'route'}-${index}`}
                    variants={routeItemVariants}
                  >
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">
                              {row?.route ?? 'Route'}
                            </h3>
                            {isBest ? (
                              <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                                Best Option ({preferenceLabel})
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-slate-400">{stopsText}</p>
                          {row?.explanation ? (
                            <p className="mt-2 text-xs text-slate-500">{String(row.explanation)}</p>
                          ) : null}
                          {row?.time_note ? (
                            <p className="mt-1 text-xs text-cyan-200/80">{String(row.time_note)}</p>
                          ) : null}
                          {row?.suggested_departure_time ? (
                            <p className="mt-1 text-xs text-indigo-200/80">
                              Suggested departure: {String(row.suggested_departure_time)}
                            </p>
                          ) : null}
                          {Array.isArray(row?.legs) && row.legs.length > 0 ? (
                            <ul className="mt-3 list-inside list-disc text-xs text-slate-500">
                              {row.legs.map((leg, li) => (
                                <li key={`${leg.route}-${leg.from_stop}-${leg.to_stop}-${li}`}>
                                  {leg.kind === 'transfer'
                                    ? `Transfer · +${leg.eta} min`
                                    : `${leg.route}: ${leg.from_stop} → ${leg.to_stop} · ${leg.eta} min · ${crowdLabel(leg.crowd)}`}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                          <p className="text-white">
                            <span className="text-slate-400">ETA </span>
                            <span className="font-bold">{etaLabel}</span>
                          </p>
                          <p className={crowdTextClass(row?.crowd)}>
                            <span className="text-slate-500">Crowd </span>
                            <span className="font-semibold">
                              {crowdLabel(row?.crowd)}
                            </span>
                          </p>
                          <p className="text-slate-200">
                            <span className="text-slate-500">Transfers </span>
                            <span className="font-semibold">{Number(row?.transfer_count ?? 0)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Planner;
