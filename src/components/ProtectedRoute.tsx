import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useLoggedUserStore();
  const [isValidating, setIsValidating] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(isAuthenticated);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      if (!isAuthenticated || !user) {
        if (isMounted) {
          setIsSessionValid(false);
          setIsValidating(false);
        }
        return;
      }

      try {
        const { data: { session }, error: sessionError } =
          await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError || !session?.user) {
          logout();
          setIsSessionValid(false);
          setIsValidating(false);
          return;
        }

        // Verify that account is still active and not deleted in public.users
        if (user.id) {
          const { data: dbUser, error: dbError } = await supabase
            .from("users")
            .select("active, deleted")
            .eq("id", user.id)
            .maybeSingle();

          if (!isMounted) return;

          if (!dbError && dbUser && (!dbUser.active || dbUser.deleted)) {
            toast.error(
              "Your account is inactive or has been deactivated. Please contact support at support@navitronix.in."
            );
            await supabase.auth.signOut();
            logout();
            setIsSessionValid(false);
            setIsValidating(false);
            return;
          }
        }

        setIsSessionValid(true);
      } catch (err) {
        console.error("Session validation error:", err);
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id, logout]);

  if (!isAuthenticated || !isSessionValid) {
    return <Navigate to="/login" replace />;
  }

  if (isValidating) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-default-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-800" />
          <span className="text-caption font-caption text-subtext-color">
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
