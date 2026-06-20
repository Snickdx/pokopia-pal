import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export function PillTabs({ tabs, basePath }) {
  return (
    <nav className="pill-tabs" role="tablist">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={`${basePath}/${tab.to}`}
          className={({ isActive }) =>
            `pill-tabs__tab${isActive ? ' pill-tabs__tab--active' : ''}`
          }
          role="tab"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="pill-tab-indicator"
                  className="pill-tabs__indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span className="pill-tabs__icon" aria-hidden>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
