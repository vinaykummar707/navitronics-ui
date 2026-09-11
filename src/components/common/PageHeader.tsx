import React from "react";
import { Box, Flex, HStack, VStack, Heading, Text, Badge } from "@chakra-ui/react";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: string | number | React.ReactNode;
  badgeColorPalette?: "blue" | "green" | "amber" | "gray" | "red" | "purple";
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badge,
  badgeColorPalette = "blue",
  actions,
}) => {
  return (
    <Box w="full" mb="6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Box mb="2.5">
          <Breadcrumbs items={breadcrumbs} />
        </Box>
      )}

      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        gap="4"
        wrap="wrap"
      >
        <VStack align="flex-start" gap="1" maxW="3xl">
          <HStack gap="3" align="center" wrap="wrap">
            <Heading
              as="h1"
              fontSize={{ base: "xl", md: "22px" }}
              fontWeight="600"
              color="fg.default"
              letterSpacing="-0.015em"
              lineHeight="1.25"
            >
              {title}
            </Heading>
            {badge !== undefined && badge !== null && (
              <Badge
                variant="subtle"
                colorPalette={badgeColorPalette}
                borderRadius="xs"
                fontSize="xs"
                fontWeight="500"
              >
                {badge}
              </Badge>
            )}
          </HStack>
          {description && (
            <Text fontSize="sm" color="fg.muted" lineHeight="1.5">
              {description}
            </Text>
          )}
        </VStack>

        {actions && (
          <HStack gap="2.5" align="center" wrap="wrap" shrink="0">
            {actions}
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

export default PageHeader;
