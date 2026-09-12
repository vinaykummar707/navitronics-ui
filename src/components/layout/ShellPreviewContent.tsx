import React from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Heading,
  Badge,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { useLocation, useNavigate } from "react-router-dom";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { ROLES } from "@/constants/roles";
import { toast } from "react-toastify";
import {
  LuBus,
  LuMapPin,
  LuBuilding,
  LuBuilding2,
  LuGlobe,
  LuUsers,
  LuShieldCheck,
  LuType,
  LuWrench,
  LuSettings,
  LuSparkles,
  LuCircleCheck,
  LuActivity,
  LuRadio,
  LuArrowRight,
  LuSun,
  LuMoon,
  LuPanelLeft,
  LuTrendingUp,
  LuVolume2,
  LuCpu,
} from "react-icons/lu";

interface ShellPreviewContentProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

interface TestModuleCard {
  title: string;
  path: string;
  icon: React.ReactElement;
  desc: string;
  tag: string;
  gradient: string;
  metric: string;
  metricLabel: string;
  features: string[];
}

const MODULE_CARDS: TestModuleCard[] = [
  {
    title: "Routes Management",
    path: "/home/routes",
    icon: <LuBus size={22} />,
    desc: "Configure LED signboards, multi-lingual stop cycles, and export V1/V2 display binaries.",
    tag: "Core PIS",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    metric: "48",
    metricLabel: "Active Routes",
    features: ["Front/Rear/Side Boards", "V1/V2 Export", "Schedule Rules"],
  },
  {
    title: "Stops & Audio Engine",
    path: "/home/stops",
    icon: <LuMapPin size={22} />,
    desc: "GPS coordinates, station arrival zones, and Indic neural Text-To-Speech audio announcements.",
    tag: "PAS / ITMS",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
    metric: "342",
    metricLabel: "Geofenced Stops",
    features: ["Multi-lingual Audio", "Indic TTS", "Radius Triggers"],
  },
  {
    title: "Transit Depots",
    path: "/home/depots",
    icon: <LuBuilding size={22} />,
    desc: "Bus terminal depots, vehicle fleet maintenance, and regional division allocations.",
    tag: "Fleet Ops",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    metric: "16",
    metricLabel: "Regional Depots",
    features: ["Fleet Assignment", "Terminal Bays", "Shift Schedule"],
  },
  {
    title: "Regional Sectors",
    path: "/home/regions",
    icon: <LuGlobe size={22} />,
    desc: "Transit network partitions, metropolitan divisions, and inter-city transport zones.",
    tag: "Zones",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)",
    metric: "6",
    metricLabel: "Sectors Covered",
    features: ["Zone Grouping", "Depot Clustering", "Zonal Rules"],
  },
  {
    title: "Agencies & Organizations",
    path: "/home/organizations",
    icon: <LuBuilding2 size={22} />,
    desc: "Multi-tenant transport corporations (APSRTC, TSRTC, BMTC, KSRTC) and service licenses.",
    tag: "Enterprise",
    gradient: "linear-gradient(135deg, #ec4899 0%, #be123c 100%)",
    metric: "12",
    metricLabel: "Transit Agencies",
    features: ["Multi-Tenant", "Feature Toggles", "Subscription"],
  },
  {
    title: "Font & LED Hardware",
    path: "/home/font-configuration",
    icon: <LuType size={22} />,
    desc: "Dot-matrix font rendering (16px, 24px), regional Indian script transliteration, and glyph tables.",
    tag: "Hardware",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
    metric: "14",
    metricLabel: "Custom Font Sets",
    features: ["Indic Glyphs", "Dot-Matrix Editor", "Mono/Bitmap"],
  },
];

export const ShellPreviewContent: React.FC<ShellPreviewContentProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useLoggedUserStore((state) => state.user);
  const { selectedOrganization } = useOrganizationStore();
  const { colorMode, toggleColorMode } = useColorMode();

  const userRole = (user?.role?.name || "Operator").toLowerCase();

  const cardBg = useColorModeValue("white", "rgba(30, 41, 59, 0.5)");
  const borderColor = useColorModeValue("rgba(226, 232, 240, 0.9)", "rgba(51, 65, 85, 0.4)");
  const textColor = useColorModeValue("gray.900", "gray.50");
  const subtextColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box p={{ base: "4", md: "8" }} maxW="1500px" mx="auto" w="full">
      <VStack align="stretch" gap="8">
        {/* Hero Banner with Aurora Gradient */}
        <Box
          p={{ base: "6", md: "10" }}
          borderRadius="3xl"
          bg={useColorModeValue(
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a8a 70%, #0369a1 100%)",
            "linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)"
          )}
          color="white"
          shadow="2xl"
          borderWidth="1px"
          borderColor={useColorModeValue("transparent", "whiteAlpha.100")}
          position="relative"
          overflow="hidden"
        >
          {/* Subtle Ambient Glow Circles */}
          <Box
            position="absolute"
            top="-60px"
            right="-60px"
            w="300px"
            h="300px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(0,0,0,0) 70%)"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            bottom="-80px"
            left="20%"
            w="350px"
            h="350px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(0,0,0,0) 70%)"
            pointerEvents="none"
          />

          <Flex
            direction={{ base: "column", lg: "row" }}
            align={{ base: "start", lg: "center" }}
            justify="space-between"
            gap="6"
            position="relative"
            zIndex="1"
          >
            <VStack align="start" gap="3" maxW="720px">
              <HStack gap="2">
                <Badge
                  colorPalette="cyan"
                  variant="solid"
                  borderRadius="full"
                  px="3"
                  py="0.5"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  Chakra UI v3.37
                </Badge>
                <Badge
                  colorPalette="emerald"
                  variant="surface"
                  borderRadius="full"
                  px="3"
                  py="0.5"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  Modern SaaS Architecture
                </Badge>
              </HStack>

              <Heading size={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" letterSpacing="tight">
                Navitronix Intelligent Transit Hub
              </Heading>

              <Text fontSize={{ base: "sm", md: "md" }} opacity="0.9" lineHeight="tall">
                Welcome to your upgraded modern SaaS app shell. All existing business logic, Zustand stores, Supabase data services, and LED matrix algorithms remain strictly preserved while you evaluate the new rounded layout, white space, and vibrant theme.
              </Text>
            </VStack>

            {/* Quick Interactive Shell Control Hub */}
            <VStack align={{ base: "start", lg: "end" }} gap="3" flexShrink={0}>
              <HStack gap="2.5" wrap="wrap">
                <Button
                  size="sm"
                  borderRadius="xl"
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
                  onClick={onToggleSidebar}
                >
                  <LuPanelLeft style={{ marginRight: "6px" }} />
                  {isSidebarCollapsed ? "Expand Rail" : "Collapse Rail"}
                </Button>

                <Button
                  size="sm"
                  borderRadius="xl"
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
                  onClick={toggleColorMode}
                >
                  {colorMode === "dark" ? (
                    <LuSun style={{ marginRight: "6px", color: "#facc15" }} />
                  ) : (
                    <LuMoon style={{ marginRight: "6px", color: "#a5b4fc" }} />
                  )}
                  {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>

                <Button
                  size="sm"
                  borderRadius="xl"
                  bg="white"
                  color="blue.900"
                  fontWeight="bold"
                  shadow="md"
                  _hover={{ bg: "gray.100", transform: "translateY(-1px)" }}
                  onClick={() =>
                    toast.success("✨ Chakra UI v3 App Shell verified successfully!")
                  }
                >
                  <LuSparkles style={{ marginRight: "6px" }} />
                  Test Feedback
                </Button>
              </HStack>

              <HStack gap="2" fontSize="xs" opacity="0.8">
                <LuCircleCheck size={15} style={{ color: "#34d399" }} />
                <Text>Active Agency: {selectedOrganization?.name || "Global Master"}</Text>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* 4 Key Metric Cards (Bento SaaS Style) */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="5">
          <Box
            p="5"
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
            position="relative"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
          >
            <Flex justify="space-between" align="start">
              <VStack align="start" gap="1">
                <Text fontSize="xs" fontWeight="semibold" color={subtextColor}>
                  Active Bus Routes
                </Text>
                <Heading size="2xl" fontWeight="black" color={textColor}>
                  48
                </Heading>
              </VStack>
              <Box
                w="42px"
                h="42px"
                borderRadius="xl"
                bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="0 6px 14px -3px rgba(59, 130, 246, 0.4)"
              >
                <LuBus size={20} />
              </Box>
            </Flex>
            <HStack gap="1.5" mt="3">
              <Badge colorPalette="green" variant="surface">
                <LuTrendingUp size={11} style={{ marginRight: "2px" }} /> +12%
              </Badge>
              <Text fontSize="xs" color={subtextColor}>
                Full PIS binary sync
              </Text>
            </HStack>
          </Box>

          <Box
            p="5"
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
            position="relative"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
          >
            <Flex justify="space-between" align="start">
              <VStack align="start" gap="1">
                <Text fontSize="xs" fontWeight="semibold" color={subtextColor}>
                  Transit Stop Points
                </Text>
                <Heading size="2xl" fontWeight="black" color={textColor}>
                  342
                </Heading>
              </VStack>
              <Box
                w="42px"
                h="42px"
                borderRadius="xl"
                bg="linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="0 6px 14px -3px rgba(245, 158, 11, 0.4)"
              >
                <LuMapPin size={20} />
              </Box>
            </Flex>
            <HStack gap="1.5" mt="3">
              <Badge colorPalette="amber" variant="surface">
                <LuVolume2 size={11} style={{ marginRight: "2px" }} /> TTS Live
              </Badge>
              <Text fontSize="xs" color={subtextColor}>
                Indic audio triggers
              </Text>
            </HStack>
          </Box>

          <Box
            p="5"
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
            position="relative"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
          >
            <Flex justify="space-between" align="start">
              <VStack align="start" gap="1">
                <Text fontSize="xs" fontWeight="semibold" color={subtextColor}>
                  Operational Depots
                </Text>
                <Heading size="2xl" fontWeight="black" color={textColor}>
                  16
                </Heading>
              </VStack>
              <Box
                w="42px"
                h="42px"
                borderRadius="xl"
                bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="0 6px 14px -3px rgba(16, 185, 129, 0.4)"
              >
                <LuBuilding size={20} />
              </Box>
            </Flex>
            <HStack gap="1.5" mt="3">
              <Badge colorPalette="emerald" variant="surface">
                100% Online
              </Badge>
              <Text fontSize="xs" color={subtextColor}>
                Across 6 regions
              </Text>
            </HStack>
          </Box>

          <Box
            p="5"
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
            position="relative"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
          >
            <Flex justify="space-between" align="start">
              <VStack align="start" gap="1">
                <Text fontSize="xs" fontWeight="semibold" color={subtextColor}>
                  Hardware Sync
                </Text>
                <Heading size="2xl" fontWeight="black" color="emerald.500">
                  99.9%
                </Heading>
              </VStack>
              <Box
                w="42px"
                h="42px"
                borderRadius="xl"
                bg="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="0 6px 14px -3px rgba(139, 92, 246, 0.4)"
              >
                <LuCpu size={20} />
              </Box>
            </Flex>
            <HStack gap="1.5" mt="3">
              <Badge colorPalette="purple" variant="surface">
                Controller Ready
              </Badge>
              <Text fontSize="xs" color={subtextColor}>
                Socket stream active
              </Text>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* Section Title */}
        <Flex align="center" justify="space-between" pt="2">
          <VStack align="start" gap="0.5">
            <Heading size="lg" fontWeight="bold" color={textColor}>
              Module Exploration Matrix
            </Heading>
            <Text fontSize="xs" color={subtextColor}>
              Test how the shell reacts when switching contexts. Click any module to navigate.
            </Text>
          </VStack>

          <Badge variant="surface" colorPalette="blue">
            Active: {location.pathname}
          </Badge>
        </Flex>

        {/* Colorful Bento Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
          {MODULE_CARDS.map((card) => {
            const isSelected = location.pathname.startsWith(card.path);

            return (
              <Box
                key={card.path}
                p="6"
                bg={cardBg}
                borderRadius="3xl"
                borderWidth="1.5px"
                borderColor={isSelected ? "blue.500" : borderColor}
                shadow={isSelected ? "xl" : "sm"}
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                position="relative"
                _hover={{
                  transform: "translateY(-4px)",
                  shadow: "lg",
                  borderColor: isSelected ? "blue.500" : "blue.400",
                }}
              >
                <Flex direction="column" justify="space-between" h="full" gap="5">
                  <VStack align="start" gap="3.5">
                    <Flex align="center" justify="space-between" w="full">
                      <HStack gap="3">
                        <Box
                          w="44px"
                          h="44px"
                          borderRadius="2xl"
                          bg={card.gradient}
                          color="white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          shadow="0 8px 18px -4px rgba(0,0,0,0.25)"
                        >
                          {card.icon}
                        </Box>
                        <VStack align="start" gap="0">
                          <Text fontSize="md" fontWeight="extrabold" color={textColor} letterSpacing="tight">
                            {card.title}
                          </Text>
                          <Text fontSize="xs" fontWeight="semibold" color="blue.500">
                            {card.metric} {card.metricLabel}
                          </Text>
                        </VStack>
                      </HStack>

                      <Badge
                        size="xs"
                        variant={isSelected ? "solid" : "surface"}
                        colorPalette={isSelected ? "blue" : "gray"}
                        borderRadius="full"
                        px="2"
                      >
                        {card.tag}
                      </Badge>
                    </Flex>

                    <Text fontSize="xs" color={subtextColor} lineHeight="relaxed">
                      {card.desc}
                    </Text>

                    {/* Feature Chips */}
                    <HStack gap="1.5" wrap="wrap">
                      {card.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="subtle"
                          borderRadius="md"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>

                  {/* Action Footer */}
                  <Flex align="center" justify="space-between" pt="3" borderTopWidth="1px" borderColor={borderColor}>
                    <Text fontSize="xs" color={subtextColor} fontWeight="medium">
                      Route: <code>{card.path}</code>
                    </Text>

                    <Button
                      size="xs"
                      borderRadius="xl"
                      colorPalette={isSelected ? "blue" : "gray"}
                      variant={isSelected ? "solid" : "subtle"}
                      fontWeight="bold"
                      onClick={() => navigate(card.path)}
                      _hover={{ transform: "scale(1.04)" }}
                    >
                      {isSelected ? "Active View" : "Explore Module"}
                      <LuArrowRight style={{ marginLeft: "4px" }} />
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
export default ShellPreviewContent;
