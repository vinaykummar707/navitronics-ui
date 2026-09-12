import React from "react";
import { Card, Box, HStack, VStack, Button } from "@chakra-ui/react";
import { AlertCircle, RotateCcw } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load information",
  message = "An unexpected error occurred while communicating with the server. Please verify your connection or try again.",
  onRetry,
  actionLabel = "Try again",
}) => {
  return (
    <Card.Root variant="outline" bg="bg.panel" w="full" borderColor="red.subtle">
      <Card.Body p="6">
        <HStack gap="4" align="flex-start">
          <Box
            p="2"
            borderRadius="md"
            bg="red.subtle"
            color="red.600"
            shrink="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <AlertCircle size={18} />
          </Box>

          <VStack align="flex-start" gap="1" flex="1">
            <Card.Title fontSize="sm" fontWeight="600" color="fg.default">
              {title}
            </Card.Title>
            <Card.Description fontSize="xs" color="fg.muted" lineHeight="1.5">
              {message}
            </Card.Description>

            {onRetry && (
              <Box pt="2">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  onClick={onRetry}
                >
                  <RotateCcw size={14} />
                  {actionLabel}
                </Button>
              </Box>
            )}
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default ErrorState;
