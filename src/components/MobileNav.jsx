import { NavLink } from 'react-router-dom';
import { MAIN_NAV_LINKS } from '../lib/navLinks.js';

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Mobile">
      {MAIN_NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `mobile-nav__item${isActive ? ' mobile-nav__item--active' : ''}`
          }
        >
          <span className="mobile-nav__icon" aria-hidden>
            {link.icon}
          </span>
          <span>{link.mobileLabel || link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
