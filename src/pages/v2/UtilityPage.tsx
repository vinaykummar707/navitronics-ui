import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Button,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import PageHeader from "@/components/common/PageHeader";
import {
  Wrench,
  RotateCw,
  Database,
  Tv,
  Volume2,
  FileDown,
  CheckCircle2,
  Activity,
  HardDrive,
} from "lucide-react";
import { toast } from "react-toastify";

export default function UtilityPage() {
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const handleAction = (name: string, successMsg: string) => {
    setRunningAction(name);
    setTimeout(() => {
      setRunningAction(null);
      toast.success(successMsg);
    }, 750);
  };

  return (
    <Box w="full">
      {/* 1. Page Header */}
      <PageHeader
        title="System Utilities & Diagnostics"
        description="Diagnostic utilities, cache management, hardware signage pings, and telemetry validation tools."
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Utility" },
        ]}
        badge="Ready"
        badgeColorPalette="green"
        actions={
          <Button
            size="sm"
            variant="outline"
            borderRadius="full"
            onClick={() => toast.info("Diagnostic health check passed")}
          >
            <Activity size={14} />
            Run Diagnostics
          </Button>
        }
      />

      {/* 2. Utility Action Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        {/* Card 1: Route Cache Sync */}
        <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
          <Card.Body p="4">
            <HStack gap="3" mb="3">
              <Box p="2.5" borderRadius="xl" bg="blue.subtle" color="blue.fg">
                <Database size={18} />
              </Box>
              <VStack align="start" gap="0">
                <Card.Title fontSize="sm" fontWeight="700">Route Cache Synchronization</Card.Title>
                <Card.Description fontSize="xs">Local indexed query buffer</Card.Description>
              </VStack>
            </HStack>
            <Text fontSize="xs" color="fg.muted" mb="4" lineHeight="1.5">
              Force-refresh client route cache and invalidate stale itinerary nodes stored across browser memory.
            </Text>
            <HStack justify="space-between" align="center" pt="2" borderTopWidth="1px" borderColor="border.subtle">
              <Badge colorPalette="green" borderRadius="full" px="2.5">
                <HStack gap="1">
                  <CheckCircle2 size={12} />
                  <Text>Synchronized</Text>
                </HStack>
              </Badge>
              <Button
                size="xs"
                variant="subtle"
                colorPalette="blue"
                borderRadius="full"
                loading={runningAction === "cache"}
                onClick={() => handleAction("cache", "Route cache purged and re-indexed")}
              >
                <RotateCw size={12} />
                Purge &amp; Sync
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Card 2: PIS Hardware Ping */}
        <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
          <Card.Body p="4">
            <HStack gap="3" mb="3">
              <Box p="2.5" borderRadius="xl" bg="cyan.subtle" color="cyan.fg">
                <Tv size={18} />
              </Box>
              <VStack align="start" gap="0">
                <Card.Title fontSize="sm" fontWeight="700">PIS Display Sign Boards</Card.Title>
                <Card.Description fontSize="xs">LED Matrix controller broadcast</Card.Description>
              </VStack>
            </HStack>
            <Text fontSize="xs" color="fg.muted" mb="4" lineHeight="1.5">
              Send test keep-alive frame packets to all online depot destination boards and front LED signage displays.
            </Text>
            <HStack justify="space-between" align="center" pt="2" borderTopWidth="1px" borderColor="border.subtle">
              <Badge colorPalette="cyan" borderRadius="full" px="2.5">Active Link</Badge>
              <Button
                size="xs"
                variant="subtle"
                colorPalette="cyan"
                borderRadius="full"
                loading={runningAction === "pis"}
                onClick={() => handleAction("pis", "LED display ping test completed")}
              >
                <Activity size={12} />
                Ping Controllers
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Card 3: Audio PAS Synthesizer Test */}
        <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
          <Card.Body p="4">
            <HStack gap="3" mb="3">
              <Box p="2.5" borderRadius="xl" bg="orange.subtle" color="orange.fg">
                <Volume2 size={18} />
              </Box>
              <VStack align="start" gap="0">
                <Card.Title fontSize="sm" fontWeight="700">PAS Audio Announcement Test</Card.Title>
                <Card.Description fontSize="xs">Indic multi-lingual speech synth</Card.Description>
              </VStack>
            </HStack>
            <Text fontSize="xs" color="fg.muted" mb="4" lineHeight="1.5">
              Generate sample audio test announcement with approach chime to verify on-board amplifier clarity.
            </Text>
            <HStack justify="space-between" align="center" pt="2" borderTopWidth="1px" borderColor="border.subtle">
              <Badge colorPalette="orange" borderRadius="full" px="2.5">Synth Ready</Badge>
              <Button
                size="xs"
                variant="subtle"
                colorPalette="orange"
                borderRadius="full"
                loading={runningAction === "audio"}
                onClick={() => handleAction("audio", "Sample audio announcement played")}
              >
                <Volume2 size={12} />
                Test Chime
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Card 4: Hardware Telemetry Dump */}
        <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
          <Card.Body p="4">
            <HStack gap="3" mb="3">
              <Box p="2.5" borderRadius="xl" bg="purple.subtle" color="purple.fg">
                <HardDrive size={18} />
              </Box>
              <VStack align="start" gap="0">
                <Card.Title fontSize="sm" fontWeight="700">Export System Diagnostics</Card.Title>
                <Card.Description fontSize="xs">Event audit &amp; error logs</Card.Description>
              </VStack>
            </HStack>
            <Text fontSize="xs" color="fg.muted" mb="4" lineHeight="1.5">
              Download JSON bundle containing transit device pings, API network latencies, and sync discrepancies.
            </Text>
            <HStack justify="space-between" align="center" pt="2" borderTopWidth="1px" borderColor="border.subtle">
              <Badge colorPalette="purple" borderRadius="full" px="2.5">System Logs</Badge>
              <Button
                size="xs"
                variant="subtle"
                colorPalette="purple"
                borderRadius="full"
                loading={runningAction === "export"}
                onClick={() => handleAction("export", "Diagnostic log bundle exported")}
              >
                <FileDown size={12} />
                Export Logs
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  );
}
