import React from "react";
import { Card, HStack, VStack, Box, Text, Badge, Progress } from "@chakra-ui/react";

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  iconColorPalette?: "blue" | "green" | "purple" | "amber" | "gray" | "red" | "cyan" | "orange" | "teal";
  valueColor?: string;
  badge?: {
    label: string;
    colorPalette?: string;
    variant?: "subtle" | "solid" | "outline";
  };
  progress?: {
    value: number; // 0 to 100
    label?: string;
    colorPalette?: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  icon,
  iconColorPalette = "blue",
  valueColor,
  badge,
  progress,
}) => {
  const pastelStyles = (() => {
    switch (iconColorPalette) {
      case "green":
      case "teal":
        return {
          bg: { base: "pastel.mint", _dark: "rgba(16, 185, 129, 0.08)" },
          accentColor: "green.600",
          waveColor: "#10B981",
        };
      case "amber":
      case "orange":
      case "red":
        return {
          bg: { base: "pastel.peach", _dark: "rgba(249, 115, 22, 0.08)" },
          accentColor: "orange.600",
          waveColor: "#F97316",
        };
      case "purple":
        return {
          bg: { base: "pastel.lavender", _dark: "rgba(168, 85, 247, 0.08)" },
          accentColor: "purple.600",
          waveColor: "#A855F7",
        };
      case "blue":
      case "cyan":
      default:
        return {
          bg: { base: "pastel.sky", _dark: "rgba(59, 130, 246, 0.08)" },
          accentColor: "blue.600",
          waveColor: "#3B82F6",
        };
    }
  })();

  return (
    <Card.Root
      size="sm"
      bg={pastelStyles.bg}
      position="relative"
      overflow="hidden"
      transition="transform 0.2s ease"
      _hover={{
        transform: "translateY(-2px)",
      }}
      h="full"
    >
      {/* Decorative background trend wave matching mockup cards */}
      <Box
        position="absolute"
        right="0"
        bottom="10px"
        w="110px"
        h="36px"
        pointerEvents="none"
        opacity="0.45"
        zIndex="0"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 110 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 24 C 20 28, 35 12, 55 18 C 75 24, 85 4, 110 8"
            stroke={pastelStyles.waveColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </Box>

      <Card.Body
        p="4.5"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        h="full"
        position="relative"
        zIndex="1"
      >
        <div>
          <HStack justify="space-between" align="center" mb="2.5">
            <Card.Title
              fontSize="xs"
              fontWeight="700"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="0.04em"
              truncate
            >
              {label}
            </Card.Title>
            {icon && (
              <Box
                w="32px"
                h="32px"
                borderRadius="xl"
                bg="bg.workspace"
                color={pastelStyles.accentColor}
                borderWidth="1px"
                borderColor="border.subtle"
                shadow="pill"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shrink="0"
              >
                {icon}
              </Box>
            )}
          </HStack>

          <HStack align="baseline" gap="2.5" mb="1">
            <Text
              fontSize="2xl"
              fontWeight="800"
              color={valueColor || "fg.default"}
              lineHeight="1.1"
              letterSpacing="-0.03em"
            >
              {value}
            </Text>
            {badge && (
              <Badge
                variant={badge.variant}
                colorPalette={badge.colorPalette || iconColorPalette}
              >
                {badge.label}
              </Badge>
            )}
          </HStack>

          {description && (
            <Card.Description fontSize="xs" color="fg.subtle" lineHeight="1.3">
              {description}
            </Card.Description>
          )}
        </div>

        {progress && (
          <VStack
            align="stretch"
            gap="1.5"
            mt="3.5"
            pt="2.5"
            borderTopWidth="1px"
            borderColor="border.subtle"
          >
            <HStack justify="space-between" fontSize="xs" color="fg.muted">
              <Text fontWeight="500">{progress.label || "Coverage"}</Text>
              <Text fontWeight="700" color="fg.default">
                {Math.round(Math.min(Math.max(progress.value, 0), 100))}%
              </Text>
            </HStack>
            <Progress.Root
              value={Math.min(Math.max(progress.value, 0), 100)}
              size="xs"
              colorPalette={progress.colorPalette || iconColorPalette}
            >
              <Progress.Track bg="bg.workspace/60" h="5px">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default StatCard;
