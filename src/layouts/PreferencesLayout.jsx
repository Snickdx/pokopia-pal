import { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar.jsx';
import { getPreferences, groupPreferencesByCategory, searchPreferences } from '../lib/catalog.js';
import { catalogKey } from '../lib/catalogCache.js';
import { preferencePath } from '../lib/routes.js';
import { PreferencesNavContext } from '../context/PreferencesNavContext.jsx';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { useIsMobileCatalog } from '../hooks/useMediaQuery.js';
import { FavoritesPageSkeleton } from '../components/skeletons/FavoritesPageSkeleton.jsx';
import { ErrorState } from '../components/states/ErrorState.jsx';
import { EmptyState } from '../components/states/EmptyState.jsx';

function firstPreferenceFromData(data) {
  const list = Array.isArray(data) ? data : [];
  if (!list.length) return null;
  const blocks = groupPreferencesByCategory(list);
  return blocks[0]?.preferences[0] ?? list[0];
}

export function PreferencesLayout() {
  const { preferenceId } = useParams();
  const isMobile = useIsMobileCatalog();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, loading, error } = useFirestoreQuery(getPreferences, [], {
    cacheKey: catalogKey('preferences', 'all'),
  });

  const blocks = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const filtered = searchPreferences(list, search);
    return groupPreferencesByCategory(filtered);
  }, [data, search]);

  const defaultPreference = useMemo(() => firstPreferenceFromData(data), [data]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [preferenceId, isMobile]);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  if (loading) {
    return <FavoritesPageSkeleton />;
  }
  if (error) {
    return (
      <div className="page-frame page-frame--center">
        <ErrorState message={error.message} onRetry={() => window.location.reload()} />
      </div>
    );
  }
  if (!Array.isArray(data) || !data.length) {
    return (
      <div className="page-frame page-frame--center glass-panel">
        <EmptyState
          title="No preferences yet"
          message="Run npm run seed to populate Firestore from the local data export."
        />
      </div>
    );
  }

  if (!preferenceId && defaultPreference) {
    return <Navigate to={preferencePath(defaultPreference)} replace />;
  }

  return (
    <PreferencesNavContext.Provider
      value={{ isMobile, openSidebar, closeSidebar }}
    >
      <div className={`master-detail${isMobile ? ' master-detail--mobile' : ''}`}>
        {isMobile && sidebarOpen ? (
          <button
            type="button"
            className="sidebar-backdrop sidebar-backdrop--visible"
            aria-label="Close preferences menu"
            onClick={closeSidebar}
          />
        ) : null}
        <Sidebar
          blocks={blocks}
          search={search}
          onSearchChange={setSearch}
          mobileOpen={isMobile && sidebarOpen}
          onNavigate={isMobile ? closeSidebar : undefined}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={preferenceId || 'welcome'}
            className="master-detail__content"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.22 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </PreferencesNavContext.Provider>
  );
}
