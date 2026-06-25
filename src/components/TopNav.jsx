import { Link, NavLink } from 'react-router-dom';

import { APP_NAME, APP_TAGLINE, APP_LOGO_NAV } from '../lib/appConfig.js';

import { MAIN_NAV_LINKS } from '../lib/navLinks.js';

import { usePwaInstall } from '../hooks/usePwaInstall.js';



export function TopNav() {
  const { isInstallable, install } = usePwaInstall();

  return (

    <header className="top-nav glass-panel">

      <Link to="/" className="top-nav__brand">

        <img

          className="top-nav__logo"

          src={APP_LOGO_NAV}

          alt=""

          width={32}

          height={32}

          decoding="async"

        />

        <div className="top-nav__brand-text">

          <h1 className="top-nav__title">{APP_NAME}</h1>

          <p className="top-nav__subtitle">{APP_TAGLINE}</p>

        </div>

      </Link>

      <nav className="top-nav__links" aria-label="Main">

        {MAIN_NAV_LINKS.map((link) => (

          <NavLink

            key={link.to}

            to={link.to}

            end={link.end}

            className={({ isActive }) =>

              `top-nav__link${isActive ? ' top-nav__link--active' : ''}`

            }

          >

            {link.label}

          </NavLink>

        ))}

      </nav>

      {isInstallable && (
        <button
          className="top-nav__install-btn"
          onClick={install}
          aria-label="Install app"
        >
          ↓ Install
        </button>
      )}

    </header>

  );

}

