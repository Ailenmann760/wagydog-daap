import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LegalPage from './components/LegalPage.jsx';
import ResourcePage from './components/ResourcePage.jsx';

const MarketplacePage = lazy(() => import('./pages/MarketplacePage.jsx'));
const PoolsPage = lazy(() => import('./pages/PoolsPage.jsx'));

const SwapPage = lazy(() => import('./pages/SwapPage.jsx'));
const TokenFactoryPage = lazy(() => import('./pages/TokenFactoryPage.jsx'));

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/marketplace"
        element={
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading marketplace…</div>}>
            <MarketplacePage />
          </Suspense>
        }
      />
      <Route
        path="/swap"
        element={
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading swap desk…</div>}>
            <SwapPage />
          </Suspense>
        }
      />
      <Route
        path="/pools"
        element={
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading pools…</div>}>
            <PoolsPage />
          </Suspense>
        }
      />
      <Route
        path="/token-factory"
        element={
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading token factory…</div>}>
            <TokenFactoryPage />
          </Suspense>
        }
      />
      <Route path="/legal/terms" element={<LegalPage />} />
      <Route path="/legal/privacy" element={<LegalPage />} />
      <Route
        path="/resources/audit"
        element={
          <ResourcePage
            title="Protocol Audit Library"
            description="Review smart contract assessments, validator reports, and ongoing monitoring notes that underpin WagyDog’s decentralized infrastructure."
          />
        }
      />
      <Route
        path="/resources/press"
        element={
          <ResourcePage
            title="Media & Press Kit"
            description="Access logos, brand guidelines, and story starters for covering the WagyDog ecosystem and its community-driven roadmap."
          />
        }
      />
    </Route>
  </Routes>
);

export default App;
