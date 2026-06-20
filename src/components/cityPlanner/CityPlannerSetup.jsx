import { useState } from 'react';
import {
  clampSize,
  DEFAULT_GRID_SIZE,
  MAX_GRID_SIZE,
  MIN_GRID_SIZE,
} from '../../lib/cityPlanner/grid.js';

const PRESETS = [
  { label: '8×8', width: 8, height: 8 },
  { label: '16×16', width: 16, height: 16 },
  { label: '24×24', width: 24, height: 24 },
  { label: '32×32', width: 32, height: 32 },
];

export function CityPlannerSetup({ initialWidth, initialHeight, onCreate, onCancel }) {
  const [width, setWidth] = useState(initialWidth ?? DEFAULT_GRID_SIZE);
  const [height, setHeight] = useState(initialHeight ?? DEFAULT_GRID_SIZE);

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate(clampSize(width), clampSize(height));
  };

  return (
    <div className="city-planner-setup">
      <h3 className="city-planner-setup__title">Grid size</h3>
      <p className="city-planner-setup__desc">
        Choose how many cells wide and tall your city layout should be ({MIN_GRID_SIZE}–
        {MAX_GRID_SIZE} each).
      </p>

      <form className="city-planner-setup__form" onSubmit={handleSubmit}>
        <label className="city-planner-setup__field">
          <span>Width</span>
          <input
            type="number"
            min={MIN_GRID_SIZE}
            max={MAX_GRID_SIZE}
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </label>
        <label className="city-planner-setup__field">
          <span>Height</span>
          <input
            type="number"
            min={MIN_GRID_SIZE}
            max={MAX_GRID_SIZE}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </label>

        <div className="city-planner-setup__presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="city-planner-setup__preset"
              onClick={() => {
                setWidth(preset.width);
                setHeight(preset.height);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="city-planner-setup__actions">
          <button type="submit" className="city-planner-setup__submit">
            {onCancel ? 'Apply size' : 'Create grid'}
          </button>
          {onCancel ? (
            <button type="button" className="city-planner-setup__cancel" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
