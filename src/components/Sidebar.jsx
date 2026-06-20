import { PreferenceList } from './PreferenceList.jsx';
import { SearchInput } from './SearchInput.jsx';

export function Sidebar({ blocks, search, onSearchChange, mobileOpen = false, onNavigate }) {
  return (
    <aside className={`sidebar glass-panel${mobileOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar__header">
        <h2 className="sidebar__title">Preferences</h2>
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Filter preferences…"
          id="sidebar-search"
        />
      </div>
      <PreferenceList blocks={blocks} className="scroll-y" onSelect={onNavigate} />
    </aside>
  );
}
