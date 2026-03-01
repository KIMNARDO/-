import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import TeamInfo from './pages/TeamInfo';
import Members from './pages/Members';
import JoinRequest from './pages/JoinRequest';
import Admin from './pages/Admin';
import KakaoCallback from './pages/KakaoCallback';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl font-bold text-text-main">JR</span>
        </div>
        <p className="text-text-secondary text-sm">로딩 중...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/join" element={<JoinRequest />} />
      <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="payments" element={<Payments />} />
        <Route path="team" element={<TeamInfo />} />
        <Route path="members" element={<Members />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
