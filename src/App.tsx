import { Route, Routes } from "react-router-dom";
import { CafeDetailPage } from "./pages/CafeDetailPage";
import { ExplorePage } from "./pages/ExplorePage";
import { SavedPage } from "./pages/SavedPage";
import { VisitsPage } from "./pages/VisitsPage";
import { AppShell } from "./ui/AppShell";
import { LocationProvider } from "./ui/LocationProvider";
import { PersonalProvider } from "./ui/PersonalProvider";

export function App() {
  return (
    <LocationProvider>
      <PersonalProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/cafes/:id" element={<CafeDetailPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/visits" element={<VisitsPage />} />
          </Routes>
        </AppShell>
      </PersonalProvider>
    </LocationProvider>
  );
}
