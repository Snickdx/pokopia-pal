import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav.jsx';
import { MobileNav } from './MobileNav.jsx';
import { AppFooter } from './AppFooter.jsx';

export function AppShell() {
  return (
    <div className="app-shell page-bg">
      <div className="content-layer app-shell__inner">
        <TopNav />
        <main className="app-shell__main">
          <Outlet />
        </main>
        <AppFooter />
        <MobileNav />
      </div>
    </div>
  );
}
