import Sidebar from "@/components/Sidebar";
import { Flex, Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const HomePage = () => {
  return (
    <Flex h="100vh" w="100vw" overflow="hidden" bg="slate.50">
      <Sidebar />
      <Box as="main" flex="1" overflow="auto" h="full" minW="0">
        <Outlet />
      </Box>
    </Flex>
  );
};

export default HomePage;
