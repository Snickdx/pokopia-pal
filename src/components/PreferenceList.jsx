import { NavLink, useLocation } from 'react-router-dom';
import { preferencePath, preferenceTabFromPathname } from '../lib/routes.js';

export function PreferenceList({ blocks, className = '', onSelect }) {
  const { pathname } = useLocation();
  const activeTab = preferenceTabFromPathname(pathname);

  return (
    <nav className={`preference-list ${className}`.trim()} aria-label="Preferences">
      {blocks.map((block) => (
        <div key={block.category} className="preference-list__section">
          <h2 className="preference-list__heading">{block.category}</h2>
          <ul>
            {block.preferences.map((pref) => (
              <li key={pref.id}>
                <NavLink
                  to={preferencePath(pref, activeTab)}
                  onClick={() => onSelect?.()}
                  className={({ isActive }) =>
                    `preference-list__item${isActive ? ' preference-list__item--active' : ''}`
                  }
                >
                  {pref.displayName}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
