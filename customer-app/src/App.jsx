import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MyQR from './pages/MyQR';
import History from './pages/History';
import Feedback from './pages/Feedback';

function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/qr" element={<MyQR />} />
            <Route path="/history" element={<History />} />
            <Route path="/feedback" element={<Feedback />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
