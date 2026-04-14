import { motion } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/planner', label: 'Planner' },
  { to: '/dashboard', label: 'Dashboard' },
];

function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 shadow-lg shadow-indigo-950/30 backdrop-blur-xl sm:flex-nowrap sm:gap-4 sm:px-5">
        <NavLink
          to="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-white transition hover:text-indigo-200"
        >
          Dhaka Smart Transit
        </NavLink>
        <nav
          className="flex items-center gap-1 sm:gap-2"
          aria-label="Primary navigation"
        >
          {links.map(({ to, label }) => (
            <motion.div key={to} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${
                    isActive
                      ? 'bg-white/15 text-white ring-1 ring-white/20'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            </motion.div>
          ))}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/planner"
              className="ml-1 inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-900/40 ring-1 ring-white/15 transition hover:from-indigo-400 hover:to-violet-500 sm:ml-2"
            >
              Get Started
            </Link>
          </motion.div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
