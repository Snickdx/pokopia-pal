import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { PreferencesLayout } from './layouts/PreferencesLayout.jsx';
import { PreferenceDetailLayout } from './pages/PreferenceDetailLayout.jsx';
import { PreferenceHabitatsTab } from './pages/PreferenceHabitatsTab.jsx';
import { PreferenceItemsTab } from './pages/PreferenceItemsTab.jsx';
import { PreferencePokemonTab } from './pages/PreferencePokemonTab.jsx';
import { HabitatsBrowsePage } from './pages/HabitatsBrowsePage.jsx';
import { HabitatDetailPage } from './pages/HabitatDetailPage.jsx';
import { PokemonBrowsePage } from './pages/PokemonBrowsePage.jsx';
import { PokemonDetailPage } from './pages/PokemonDetailPage.jsx';
import { ItemsBrowsePage } from './pages/ItemsBrowsePage.jsx';
import { ItemDetailPage } from './pages/ItemDetailPage.jsx';
import { GuidesHubPage } from './pages/guides/GuidesHubPage.jsx';
import { DreamIslandsGuidePage } from './pages/guides/DreamIslandsGuidePage.jsx';
import { PaintCrushGuidePage } from './pages/guides/PaintCrushGuidePage.jsx';
import { FlavorBoostGuidePage } from './pages/guides/FlavorBoostGuidePage.jsx';
import { LitterbugsGuidePage } from './pages/guides/LitterbugsGuidePage.jsx';
import { RoommatesPage } from './pages/RoommatesPage.jsx';
import { CityPlannerPage } from './pages/CityPlannerPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="preferences" element={<PreferencesLayout />}>
            <Route path=":preferenceId" element={<PreferenceDetailLayout />}>
              <Route index element={<Navigate to="habitats" replace />} />
              <Route path="habitats" element={<PreferenceHabitatsTab />} />
              <Route path="items" element={<PreferenceItemsTab />} />
              <Route path="pokemon" element={<PreferencePokemonTab />} />
            </Route>
          </Route>
          <Route path="roommates" element={<RoommatesPage />} />
          <Route path="planner" element={<CityPlannerPage />} />
          <Route path="guides" element={<GuidesHubPage />} />
          <Route path="guides/dream-islands" element={<DreamIslandsGuidePage />} />
          <Route path="guides/paint-crush" element={<PaintCrushGuidePage />} />
          <Route path="guides/flavor-boosts" element={<FlavorBoostGuidePage />} />
          <Route path="guides/litterbugs" element={<LitterbugsGuidePage />} />
          <Route path="habitats" element={<HabitatsBrowsePage />} />
          <Route path="habitats/:habitatId" element={<HabitatDetailPage />} />
          <Route path="pokemon" element={<PokemonBrowsePage />} />
          <Route path="pokemon/:pokemonId" element={<PokemonDetailPage />} />
          <Route path="items" element={<ItemsBrowsePage />} />
          <Route path="items/:itemId" element={<ItemDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
