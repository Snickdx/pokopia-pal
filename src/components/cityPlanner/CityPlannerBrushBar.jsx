import {
  getPlannerTile,
  tileUsesGridColor,
  isEmptyTileId,
} from '../../lib/cityPlanner/blocks.js';

function formatGridColor(color) {
  if (!color) return '—';
  return color.startsWith('#') ? color.toUpperCase() : color;
}

function BrushPreview({ tile }) {
  const isEmpty = isEmptyTileId(tile?.id);
  const showGridChip = tile && tileUsesGridColor(tile) && tile.color && !isEmpty;

  return (
    <span
      className={`city-planner-palette__preview-wrap${
        showGridChip ? '' : ' city-planner-palette__preview-wrap--sprite-only'
      }`}
      aria-hidden
    >
      <span className="city-planner-palette__preview">
        {tile?.imageSrc ? (
          <img src={tile.imageSrc} alt="" loading="lazy" decoding="async" />
        ) : tile?.icon ? (
          <span className="city-planner-palette__icon">{tile.icon}</span>
        ) : (
          <span
            className="city-planner-palette__color"
            style={tile?.color ? { backgroundColor: tile.color } : undefined}
          />
        )}
      </span>
      {showGridChip ? (
        <span
          className="city-planner-palette__grid-chip"
          style={{ backgroundColor: tile.color }}
          title={formatGridColor(tile.color)}
        />
      ) : null}
    </span>
  );
}

function BrushSlot({ label, tile, modifier, active, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`city-planner-brush-slot city-planner-brush-slot--${modifier}${
        active ? ' city-planner-brush-slot--active-target' : ''
      }`}
      onClick={onClick}
      title={onClick ? `Paint with ${label.toLowerCase()} brush` : undefined}
    >
      {tile ? (
        <BrushPreview tile={tile} />
      ) : (
        <span className="city-planner-brush-slot__preview" aria-hidden>
          ?
        </span>
      )}
      <span className="city-planner-brush-slot__name">{tile?.label ?? '—'}</span>
      <span className="city-planner-brush-slot__label">{label}</span>
    </Tag>
  );
}

export function CityPlannerBrushBar({
  tilesById,
  activeBlockId,
  secondaryBlockId,
  paintTarget = 'primary',
  onPaintTargetChange,
  compact = false,
}) {
  const primaryTile = getPlannerTile(activeBlockId, tilesById);
  const secondaryTile = getPlannerTile(secondaryBlockId, tilesById);
  const showTargetToggle = Boolean(onPaintTargetChange);

  return (
    <div
      className={`city-planner-brush-bar${compact ? ' city-planner-brush-bar--compact' : ''}`}
      role="group"
      aria-label="Selected brushes"
    >
      <BrushSlot
        label="Primary"
        tile={primaryTile}
        modifier="primary"
        active={showTargetToggle && paintTarget === 'primary'}
        onClick={showTargetToggle ? () => onPaintTargetChange('primary') : undefined}
      />
      <BrushSlot
        label="Secondary"
        tile={secondaryTile}
        modifier="secondary"
        active={showTargetToggle && paintTarget === 'secondary'}
        onClick={showTargetToggle ? () => onPaintTargetChange('secondary') : undefined}
      />
      {showTargetToggle ? (
        <p className="city-planner-brush-bar__touch-hint">
          Hold a palette item to set and paint with secondary.
        </p>
      ) : null}
    </div>
  );
}
