import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppHeader, BottomNav, Sidebar } from './components/Navigation';
import ToastContainer from './components/Toast';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddStockPage from './pages/AddStockPage';
import InventoryPage from './pages/InventoryPage';
import RecordSalePage from './pages/RecordSalePage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import ReportsPage from './pages/ReportsPage';
import SuppliersPage from './pages/SuppliersPage';
import SettingsPage from './pages/SettingsPage';
import AdjustmentPage, { HistoryPage } from './pages/AdjustmentPage';

function ProtectedLayout() {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <AppHeader />
      <Sidebar />
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/add" element={<AddProductPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/edit/:id" element={<AddProductPage editMode />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/add-stock" element={<AddStockPage />} />
        <Route path="/inventory/returns" element={<AdjustmentPage type="return" />} />
        <Route path="/inventory/damage" element={<AdjustmentPage type="damage" />} />
        <Route path="/inventory/adjust" element={<AdjustmentPage type="adjust" />} />
        <Route path="/inventory/history" element={<HistoryPage />} />
        <Route path="/sales" element={<SalesHistoryPage />} />
        <Route path="/sales/new" element={<RecordSalePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}

function PublicLayout() {
  const { user } = useApp();
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

function AppRoutes() {
  const { user, authLoading } = useApp();

  // Show a branded splash while Firebase is restoring the session
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-page)', gap: 16,
      }}>
        <div style={{ fontSize: 56 }}>🧵</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Laxmi Textiles</div>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--brand-primary)',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/*" element={user ? <ProtectedLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutesWrapper />
      </AppProvider>
    </BrowserRouter>
  );
}

function AppRoutesWrapper() {
  return <AppRoutes />;
}
