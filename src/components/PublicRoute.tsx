import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { supabase } from "@/supabaseClient";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, logout } = useLoggedUserStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setShouldRedirect(false);
          setChecking(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (!session?.user) {
          logout();
          setShouldRedirect(false);
        } else {
          setShouldRedirect(true);
        }
      } catch {
        if (isMounted) setShouldRedirect(false);
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, logout]);

  if (checking) {
    return null;
  }

  if (shouldRedirect) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
