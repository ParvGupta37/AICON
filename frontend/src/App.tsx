import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProjectSetupPage from './pages/ProjectSetupPage';
import AnalysisPage from './pages/AnalysisPage';
import DashboardPage from './pages/DashboardPage';
import ComplianceMapPage from './pages/ComplianceMapPage';
import DocumentationReportsPage from './pages/DocumentationReportsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import CertificationsPage from './pages/CertificationsPage';
import AlertsUpdatesPage from './pages/AlertsUpdatesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/setup" element={<ProjectSetupPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/compliance-map" element={<ComplianceMapPage />} />
        <Route path="/documentation-reports" element={<DocumentationReportsPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/alerts-updates" element={<AlertsUpdatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;