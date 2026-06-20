import {
  snorlaxCookingTips,
  snorlaxRecipeCategories,
  snorlaxRecipeFlavors,
  snorlaxRecipeMatrix,
} from '../../data/snorlaxRecipes.js';
import { MOSSLAX_SPRITE } from '../../lib/appConfig.js';
import { GuideHero } from './GuideHero.jsx';
import { RecipeCard } from './RecipeCard.jsx';

function recipesFor(flavorId, categoryId) {
  return snorlaxRecipeMatrix[categoryId]?.[flavorId] ?? [];
}

function flavorHasRecipes(flavorId) {
  return snorlaxRecipeCategories.some((cat) => recipesFor(flavorId, cat.id).length > 0);
}

function RecipeMatrixDesktop() {
  return (
    <div className="recipe-matrix-wrap">
      <table className="recipe-matrix">
        <thead>
          <tr>
            <th scope="col" className="recipe-matrix__corner">
              Flavor
            </th>
            {snorlaxRecipeCategories.map((cat) => (
              <th key={cat.id} scope="col" className="recipe-matrix__cat-head">
                <span className="recipe-matrix__cat-icon" aria-hidden>
                  {cat.icon}
                </span>
                <span className="recipe-matrix__cat-label">{cat.label}</span>
                <span className="recipe-matrix__cat-station">{cat.station}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {snorlaxRecipeFlavors.map((flavor) => (
            <tr key={flavor.id}>
              <th
                scope="row"
                className="recipe-matrix__flavor-head recipe-matrix__flavor-head--row"
                style={{
                  '--flavor-accent': flavor.accent,
                  '--flavor-panel': flavor.panel,
                }}
              >
                <span className="recipe-matrix__flavor-chart">{flavor.chartLabel}</span>
                <span className="recipe-matrix__flavor-name">{flavor.name}</span>
                <span className="recipe-matrix__flavor-boost">{flavor.boost}</span>
              </th>
              {snorlaxRecipeCategories.map((cat) => {
                const recipes = recipesFor(flavor.id, cat.id);
                return (
                  <td key={cat.id} className="recipe-matrix__cell">
                    {recipes.length ? (
                      <div className="recipe-matrix__cell-inner">
                        {recipes.map((recipe) => (
                          <RecipeCard
                            key={`${recipe.dish}-${recipe.ingredients.join()}`}
                            recipe={recipe}
                            flavorId={flavor.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="recipe-matrix__empty">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecipeMatrixMobile() {
  return (
    <div className="recipe-matrix-mobile">
      {snorlaxRecipeFlavors.filter((flavor) => flavorHasRecipes(flavor.id)).map((flavor) => (
        <section
          key={flavor.id}
          className="recipe-mobile-flavor-section"
          style={{
            '--flavor-accent': flavor.accent,
            '--flavor-panel': flavor.panel,
          }}
        >
          <header className="recipe-mobile-flavor-section__head">
            <span className="recipe-mobile-flavor-section__chart">{flavor.chartLabel}</span>
            <span className="recipe-mobile-flavor-section__boost">{flavor.boost}</span>
          </header>

          {snorlaxRecipeCategories.map((cat) => {
            const recipes = recipesFor(flavor.id, cat.id);
            if (!recipes.length) return null;
            return (
              <div key={cat.id} className="recipe-mobile-type">
                <h4 className="recipe-mobile-type__head">
                  <span aria-hidden>{cat.icon}</span>
                  <span>{cat.label}</span>
                </h4>
                <div className="recipe-mobile-grid">
                  {recipes.map((recipe) => (
                    <RecipeCard
                      key={`${recipe.dish}-${recipe.ingredients.join()}`}
                      recipe={recipe}
                      flavorId={flavor.id}
                      compact
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

export function SnorlaxRecipeMatrix() {
  return (
    <>
      <GuideHero
        sprite={MOSSLAX_SPRITE}
        title="Mosslax recipes"
        subtitle="Pick a flavor boost, then a dish type — combine ingredients at the right station and feed Mosslax."
      />

      <section className="recipe-chart-section" aria-labelledby="recipe-chart-heading">
        <h3 id="recipe-chart-heading" className="guide-strip__title recipe-chart-section__title">
          Recipe chart
        </h3>
        <p className="recipe-chart-section__legend">
          Tier 2 = medium boost · Tier 3 = strongest boost for that flavor.
        </p>
        <RecipeMatrixDesktop />
        <RecipeMatrixMobile />
      </section>

      <details className="recipe-howto-details guide-strip">
        <summary className="recipe-howto-details__summary">How to cook</summary>
        <div className="recipe-howto-details__body">
          <ul className="recipe-station-list">
            {snorlaxRecipeCategories.map((cat) => (
              <li key={cat.id} className="recipe-station">
                <span className="recipe-station__icon" aria-hidden>
                  {cat.icon}
                </span>
                <div>
                  <strong>{cat.label}</strong>
                  <span className="recipe-station__gear">{cat.station}</span>
                  <p className="recipe-station__setup">{cat.setup}</p>
                </div>
              </li>
            ))}
          </ul>
          <ul className="recipe-tips">
            {snorlaxCookingTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </details>
    </>
  );
}
