import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import Lookup from './pages/Lookup';
import AdminDashboard from './pages/AdminDashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import MenuManager from './pages/MenuManager';
import StaffAccounts from './pages/StaffAccounts';
import FeedbackManager from './pages/FeedbackManager';

function Layout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}

function PrivateRoute({ adminOnly }) {
  const { staff, loading } = useAuth();
  if (loading) return null;
  if (!staff) return <Navigate to="/login" replace />;
  if (adminOnly && staff.role !== 'admin') return <Navigate to="/scanner" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/lookup" element={<Lookup />} />
              <Route element={<PrivateRoute adminOnly />}>
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/menu-manager" element={<MenuManager />} />
                <Route path="/staff-accounts" element={<StaffAccounts />} />
                <Route path="/feedback-manager" element={<FeedbackManager />} />
              </Route>
              <Route path="/" element={<Navigate to="/scanner" replace />} />
              <Route path="*" element={<Navigate to="/scanner" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
