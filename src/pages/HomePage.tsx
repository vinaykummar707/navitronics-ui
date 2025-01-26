import Navbar from "@/components/Navbar";
import NavbarTwo from "@/components/Navbar copy";
import useAuthStore from "@/store/authStore";
import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user) {
            switch (user.userRole) {
                case 'organization_admin':
                    navigate('/home/organizations');
                    break;
                case 'area_admin':
                    navigate('/home/areas');
                    break;
                case 'depot_admin':
                    navigate('/home/depots');
                    break;
                case 'master':
                    navigate('organizations');
                    break;
                default:
                    navigate('/home'); // Default navigation if role is not recognized
            }
        }
    }, [user]);
    return (<div className="h-screen flex flex-col  w-screen overflow-hidden bg-stone-100">
        <Navbar />
        <NavbarTwo />
        <Flex className="overflow-hidden">
            <Outlet />
        </Flex>
    </div>)
};
export default HomePage;