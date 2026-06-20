export function BookmarkButton({
  bookmarked = false,
  onToggle,
  title = 'Habitat',
  className = '',
}) {
  const label = bookmarked ? 'Bookmarked' : 'Bookmark';

  return (
    <button
      type="button"
      className={`bookmark-button${bookmarked ? ' bookmark-button--active' : ''} ${className}`.trim()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle?.();
      }}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? `Remove bookmark for ${title}` : `Bookmark ${title}`}
      title={label}
    >
      <span className="bookmark-button__icon" aria-hidden>
        {bookmarked ? '★' : '☆'}
      </span>
      <span className="bookmark-button__label">{label}</span>
    </button>
  );
}
