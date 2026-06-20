export function EmptyState({ title = 'Nothing here yet', message, icon = '✿' }) {
  return (
    <div className="state-panel state-empty">
      <div className="empty-icon" aria-hidden>
        {icon}
      </div>
      <p className="state-title">{title}</p>
      {message && <p className="state-message">{message}</p>}
    </div>
  );
}
