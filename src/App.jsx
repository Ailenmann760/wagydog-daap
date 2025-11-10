import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import SwapPage from './pages/SwapPage.jsx';
import PoolsPage from './pages/PoolsPage.jsx';
import TokenFactoryPage from './pages/TokenFactoryPage.jsx';

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/swap" element={<SwapPage />} />
      <Route path="/pools" element={<PoolsPage />} />
      <Route path="/token-factory" element={<TokenFactoryPage />} />
    </Route>
  </Routes>
);

export default App;
