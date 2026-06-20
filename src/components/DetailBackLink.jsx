import { Link, useLocation } from 'react-router-dom';
import { readBackNavigation } from '../lib/navigation.js';

export function DetailBackLink({
  fallbackTo,
  fallbackLabel,
  className = 'detail-page__back',
}) {
  const location = useLocation();
  const back = readBackNavigation(location);

  if (back) {
    return (
      <Link to={back.to} className={className}>
        {back.label}
      </Link>
    );
  }

  return (
    <Link to={fallbackTo} className={className}>
      {fallbackLabel}
    </Link>
  );
}
