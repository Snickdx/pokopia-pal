import { useCallback, useState } from 'react';
import { APP_FULL_NAME } from '../lib/appConfig.js';

export function ShareButton({
  title = APP_FULL_NAME,
  text = '',
  url,
  className = '',
}) {
  const [status, setStatus] = useState(null);

  const share = useCallback(async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const payload = { title, text: text || title, url: shareUrl };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(payload);
        setStatus('shared');
        setTimeout(() => setStatus(null), 2000);
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus('copied');
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus('failed');
      setTimeout(() => setStatus(null), 2500);
    }
  }, [title, text, url]);

  const label =
    status === 'copied'
      ? 'Link copied'
      : status === 'shared'
        ? 'Shared'
        : status === 'failed'
          ? 'Copy failed'
          : 'Share';

  return (
    <button
      type="button"
      className={`share-button ${className}`.trim()}
      onClick={share}
      aria-label={`Share ${title}`}
      title={label}
    >
      <span className="share-button__icon" aria-hidden>
        ⎘
      </span>
      <span className="share-button__label">{label}</span>
    </button>
  );
}
