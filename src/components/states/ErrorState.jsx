export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel state-error" role="alert">
      <p className="state-title">Something went wrong</p>
      <p className="state-message">{message || 'Could not load data.'}</p>
      {onRetry && (
        <button type="button" className="btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
