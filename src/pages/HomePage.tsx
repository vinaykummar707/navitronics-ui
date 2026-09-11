import { useEffect, Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { supabase } from "@/supabaseClient";
import { ILoggedUser, loggedUserCrud } from "@/types/IUser";
import { toast } from "react-toastify";
import { Box, Spinner } from "@chakra-ui/react";
import AppShell from "@/components/layout/AppShell";
import ShellPreviewContent from "@/components/layout/ShellPreviewContent";

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useLoggedUserStore((state) => state.user);
    const logout = useLoggedUserStore((state) => state.logout);
    const { useList } = loggedUserCrud;
    const { data: userMetadata, loading, error } = useList({
        filters: { user_id: user?.user_id || "" },
        custom(query) {
          return query.select(` *,
            region:region_id (*),
            organization:organization_id (*),
            depot:depot_id (*),
            role:role_id (*)
          `).single();
        },
        skip: !user?.id, // Skip the query until we have a userId
    });

    useEffect(() => {
        console.log("User metadata fetched:", userMetadata);
        if (userMetadata && !loading && !error) {
            const userData = userMetadata.data as ILoggedUser;
            if (userData.organization?.active === false) {
                handleError("Your organization is not active. Please contact support.");
                return;
            }

            if (userData.active === false || userData.deleted) {
                handleError("Your account is not active or has been deleted. Please contact support.");
                return;
            }
        }
    }, [user, userMetadata, navigate]);

    function handleError(message: string) {
        logout();
        toast.error(message);
        localStorage.clear();
        supabase.auth.signOut();
        navigate("/login");
    }

    return (
      <AppShell>
        <Suspense
          fallback={
            <Box
              p="16"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap="3"
            >
              <Spinner size="md" color="blue.500" />
            </Box>
          }
        >
          <Outlet />
        </Suspense>
      </AppShell>
    );
};

export default HomePage;