import React from "react";
import { Box, Flex, HStack, VStack, Heading, Text } from "@chakra-ui/react";

export interface SectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  variant?: "plain" | "bordered";
  p?: any;
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  actions,
  children,
  variant = "plain",
  p,
}) => {
  const isBordered = variant === "bordered";

  return (
    <Box
      as="section"
      w="full"
      bg={isBordered ? "bg.surface" : "transparent"}
      borderWidth={isBordered ? "1px" : "0px"}
      borderColor="border.default"
      borderRadius={isBordered ? "md" : "none"}
      p={p ?? (isBordered ? { base: "4", md: "5" } : "0")}
      mb="6"
    >
      {(title || actions) && (
        <Flex
          justify="space-between"
          align="center"
          mb="4"
          wrap="wrap"
          gap="3"
        >
          <VStack align="flex-start" gap="0.5">
            {title && (
              <Heading
                as="h2"
                fontSize="md"
                fontWeight="600"
                color="fg.default"
                letterSpacing="-0.01em"
              >
                {title}
              </Heading>
            )}
            {description && (
              <Text fontSize="xs" color="fg.muted">
                {description}
              </Text>
            )}
          </VStack>
          {actions && <HStack gap="2">{actions}</HStack>}
        </Flex>
      )}

      {children}
    </Box>
  );
};

export default Section;
