import { useUserDetails } from "@/api/users/hooks";
import Navbar from "@/components/Navbar";
import NavbarTwo from "@/components/Navbar copy";
import useAuthStore from "@/store/authStore";
import { supabase } from "@/supabaseClient";
import { DefaultPageLayout } from "@/ui";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const HomePage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { data: userMetadata, refetch } = useUserDetails(user?.userId);

    useEffect(() => {
        if (userMetadata?.users_by_pk.organization.active === false) {
            logout();
            toast.error("Your organization is not active. Please contact support.");
            localStorage.clear();
            supabase.auth.signOut();
            return;
        }

        if (userMetadata?.users_by_pk.active === false) {
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
