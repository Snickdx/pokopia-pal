import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import App from './App.jsx';
import { initAnalytics } from './lib/analytics.js';
import { initCatalogCache } from './lib/catalogPreload.js';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });
initAnalytics();
initCatalogCache();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
