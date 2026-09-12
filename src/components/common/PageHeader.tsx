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
    <Box w="full" mb="5">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Box mb="2">
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
              fontSize={{ base: "xl", md: "24px" }}
              fontWeight="800"
              color="fg.default"
              letterSpacing="-0.03em"
              lineHeight="1.2"
            >
              {title}
            </Heading>
            {badge !== undefined && badge !== null && (
              <Badge colorPalette={badgeColorPalette}>
                {badge}
              </Badge>
            )}
          </HStack>
          {description && (
            <Text fontSize="xs" color="fg.muted" lineHeight="1.4">
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
