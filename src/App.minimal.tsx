import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { ClientProvider } from "./contexts/ClientContext";
import { SalesProvider } from "./contexts/SalesContext";
import { ProductProvider } from "./contexts/ProductContext";

// Simple test component
function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Test Page - Application is Working!
      </h1>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p>✅ React Router is working</p>
        <p>✅ Tailwind CSS is working</p>
        <p>✅ Layout components are working</p>
      </div>
      <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
        <p><strong>Environment:</strong> {import.meta.env.VITE_ENVIRONMENT || 'Not set'}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ClientProvider>
      <SalesProvider>
        <ProductProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Dashboard Layout */}
              <Route element={<AppLayout />}>
                <Route index path="/" element={<TestPage />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/home" element={<Home />} />
              </Route>
              
              {/* Fallback Route */}
              <Route path="*" element={<TestPage />} />
            </Routes>
          </Router>
        </ProductProvider>
      </SalesProvider>
    </ClientProvider>
  );
}
