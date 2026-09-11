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
    <Flex
      h="100vh"
      w="100vw"
      overflow="hidden"
      direction="column"
      bg="bg.canvas"
    >
      {/* Top Header Navigation (Full Width) */}
      <AppHeader
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main App Canvas: Sidebar + Scrollable Viewport */}
      <Flex flex="1" w="full" overflow="hidden" position="relative">
        {/* Desktop Sidebar (Persistent, docked under header) */}
        <Box display={{ base: "none", md: "block" }} h="full">
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
              <Drawer.Content p="0" bg="bg.surface">
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" position="absolute" top="2" right="2" />
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

        {/* Main Content Viewport */}
        <Box
          as="main"
          flex="1"
          minW="0"
          h="full"
          overflowY="auto"
          bg="bg.muted"
          p={{ base: "4", md: "6", lg: "8" }}
        >
          <Box maxW="1400px" mx="auto" w="full">
          {children || <Outlet />}
        </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppShell;
