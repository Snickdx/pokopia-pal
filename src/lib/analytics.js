import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { getFirebaseApp, getMeasurementId, isFirebaseConfigured } from './firebase.js';

let analytics = null;
let initPromise = null;

export function initAnalytics() {
  if (!isFirebaseConfigured() || !getMeasurementId()) return Promise.resolve(null);
  if (analytics) return Promise.resolve(analytics);
  if (initPromise) return initPromise;

  initPromise = isSupported().then((supported) => {
    if (!supported) return null;
    analytics = getAnalytics(getFirebaseApp());
    return analytics;
  });

  return initPromise;
}

export function trackEvent(name, params = {}) {
  if (!analytics) return;
  logEvent(analytics, name, params);
}

export function getAnalyticsInstance() {
  return analytics;
}
