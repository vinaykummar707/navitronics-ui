import Navbar from "@/components/Navbar";
import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

 const HomePage = () => {
   return ( <div className="h-screen flex flex-col  w-screen overflow-hidden bg-stone-100">
    <Navbar />
    <Flex className="overflow-hidden">
     <Outlet/>
    </Flex>
  </div>)
};
export default HomePage;