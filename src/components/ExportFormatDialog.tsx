import React, { useState } from "react";
import {
  Dialog,
  Portal,
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  CloseButton,
  Card,
} from "@chakra-ui/react";
import { Download, FileJson, CheckCircle2 } from "lucide-react";

export interface ExportFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirmExport: (format: "v1" | "v2") => void;
}

export function ExportFormatDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirmExport,
}: ExportFormatDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<"v1" | "v2">("v1");

  const handleExport = () => {
    onConfirmExport(selectedFormat);
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.panel"
            borderColor="border.default"
            borderWidth="1px"
            borderRadius="md"
            boxShadow="xl"
            maxW="md"
            w="full"
            p="0"
            overflow="hidden"
          >
            {/* Header */}
            <Dialog.Header p="5" pb="4" borderBottomWidth="1px" borderColor="border.default">
              <HStack justify="space-between" align="center">
                <HStack gap="3">
                  <Flex
                    w="10"
                    h="10"
                    borderRadius="md"
                    bg="blue.subtle"
                    color="blue.fg"
                    align="center"
                    justify="center"
                    shrink="0"
                  >
                    <FileJson size={20} />
                  </Flex>
                  <VStack align="flex-start" gap="0.5">
                    <Dialog.Title fontSize="md" fontWeight="600" color="fg.default">
                      Export Routes
                    </Dialog.Title>
                    <HStack gap="2">
                      <Text fontSize="xs" color="fg.muted">
                        Exporting {selectedCount} route{selectedCount > 1 ? "s" : ""}
                      </Text>
                      <Badge variant="subtle" colorPalette="blue">
                        {selectedCount} Selected
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={() => onOpenChange(false)} />
                </Dialog.CloseTrigger>
              </HStack>
            </Dialog.Header>

            {/* Body */}
            <Dialog.Body p="5">
              <VStack align="stretch" gap="3">
                <Text fontSize="xs" color="fg.muted">
                  Choose the target JSON configuration format for device programming:
                </Text>

                {/* V1 Format Card */}
                <Card.Root
                  as="button"
                  type="button"
                  variant="outline"
                  p="3.5"
                  borderRadius="md"
                  borderColor={selectedFormat === "v1" ? "blue.solid" : "border.default"}
                  bg={selectedFormat === "v1" ? "blue.subtle" : "bg.subtle"}
                  cursor="pointer"
                  textAlign="left"
                  onClick={() => setSelectedFormat("v1")}
                  transition="all 0.15s ease"
                  _hover={{ borderColor: selectedFormat === "v1" ? "blue.solid" : "border.emphasized" }}
                >
                  <HStack justify="space-between" align="flex-start" w="full">
                    <VStack align="flex-start" gap="1" flex="1">
                      <HStack gap="2">
                        <Text fontSize="xs" fontWeight="600" color="fg.default">
                          V1 Portal Format
                        </Text>
                        <Badge variant="subtle" colorPalette="gray">
                          Legacy (v1.json)
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="fg.muted" lineHeight="1.4">
                        Converts route configurations to V1 schema with language-nested display payload for legacy display controllers.
                      </Text>
                    </VStack>
                    <Box color={selectedFormat === "v1" ? "blue.solid" : "fg.subtle"} mt="0.5">
                      <CheckCircle2 size={16} />
                    </Box>
                  </HStack>
                </Card.Root>

                {/* V2 Format Card */}
                <Card.Root
                  as="button"
                  type="button"
                  variant="outline"
                  p="3.5"
                  borderRadius="md"
                  borderColor={selectedFormat === "v2" ? "blue.solid" : "border.default"}
                  bg={selectedFormat === "v2" ? "blue.subtle" : "bg.subtle"}
                  cursor="pointer"
                  textAlign="left"
                  onClick={() => setSelectedFormat("v2")}
                  transition="all 0.15s ease"
                  _hover={{ borderColor: selectedFormat === "v2" ? "blue.solid" : "border.emphasized" }}
                >
                  <HStack justify="space-between" align="flex-start" w="full">
                    <VStack align="flex-start" gap="1" flex="1">
                      <HStack gap="2">
                        <Text fontSize="xs" fontWeight="600" color="fg.default">
                          V2 Portal Format
                        </Text>
                        <Badge variant="subtle" colorPalette="blue">
                          Current (v2.json)
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="fg.muted" lineHeight="1.4">
                        Exports complete modern V2 schema including multi-display LED settings, audio cues, and waypoints.
                      </Text>
                    </VStack>
                    <Box color={selectedFormat === "v2" ? "blue.solid" : "fg.subtle"} mt="0.5">
                      <CheckCircle2 size={16} />
                    </Box>
                  </HStack>
                </Card.Root>
              </VStack>
            </Dialog.Body>

            {/* Footer */}
            <Dialog.Footer
              p="4"
              bg="bg.subtle"
              borderTopWidth="1px"
              borderColor="border.default"
            >
              <HStack justify="flex-end" gap="2.5" w="full">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  colorPalette="blue"
                  onClick={handleExport}
                >
                  <Download size={14} />
                  Download Package
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default ExportFormatDialog;
