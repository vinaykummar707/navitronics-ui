import { useUserDetails } from "@/api/users/hooks";
import Navbar from "@/components/Navbar";
import NavbarTwo from "@/components/Navbar copy";
import useAuthStore from "@/store/authStore";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { supabase } from "@/supabaseClient";
import { loggedUserCrud } from "@/types/IUser";
import { DefaultPageLayout } from "@/ui";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const HomePage = () => {
    const navigate = useNavigate();
    const user = useLoggedUserStore((state) => state.user);
    const logout = useLoggedUserStore((state) => state.logout);
    const { useList } = loggedUserCrud;
    const { data: userMetadata, loading, error } = useList({
        filters: { user_id: user?.id || "" },
        custom(query) {
          return query.select(` *,
            region:region_id (*),
            organization:organization_id (*),
            depot:depot_id (*),
            role:role_id (*)
          `)
        },
        skip: !user?.id, // Skip the query until we have a userId
    });

    useEffect(() => {
        if (userMetadata?.data[0].organization?.active === false) {
            logout();
            toast.error("Your organization is not active. Please contact support.");
            localStorage.clear();
            supabase.auth.signOut();
            return;
        }

        if (userMetadata?.data[0].active === false) {
            logout();
            toast.error("Your account is not active. Please contact support.");
            localStorage.clear();
            supabase.auth.signOut();
            return;
        }

    }, [user, userMetadata, navigate]);

    return (
        <DefaultPageLayout>
            <Outlet />
        </DefaultPageLayout>
    )
};
export default HomePage;
