import React, { useState } from "react";
import { Box, Flex, Drawer, Portal, CloseButton } from "@chakra-ui/react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { Outlet } from "react-router-dom";

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <Box
      h="100vh"
      w="100vw"
      overflow="hidden"
      bg="bg.canvas"
      display="flex"
      flexDirection="column"
      position="relative"
    >
      {/* Ambient background curved lines matching reference image */}
      <Box
        position="absolute"
        top="0"
        right="0"
        bottom="0"
        left="0"
        pointerEvents="none"
        overflow="hidden"
        zIndex="0"
        display={{ base: "none", lg: "block" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", top: 0, right: 0, opacity: 0.35 }}
        >
          <path
            d="M800 -200 C 1100 200, 1400 300, 1800 600"
            stroke="var(--chakra-colors-purple-400)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
          <path
            d="M600 -300 C 1000 100, 1300 400, 1900 800"
            stroke="var(--chakra-colors-blue-300)"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M1100 400 C 1300 600, 1500 800, 1800 1100"
            stroke="var(--chakra-colors-indigo-300)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </Box>

      {/* Floating Rounded Grand Island Container matching reference mockup */}
      <Box
        flex="1"
        w="full"
        maxW="1760px"
        mx="auto"
        borderRadius={{ base: "none", lg: "4xl" }}
        bg="bg.shell"
        boxShadow="floating"
        borderWidth={{ base: "0", lg: "1px" }}
        borderColor="border.subtle"
        overflow="hidden"
        display="flex"
        position="relative"
        zIndex="1"
      >
        {/* Desktop Sidebar (Floating left panel) */}
        <Box
          display={{ base: "none", md: "block" }}
          h="full"
          shrink="0"
          borderRightWidth={{ base: "0", lg: "0" }}
        >
          <AppSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
        </Box>

        {/* Mobile Sidebar (Slide-out Drawer for screens < md) */}
        <Drawer.Root
          open={isMobileMenuOpen}
          onOpenChange={(e) => setIsMobileMenuOpen(e.open)}
          placement="start"
          size="xs"
        >
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content p="0" bg="bg.shell">
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" position="absolute" top="3" right="3" />
                </Drawer.CloseTrigger>
                <Drawer.Body p="0" h="full">
                  <AppSidebar
                    isCollapsed={false}
                    onNavigate={() => setIsMobileMenuOpen(false)}
                  />
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>

        {/* Inset Main Workspace Canvas with large rounded corners */}
        <Box
          flex="1"
          h="full"
          minW="0"
          bg="bg.workspace"
          borderRadius={{ base: "none", lg: "3xl" }}
          m={{ base: "0", lg: "2.5" }}
          display="flex"
          flexDirection="column"
          overflow="hidden"
          boxShadow="workspace"
          borderWidth={{ base: "0", lg: "1px" }}
          borderColor="border.subtle"
        >
          {/* Topbar inside the white rounded workspace */}
          <AppHeader
            onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          {/* Scrollable Content Viewport */}
          <Box
            as="main"
            flex="1"
            minW="0"
            h="full"
            overflowY="auto"
            bg="bg.workspace"
            p={{ base: "4", md: "6", lg: "7" }}
          >
            <Box maxW="1500px" mx="auto" w="full">
              {children || <Outlet />}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
