import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Marketing from './pages/Marketing';
import Catalog from './pages/Catalog';
import Operations from './pages/Operations';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';
import BotStatus from './pages/BotStatus';
import Bookings from './pages/Bookings';
import WhatsApp from './pages/WhatsApp';
import Login from './pages/Login';
import Notifications from './pages/Notifications';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={closeSidebar}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="main-canvas">
        <Topbar onMenuClick={toggleSidebar} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/bot-status" element={<BotStatus />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
