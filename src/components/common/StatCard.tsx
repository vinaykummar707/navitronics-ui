import React from "react";
import { Card, HStack, VStack, Box, Text, Badge, Progress } from "@chakra-ui/react";

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  iconColorPalette?: "blue" | "green" | "purple" | "amber" | "gray" | "red" | "cyan" | "orange";
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
  return (
    <Card.Root
      size="sm"
      variant="outline"
      bg="bg.panel"
      borderColor="border.default"
      position="relative"
      overflow="hidden"
      transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "sm",
        borderColor: `${iconColorPalette}.muted`,
      }}
      h="full"
    >
      {/* Top subtle accent bar */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="2.5px"
        bg={`${iconColorPalette}.solid`}
        opacity="0.85"
      />

      <Card.Body p="4" display="flex" flexDirection="column" justifyContent="space-between" h="full">
        <div>
          <HStack justify="space-between" align="center" mb="2.5">
            <Card.Title
              fontSize="11px"
              fontWeight="600"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="0.05em"
              truncate
            >
              {label}
            </Card.Title>
            {icon && (
              <Box
                w="32px"
                h="32px"
                borderRadius="md"
                bg={`${iconColorPalette}.subtle`}
                color={`${iconColorPalette}.fg`}
                borderWidth="1px"
                borderColor={`${iconColorPalette}.muted`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                shrink="0"
              >
                {icon}
              </Box>
            )}
          </HStack>

          <HStack align="baseline" gap="2" mb="1">
            <Text
              fontSize="2xl"
              fontWeight="700"
              color={valueColor || "fg.default"}
              lineHeight="1.1"
              letterSpacing="-0.02em"
            >
              {value}
            </Text>
            {badge && (
              <Badge
                size="xs"
                variant={badge.variant || "subtle"}
                colorPalette={badge.colorPalette || iconColorPalette}
                borderRadius="xs"
                px="1.5"
                py="0.2"
                fontSize="10px"
                fontWeight="600"
              >
                {badge.label}
              </Badge>
            )}
          </HStack>

          {description && (
            <Card.Description fontSize="11px" color="fg.subtle" lineHeight="1.3">
              {description}
            </Card.Description>
          )}
        </div>

        {progress && (
          <VStack align="stretch" gap="1" mt="3" pt="2" borderTopWidth="1px" borderColor="border.subtle">
            <HStack justify="space-between" fontSize="10px" color="fg.muted">
              <Text>{progress.label || "Coverage"}</Text>
              <Text fontWeight="600" color="fg.default">
                {Math.round(Math.min(Math.max(progress.value, 0), 100))}%
              </Text>
            </HStack>
            <Progress.Root
              value={Math.min(Math.max(progress.value, 0), 100)}
              size="xs"
              colorPalette={progress.colorPalette || iconColorPalette}
              shape="full"
            >
              <Progress.Track bg="bg.subtle" h="4px">
                <Progress.Range borderRadius="full" />
              </Progress.Track>
            </Progress.Root>
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default StatCard;
