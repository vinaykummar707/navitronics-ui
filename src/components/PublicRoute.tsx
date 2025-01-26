import useAuthStore from "@/store/authStore";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Redirect to home if logged in
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
