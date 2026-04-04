import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Marketing from './pages/Marketing';
import Menu from './pages/Menu';
import Kitchen from './pages/Kitchen';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';
import BotStatus from './pages/BotStatus';
import WhatsApp from './pages/WhatsApp';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-canvas">
        <Topbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/kitchen" element={<Kitchen />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/bot-status" element={<BotStatus />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          {/* Add more routes later */}
        </Routes>
      </div>
    </div>
  );
}

export default App;
