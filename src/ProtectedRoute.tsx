import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ requiredRole }: { requiredRole?: string }) => {
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  
  // Kiểm tra nếu user đã đăng nhập
  if (!user.user_id) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra nếu user có role phù hợp
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;