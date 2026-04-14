import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Brain,
  Compass,
  MapPin,
  Navigation,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const easeOut = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: easeOut },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
};

const viewportOnce = { once: true, margin: '-60px' };

function FullBleed({ children, className = '' }) {
  return (
    <div
      className={`relative left-1/2 w-screen -translate-x-1/2 ${className}`.trim()}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

const features = [
  {
    icon: Navigation,
    title: 'Smart Planner',
    description:
      'Multi-route commute search with segment ETAs and crowding fused into one clear recommendation.',
    accent: 'from-cyan-500/20 to-blue-600/10',
    ring: 'ring-cyan-400/25',
  },
  {
    icon: ShieldAlert,
    title: 'Incident Detection',
    description:
      'Surface disruptions faster with AI-assisted classification so operators and riders stay ahead.',
    accent: 'from-violet-500/20 to-fuchsia-600/10',
    ring: 'ring-violet-400/25',
  },
  {
    icon: Activity,
    title: 'Congestion Intelligence',
    description:
      'Understand corridor pressure by time and place, built for Dhaka-scale density and volatility.',
    accent: 'from-amber-500/15 to-rose-600/10',
    ring: 'ring-amber-400/20',
  },
];

const steps = [
  {
    step: '01',
    title: 'Enter route',
    copy: 'Pick origin, destination, and time. We match live bus corridors.',
    icon: MapPin,
  },
  {
    step: '02',
    title: 'AI processes',
    copy: 'Models score segments with traffic context and crowding in seconds.',
    icon: Brain,
  },
  {
    step: '03',
    title: 'Get best route',
    copy: 'Compare options with total ETA and worst-case crowding at a glance.',
    icon: Compass,
  },
];

function Home() {
  return (
    <div className="relative -mx-4 text-slate-100 sm:-mx-6 lg:-mx-8">
      <div className="bg-red-500 p-6 text-center text-white">
        Tailwind is working
      </div>
      {/* Hero */}
      <FullBleed className="min-h-[calc(100vh-6.5rem)] bg-gradient-to-b from-slate-950 via-indigo-950/90 to-slate-950 pb-20 pt-6 sm:min-h-[calc(100vh-7rem)] sm:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(99,102,241,0.45),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(168,85,247,0.18),transparent_45%)]" />

        <motion.div
          className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12 text-center sm:py-16"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-200/90 backdrop-blur-md sm:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            AI transit platform
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.35rem] lg:leading-[1.1]"
          >
            AI-Powered Smart Transit for Dhaka
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl"
          >
            Plan routes, avoid congestion, and travel smarter with real-time AI
            insights.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/planner"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-900/40 ring-1 ring-white/20 transition hover:from-indigo-400 hover:to-violet-500 sm:w-auto"
              >
                Plan Your Route
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white shadow-lg backdrop-blur-md transition hover:border-white/30 hover:bg-white/15 sm:w-auto"
              >
                View Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </FullBleed>

      {/* Features */}
      <FullBleed className="border-y border-white/10 bg-slate-950/80 py-20 backdrop-blur-sm">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger}
          className="text-center"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/90"
          >
            Capabilities
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Built for complex urban mobility
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-2xl text-slate-400"
          >
            One stack connecting riders, planners, and operations with explainable
            signals, not black-box guesses.
          </motion.p>
        </motion.div>

        <motion.ul
          className="mt-14 grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          {features.map((f) => (
            <motion.li
              key={f.title}
              variants={cardReveal}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${f.accent} p-8 shadow-xl shadow-black/20 ring-1 ${f.ring} backdrop-blur-xl transition duration-300 hover:border-white/20 hover:shadow-2xl`}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-inner">
                <f.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="relative mt-6 text-xl font-semibold text-white">
                {f.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-300">
                {f.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </FullBleed>

      {/* How it works */}
      <FullBleed className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/40 to-slate-950" />
        <div className="relative">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300/90">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              From query to commute in three steps
            </h2>
          </motion.div>

          <motion.ol
            className="mt-14 grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={{ show: { transition: { staggerChildren: 0.14 } } }}
          >
            {steps.map((s, idx) => (
              <motion.li
                key={s.step}
                variants={cardReveal}
                className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-lg backdrop-blur-xl"
              >
                {idx < steps.length - 1 && (
                  <div
                    className="absolute left-[calc(100%-1rem)] top-1/2 hidden h-px w-[calc(100%-2rem)] -translate-y-1/2 bg-gradient-to-r from-white/25 to-transparent md:block"
                    aria-hidden
                  />
                )}
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300/80">
                  {s.step}
                </span>
                <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-600/20 ring-1 ring-white/15">
                  <s.icon className="h-7 w-7 text-indigo-100" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.copy}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </FullBleed>

      {/* CTA */}
      <FullBleed className="py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.55, ease: easeOut }}
          className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-indigo-600/40 via-violet-700/30 to-slate-900/80 p-12 text-center shadow-2xl shadow-indigo-950/50 backdrop-blur-xl sm:p-16"
        >
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start Planning Your Commute Today
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-slate-200/90">
            {`Join riders using AI-backed ETAs and crowding signals tuned for Dhaka's corridors.`}
          </p>
          <motion.div
            className="relative mt-10 flex justify-center"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-indigo-950 shadow-xl transition hover:bg-slate-100"
            >
              Go to Planner
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </FullBleed>
    </div>
  );
}

export default Home;
