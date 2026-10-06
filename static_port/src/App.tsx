import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { SkillsPage } from './pages/public/SkillsPage';
import { ExperiencesPage } from './pages/public/ExperiencesPage';
import { ResearchPage } from './pages/public/ResearchPage';
import { BooksPage } from './pages/public/BooksPage';
import { EventsPage } from './pages/public/EventsPage';
import { CertificatesPage } from './pages/public/CertificatesPage';
import { AcademicPage } from './pages/public/AcademicPage';
import Projects from './Projects.jsx';
import { LoginPage } from './pages/admin/LoginPage';
import { RegisterPage } from './pages/admin/RegisterPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProfilePage } from './pages/admin/ProfilePage';
import { SkillsAdminPage } from './pages/admin/SkillsAdminPage';
import { ProjectsAdminPage } from './pages/admin/ProjectsAdminPage';
import { ResearchAdminPage } from './pages/admin/ResearchAdminPage';
import { BooksAdminPage } from './pages/admin/BooksAdminPage';
import { EventsAdminPage } from './pages/admin/EventsAdminPage';
import { CertificatesAdminPage } from './pages/admin/CertificatesAdminPage';
import { ExperiencesAdminPage } from './pages/admin/ExperiencesAdminPage';
import { AcademicsAdminPage } from './pages/admin/AcademicsAdminPage';
import { QuickLinksAdminPage } from './pages/admin/QuickLinksAdminPage';

import { AnalyticsDashboard } from './pages/admin/analytics/AnalyticsDashboard';

import Certificates from './Certificates.jsx';
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/experience" element={<Navigate to="/experiences" replace />} />
        <Route path="/experiences" element={<ExperiencesPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/academic" element={<AcademicPage />} />
        <Route path="/cert" element={<Certificates />} />

        <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/register" element={<RegisterPage />} />
        <Route path="/admin/analytics" element={<ProtectedRoute element={<AnalyticsDashboard />} />} />
        <Route path="/admin/analytics/:tab" element={<ProtectedRoute element={<AnalyticsDashboard />} />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
        <Route path="/admin/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route path="/admin/skills" element={<ProtectedRoute element={<SkillsAdminPage />} />} />
        <Route path="/admin/projects" element={<ProtectedRoute element={<ProjectsAdminPage />} />} />
        <Route path="/admin/research" element={<ProtectedRoute element={<ResearchAdminPage />} />} />
        <Route path="/admin/books" element={<ProtectedRoute element={<BooksAdminPage />} />} />
        <Route path="/admin/events" element={<ProtectedRoute element={<EventsAdminPage />} />} />
        <Route path="/admin/certificates" element={<ProtectedRoute element={<CertificatesAdminPage />} />} />
        <Route path="/admin/experiences" element={<ProtectedRoute element={<ExperiencesAdminPage />} />} />
        <Route path="/admin/academics" element={<ProtectedRoute element={<AcademicsAdminPage />} />} />
        <Route path="/admin/quick-links" element={<ProtectedRoute element={<QuickLinksAdminPage />} />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
