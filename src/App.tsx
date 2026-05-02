import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { POSProvider } from './context/POSContext';
import { MainLayout } from './components/layout/MainLayout';

// Lazy load pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Login from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
      <POSProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="categories" element={<Categories />} />
              <Route path="pos" element={<POS />} />
              <Route path="transactions" element={<Transactions />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </POSProvider>
    </AuthProvider>
  );
}
