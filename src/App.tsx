import { Route, Routes } from "react-router-dom";
import { CafeDetailPage } from "./pages/CafeDetailPage";
import { ExplorePage } from "./pages/ExplorePage";
import { SavedPage } from "./pages/SavedPage";
import { VisitsPage } from "./pages/VisitsPage";
import { AppShell } from "./ui/AppShell";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/cafes/:id" element={<CafeDetailPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/visits" element={<VisitsPage />} />
      </Routes>
    </AppShell>
  );
}
