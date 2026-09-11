import React from "react";
import { Card, HStack, Box, Text } from "@chakra-ui/react";

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  iconColorPalette?: "blue" | "green" | "purple" | "amber" | "gray" | "red";
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  icon,
  iconColorPalette = "blue",
  valueColor,
}) => {
  return (
    <Card.Root size="sm" variant="outline" bg="bg.panel" borderColor="border.default">
      <Card.Body p="4">
        <HStack justify="space-between" align="flex-start" mb="2">
          <Card.Title
            fontSize="xs"
            fontWeight="600"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="0.04em"
          >
            {label}
          </Card.Title>
          {icon && (
            <Box
              w="30px"
              h="30px"
              borderRadius="sm"
              bg={`${iconColorPalette}.subtle`}
              color={`${iconColorPalette}.600`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              shrink="0"
            >
              {icon}
            </Box>
          )}
        </HStack>
        <Text
          fontSize="2xl"
          fontWeight="700"
          color={valueColor || "fg.default"}
          lineHeight="1.1"
        >
          {value}
        </Text>
        {description && (
          <Card.Description fontSize="xs" color="fg.subtle" mt="1.5">
            {description}
          </Card.Description>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default StatCard;
