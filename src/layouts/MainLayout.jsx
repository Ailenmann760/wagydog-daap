import { Outlet } from 'react-router-dom';
import CardNav from '../components/CardNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import navItems from '../data/navItems.js';

const MainLayout = () => (
  <div className="app-shell">
    <CardNav {...navItems} />
    <div className="page-container">
      <Outlet />
    </div>
    <SiteFooter />
  </div>
);

export default MainLayout;
