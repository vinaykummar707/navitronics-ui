import { useEffect, Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { supabase } from "@/supabaseClient";
import { ILoggedUser, loggedUserCrud } from "@/types/IUser";
import { DefaultPageLayout } from "@/ui";
import { toast } from "react-toastify";

const HomePage = () => {
    const navigate = useNavigate();
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
            
            // Redirect to a specific internal page if everything is okay
        }
    }, [user, userMetadata, navigate]);

    function handleError(message) {
        logout();
        toast.error(message);
        localStorage.clear();
        supabase.auth.signOut();
        navigate("/login"); // Ensure there is a route to handle login
    }

    return (
        <DefaultPageLayout>
            <Suspense fallback={
              <div className="flex h-full w-full items-center justify-center min-h-[300px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-800" />
              </div>
            }>
                <Outlet />
            </Suspense>
        </DefaultPageLayout>
    )
};

export default HomePage;