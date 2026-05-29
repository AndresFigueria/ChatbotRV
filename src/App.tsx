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
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import NotificationToast from './components/NotificationToast';
import Landing from './pages/Landing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('isAuthenticated');
  //   setIsAuthenticated(false);
  // };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Componente interno para el layout principal
  const MainLayout = () => {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }
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
        <NotificationToast />
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <MainLayout /> : <Landing />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={isAuthenticated ? <Onboarding onComplete={() => {}} /> : <Login onLogin={handleLogin} />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}

export default App;
