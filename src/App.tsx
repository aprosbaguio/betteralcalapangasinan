import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Header } from './components/Header';
import { AppProvider, useApp } from './context/AppContext';
import { CivicDataProvider } from './context/CivicDataContext';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { BarangaysPage } from './pages/BarangaysPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { HomePage } from './pages/HomePage';
import { MunicipalityPage } from './pages/MunicipalityPage';
import { OrdinancesPage } from './pages/OrdinancesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SearchPage } from './pages/SearchPage';
import { ServicesPage } from './pages/ServicesPage';
import { TransparencyPage } from './pages/TransparencyPage';

const RouterView: React.FC = () => {
  const { pathname, navigate } = useApp();
  const normalized = pathname.replace(/\/+$/, '') || '/';

  if (normalized === '/') {
    return <HomePage />;
  }
  if (normalized === '/municipality') {
    return <MunicipalityPage />;
  }
  if (normalized === '/directory') {
    return <DirectoryPage />;
  }
  if (normalized === '/services') {
    return <ServicesPage />;
  }
  if (normalized.startsWith('/services/')) {
    const slug = normalized.slice('/services/'.length);
    return <ServicesPage slug={slug} />;
  }
  if (normalized === '/transparency') {
    return <TransparencyPage />;
  }
  if (normalized === '/projects') {
    return <ProjectsPage />;
  }
  if (normalized === '/ordinances') {
    return <OrdinancesPage />;
  }
  if (normalized === '/barangays') {
    return <BarangaysPage />;
  }
  if (normalized.startsWith('/barangays/')) {
    const slug = normalized.slice('/barangays/'.length);
    return <BarangaysPage slug={slug} />;
  }
  if (normalized === '/announcements') {
    return <AnnouncementsPage />;
  }
  if (normalized === '/about') {
    return <AboutPage />;
  }
  if (normalized === '/search') {
    return <SearchPage />;
  }
  if (normalized === '/admin') {
    return <AdminPage />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
      <h1 className="font-editorial text-3xl font-semibold text-[#0F294A]">Page Not Found</h1>
      <p className="text-sm text-slate-600">
        The requested civic record route ({normalized}) does not exist on BetterAlcala.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F294A] rounded-md cursor-pointer"
      >
        Return to BetterAlcala Home
      </button>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <CivicDataProvider>
        <AppProvider>
          <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-slate-900 overflow-x-clip">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0F294A] focus:text-white focus:rounded-md"
            >
              Skip to main content
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              <RouterView />
            </main>
            <Footer />
            <GlobalSearchModal />
          </div>
        </AppProvider>
      </CivicDataProvider>
    </ErrorBoundary>
  );
}
