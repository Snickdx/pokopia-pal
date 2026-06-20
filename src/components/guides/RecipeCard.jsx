import { GuideDishImage } from './GuideDishImage.jsx';
import { GuideIconRow } from './GuideIcon.jsx';
import { getRecipeEffectiveness } from '../../data/snorlaxRecipes.js';

const ABILITY_HINTS = {
  Chop: ' — Pokémon with Chop must be nearby',
  Crush: ' — Pokémon with Crush must be nearby',
  Burn: ' — Pokémon with Burn in party',
  Recycle: ' — Pokémon with Recycle must be nearby',
  Water: ' — Pokémon with Water must be nearby',
  Generate: ' — Pokémon with Generate must be nearby',
};

export function RecipeCard({ recipe, flavorId, compact = false }) {
  const effectiveness =
    flavorId != null ? getRecipeEffectiveness(flavorId, recipe.dish) : null;

  return (
    <article className={`recipe-card${compact ? ' recipe-card--compact' : ''}`}>
      <GuideDishImage name={recipe.dish} size="dish" />
      <div className="recipe-card__body">
        <h4 className="recipe-card__title">{recipe.dish}</h4>
        {effectiveness ? (
          <p
            className={`recipe-card__tier recipe-card__tier--${effectiveness.tier}`}
            title={effectiveness.effect}
          >
            <span className="recipe-card__tier-badge">Tier {effectiveness.tier}</span>
            <span className="recipe-card__tier-label">{effectiveness.shortLabel}</span>
            {!compact ? (
              <span className="recipe-card__tier-effect">{effectiveness.effect}</span>
            ) : null}
          </p>
        ) : null}
        <div className="recipe-card__ingredients">
          <span className="recipe-card__ing-label">Ingredients</span>
          {recipe.ingredients.length ? (
            <GuideIconRow items={recipe.ingredients} size="sm" />
          ) : null}
          {!compact ? (
            <ul className="recipe-card__ing-list">
              {recipe.ingredients.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          ) : null}
        </div>
        {recipe.ability ? (
          <p className="recipe-card__ability">
            <span className="recipe-card__badge">{recipe.ability}</span>
            {!compact ? ABILITY_HINTS[recipe.ability] || null : null}
          </p>
        ) : null}
        {recipe.note ? <p className="recipe-card__note">{recipe.note}</p> : null}
      </div>
    </article>
  );
}
