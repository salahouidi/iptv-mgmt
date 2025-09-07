import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

// IPTV Module Pages
import Plateformes from "./pages/IPTV/Plateformes";
import Recharges from "./pages/IPTV/Recharges";
import Articles from "./pages/IPTV/Articles";
import Clients from "./pages/IPTV/Clients";
import ClientsHistorique from "./pages/IPTV/ClientsHistorique";
import NouvelleVente from "./pages/IPTV/NouvelleVente";
import Ventes from "./pages/IPTV/Ventes";

import Rapports from "./pages/IPTV/Rapports";
import Statistiques from "./pages/IPTV/Statistiques";
import Parametres from "./pages/IPTV/Parametres";
import Notifications from "./pages/IPTV/Notifications";
import Sauvegarde from "./pages/IPTV/Sauvegarde";
import TestPage from "./pages/IPTV/TestPage";
import GestionAdministrateurs from "./pages/IPTV/GestionAdministrateurs";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ClientProvider } from "./contexts/ClientContext";
import { AuthProvider } from "./contexts/AuthContext";
import DebugConsole from "./components/common/DebugConsole";
// import Produits from "./pages/IPTV/Produits";
// import Stock from "./pages/IPTV/Stock";
// import Clients from "./pages/IPTV/Clients";
// import ClientsHistorique from "./pages/IPTV/ClientsHistorique";
// import NouvelleVente from "./pages/IPTV/NouvelleVente";
// import Ventes from "./pages/IPTV/Ventes";
// import Factures from "./pages/IPTV/Factures";
// import Rapports from "./pages/IPTV/Rapports";
// import Statistiques from "./pages/IPTV/Statistiques";
// import Parametres from "./pages/IPTV/Parametres";
// import Notifications from "./pages/IPTV/Notifications";
// import Sauvegarde from "./pages/IPTV/Sauvegarde";

export default function App() {
  return (
    <AuthProvider>
      <ClientProvider>
        <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* IPTV Management Routes */}
            <Route path="/plateformes" element={<Plateformes />} />
            <Route path="/recharges" element={<ErrorBoundary><Recharges /></ErrorBoundary>} />
            <Route path="/articles" element={<ErrorBoundary><Articles /></ErrorBoundary>} />
            <Route path="/clients" element={<ErrorBoundary><Clients /></ErrorBoundary>} />
            <Route path="/clients/historique" element={<ErrorBoundary><ClientsHistorique /></ErrorBoundary>} />
            <Route path="/ventes/nouvelle" element={<ErrorBoundary><NouvelleVente /></ErrorBoundary>} />
            <Route path="/ventes" element={<ErrorBoundary><Ventes /></ErrorBoundary>} />

            <Route path="/rapports" element={<ErrorBoundary><Rapports /></ErrorBoundary>} />
            <Route path="/statistiques" element={<ErrorBoundary><Statistiques /></ErrorBoundary>} />
            <Route path="/parametres" element={<ErrorBoundary><Parametres /></ErrorBoundary>} />
            <Route path="/admin-management" element={<ErrorBoundary><GestionAdministrateurs /></ErrorBoundary>} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/sauvegarde" element={<Sauvegarde />} />
            <Route path="/test" element={<TestPage />} />

            {/* Utility Pages */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Temporary placeholder routes for development */}
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Debug Console - Available in all environments */}
        <DebugConsole />
      </Router>
      </ClientProvider>
    </AuthProvider>
  );
}
