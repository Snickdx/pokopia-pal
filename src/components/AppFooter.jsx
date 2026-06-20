import { LEGAL_DISCLAIMER } from '../lib/appConfig.js';

export function AppFooter() {
  return (
    <footer className="app-footer">
      {LEGAL_DISCLAIMER.map((line) => (
        <p key={line} className="app-footer__line">
          {line}
        </p>
      ))}
    </footer>
  );
}
