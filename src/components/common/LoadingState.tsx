import React from "react";
import { Card, Box, VStack, HStack, Skeleton } from "@chakra-ui/react";

export interface LoadingStateProps {
  rows?: number;
  type?: "table" | "card" | "list";
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  rows = 5,
  type = "table",
}) => {
  if (type === "card") {
    return (
      <Box
        display="grid"
        gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap="4"
        w="full"
      >
        {Array.from({ length: rows }).map((_, i) => (
          <Card.Root key={i} variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
            <Card.Body p="4">
              <HStack justify="space-between" mb="3">
                <Skeleton h="16px" w="45%" borderRadius="lg" />
                <Skeleton h="16px" w="50px" borderRadius="full" />
              </HStack>
              <Skeleton h="12px" w="75%" mb="2" borderRadius="md" />
              <Skeleton h="12px" w="60%" mb="4" borderRadius="md" />
              <HStack justify="space-between" pt="3" borderTopWidth="1px" borderColor="border.subtle">
                <Skeleton h="14px" w="60px" borderRadius="md" />
                <Skeleton h="24px" w="70px" borderRadius="full" />
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </Box>
    );
  }

  // Table skeleton fallback
  return (
    <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none" overflow="hidden" w="full">
      {/* Header bar */}
      <HStack px="4" py="3" bg="bg.subtle" borderBottomWidth="1px" borderColor="border.subtle" gap="4">
        <Skeleton h="14px" w="25%" borderRadius="md" />
        <Skeleton h="14px" w="20%" borderRadius="md" />
        <Skeleton h="14px" w="25%" borderRadius="md" />
        <Skeleton h="14px" w="15%" borderRadius="md" />
        <Skeleton h="14px" w="10%" ml="auto" borderRadius="md" />
      </HStack>

      {/* Row skeletons */}
      <VStack gap="0" align="stretch">
        {Array.from({ length: rows }).map((_, i) => (
          <HStack
            key={i}
            px="4"
            py="3.5"
            borderBottomWidth={i === rows - 1 ? "0px" : "1px"}
            borderColor="border.subtle"
            gap="4"
          >
            <Skeleton h="14px" w="28%" borderRadius="md" />
            <Skeleton h="14px" w="18%" borderRadius="md" />
            <Skeleton h="14px" w="22%" borderRadius="md" />
            <Skeleton h="14px" w="14%" borderRadius="md" />
            <Skeleton h="14px" w="8%" ml="auto" borderRadius="md" />
          </HStack>
        ))}
      </VStack>
    </Card.Root>
  );
};

export default LoadingState;
