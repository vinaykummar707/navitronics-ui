import React from "react";
import { Card, Box, VStack, Button } from "@chakra-ui/react";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
}) => {
  return (
    <Card.Root variant="outline" bg="bg.panel" w="full" borderColor="border.default">
      <Card.Body py={{ base: "12", md: "16" }} px="6" textAlign="center">
        <VStack gap="3" maxW="sm" mx="auto">
          <Box
            w="44px"
            h="44px"
            borderRadius="md"
            bg="bg.subtle"
            borderWidth="1px"
            borderColor="border.subtle"
            color="fg.muted"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {icon || <Inbox size={22} />}
          </Box>

          <VStack gap="1">
            <Card.Title fontSize="sm" fontWeight="600" color="fg.default">
              {title}
            </Card.Title>
            <Card.Description fontSize="xs" color="fg.muted" lineHeight="1.5">
              {description}
            </Card.Description>
          </VStack>

          {(actionLabel || secondaryAction) && (
            <Box pt="2" display="flex" gap="2" alignItems="center">
              {actionLabel && onAction && (
                <Button
                  size="sm"
                  colorPalette="blue"
                  onClick={onAction}
                >
                  {actionLabel}
                </Button>
              )}
              {secondaryAction}
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export default EmptyState;
