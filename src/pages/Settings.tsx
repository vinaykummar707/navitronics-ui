import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Button,
  Tabs,
  SimpleGrid,
  Badge,
  Input,
  NativeSelect,
} from "@chakra-ui/react";
import PageHeader from "@/components/common/PageHeader";
import {
  Settings as SettingsIcon,
  Sliders,
  Tv,
  Radio,
  Bell,
  Save,
  RotateCw,
  CheckCircle2,
  Shield,
  Clock,
  Volume2,
} from "lucide-react";
import { toast } from "react-toastify";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [telemetryInterval, setTelemetryInterval] = useState("10");
  const [signageBrightness, setSignageBrightness] = useState("85");
  const [chimeVolume, setChimeVolume] = useState("75");
  const [defaultLanguage, setDefaultLanguage] = useState("en-IN");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("System configurations saved successfully");
    }, 600);
  };

  return (
    <Box w="full">
      {/* 1. Page Header */}
      <PageHeader
        title="System Preferences & Settings"
        description="Configure fleet telemetry parameters, digital signage display engines, and agency-wide system defaults."
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Settings" },
        ]}
        badge="Configured"
        badgeColorPalette="blue"
        actions={
          <HStack gap="2">
            <Button
              size="sm"
              variant="outline"
              borderRadius="full"
              onClick={() => toast.info("Settings reloaded from controller")}
            >
              <RotateCw size={14} />
              Reload
            </Button>
            <Button
              size="sm"
              colorPalette="blue"
              borderRadius="full"
              loading={isSaving}
              onClick={handleSave}
            >
              <Save size={14} />
              Save Changes
            </Button>
          </HStack>
        }
      />

      {/* 2. Settings Tabs Navigation */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value)}
        variant="subtle"
        size="sm"
        mb="6"
      >
        <Tabs.List bg="bg.panel" p="1" borderRadius="full" borderWidth="1px" borderColor="border.subtle" shadow="none" boxShadow="none">
          <Tabs.Trigger value="general" borderRadius="full">
            <HStack gap="1.5">
              <Sliders size={13} />
              <Text>General System</Text>
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="signage" borderRadius="full">
            <HStack gap="1.5">
              <Tv size={13} />
              <Text>PIS Displays</Text>
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="telemetry" borderRadius="full">
            <HStack gap="1.5">
              <Radio size={13} />
              <Text>ITMS Telemetry</Text>
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="notifications" borderRadius="full">
            <HStack gap="1.5">
              <Bell size={13} />
              <Text>Notifications</Text>
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {/* 3. Tab Contents */}
      {activeTab === "general" && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
            <Card.Header p="4" pb="2">
              <HStack gap="2">
                <Box p="2" borderRadius="xl" bg="blue.subtle" color="blue.fg">
                  <Clock size={16} />
                </Box>
                <VStack align="start" gap="0">
                  <Card.Title fontSize="sm" fontWeight="700">Localization & Clock</Card.Title>
                  <Card.Description fontSize="xs">Set operational timezone and regional conventions</Card.Description>
                </VStack>
              </HStack>
            </Card.Header>
            <Card.Body p="4" pt="2">
              <VStack gap="3" align="stretch">
                <Box>
                  <Text fontSize="xs" fontWeight="600" mb="1" color="fg.muted">System Time Zone</Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      borderRadius="full"
                      bg="bg.subtle"
                    >
                      <option value="Asia/Kolkata">IST (Indian Standard Time UTC+05:30)</option>
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="600" mb="1" color="fg.muted">Default Operational Locale</Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={defaultLanguage}
                      onChange={(e) => setDefaultLanguage(e.target.value)}
                      borderRadius="full"
                      bg="bg.subtle"
                    >
                      <option value="en-IN">English (India)</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                      <option value="mr-IN">Marathi (मराठी)</option>
                      <option value="ta-IN">Tamil (தமிழ்)</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
            <Card.Header p="4" pb="2">
              <HStack gap="2">
                <Box p="2" borderRadius="xl" bg="purple.subtle" color="purple.fg">
                  <Shield size={16} />
                </Box>
                <VStack align="start" gap="0">
                  <Card.Title fontSize="sm" fontWeight="700">Security & Authentication</Card.Title>
                  <Card.Description fontSize="xs">Access security policies and session timeouts</Card.Description>
                </VStack>
              </HStack>
            </Card.Header>
            <Card.Body p="4" pt="2">
              <VStack gap="3" align="stretch">
                <HStack justify="space-between" p="2.5" bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                  <VStack align="start" gap="0">
                    <Text fontSize="xs" fontWeight="600">Console Session Timeout</Text>
                    <Text fontSize="xs" color="fg.muted">Auto logout inactive operators</Text>
                  </VStack>
                  <Badge colorPalette="purple" borderRadius="full" px="2.5">60 Minutes</Badge>
                </HStack>
                <HStack justify="space-between" p="2.5" bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                  <VStack align="start" gap="0">
                    <Text fontSize="xs" fontWeight="600">Controller API Key Status</Text>
                    <Text fontSize="xs" color="fg.muted">Hardware bus sign synchronization</Text>
                  </VStack>
                  <Badge colorPalette="green" borderRadius="full" px="2.5">
                    <HStack gap="1">
                      <CheckCircle2 size={12} />
                      <Text>Operational</Text>
                    </HStack>
                  </Badge>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      )}

      {activeTab === "signage" && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
            <Card.Header p="4" pb="2">
              <HStack gap="2">
                <Box p="2" borderRadius="xl" bg="cyan.subtle" color="cyan.fg">
                  <Tv size={16} />
                </Box>
                <VStack align="start" gap="0">
                  <Card.Title fontSize="sm" fontWeight="700">LED / LCD Sign Boards</Card.Title>
                  <Card.Description fontSize="xs">Display brightness and cycling intervals</Card.Description>
                </VStack>
              </HStack>
            </Card.Header>
            <Card.Body p="4" pt="2">
              <VStack gap="3" align="stretch">
                <Box>
                  <HStack justify="space-between" mb="1">
                    <Text fontSize="xs" fontWeight="600" color="fg.muted">Default Brightness Level</Text>
                    <Badge colorPalette="cyan" borderRadius="full" px="2">{signageBrightness}%</Badge>
                  </HStack>
                  <Input
                    size="sm"
                    type="range"
                    min="10"
                    max="100"
                    value={signageBrightness}
                    onChange={(e) => setSignageBrightness(e.target.value)}
                  />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="600" mb="1" color="fg.muted">Language Toggle Cycle (Seconds)</Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field defaultValue="4" borderRadius="full" bg="bg.subtle">
                      <option value="2">2 seconds per language</option>
                      <option value="4">4 seconds per language</option>
                      <option value="6">6 seconds per language</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
            <Card.Header p="4" pb="2">
              <HStack gap="2">
                <Box p="2" borderRadius="xl" bg="orange.subtle" color="orange.fg">
                  <Volume2 size={16} />
                </Box>
                <VStack align="start" gap="0">
                  <Card.Title fontSize="sm" fontWeight="700">Public Address Audio (PAS)</Card.Title>
                  <Card.Description fontSize="xs">In-bus speaker volume and chime alerts</Card.Description>
                </VStack>
              </HStack>
            </Card.Header>
            <Card.Body p="4" pt="2">
              <VStack gap="3" align="stretch">
                <Box>
                  <HStack justify="space-between" mb="1">
                    <Text fontSize="xs" fontWeight="600" color="fg.muted">Announcement Volume</Text>
                    <Badge colorPalette="orange" borderRadius="full" px="2">{chimeVolume}%</Badge>
                  </HStack>
                  <Input
                    size="sm"
                    type="range"
                    min="0"
                    max="100"
                    value={chimeVolume}
                    onChange={(e) => setChimeVolume(e.target.value)}
                  />
                </Box>
                <HStack justify="space-between" p="2.5" bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                  <VStack align="start" gap="0">
                    <Text fontSize="xs" fontWeight="600">Next-Stop Approach Chime</Text>
                    <Text fontSize="xs" color="fg.muted">Play 2-tone melodic alert before speech</Text>
                  </VStack>
                  <Badge colorPalette="green" borderRadius="full" px="2.5">Enabled</Badge>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      )}

      {activeTab === "telemetry" && (
        <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
          <Card.Header p="4" pb="2">
            <HStack gap="2">
              <Box p="2" borderRadius="xl" bg="purple.subtle" color="purple.fg">
                <Radio size={16} />
              </Box>
              <VStack align="start" gap="0">
                <Card.Title fontSize="sm" fontWeight="700">GPS AVL Telemetry Transmission</Card.Title>
                <Card.Description fontSize="xs">Telemetry packet rate from bus controllers to cloud dispatch</Card.Description>
              </VStack>
            </HStack>
          </Card.Header>
          <Card.Body p="4" pt="2">
            <VStack gap="3" align="stretch" maxW="lg">
              <Box>
                <HStack justify="space-between" mb="1">
                  <Text fontSize="xs" fontWeight="600" color="fg.muted">Packet Transmission Interval</Text>
                  <Badge colorPalette="purple" borderRadius="full" px="2.5">{telemetryInterval} seconds</Badge>
                </HStack>
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    value={telemetryInterval}
                    onChange={(e) => setTelemetryInterval(e.target.value)}
                    borderRadius="full"
                    bg="bg.subtle"
                  >
                    <option value="5">5 Seconds (Real-time high density)</option>
                    <option value="10">10 Seconds (Standard recommendation)</option>
                    <option value="30">30 Seconds (Low bandwidth)</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {activeTab === "notifications" && (
        <Card.Root variant="outline" bg="bg.panel" borderColor="border.subtle" borderRadius="2xl" shadow="none" boxShadow="none">
          <Card.Header p="4" pb="2">
            <HStack gap="2">
              <Box p="2" borderRadius="xl" bg="blue.subtle" color="blue.fg">
                <Bell size={16} />
              </Box>
              <VStack align="start" gap="0">
                <Card.Title fontSize="sm" fontWeight="700">Operational Broadcast Alerts</Card.Title>
                <Card.Description fontSize="xs">Configure alert dispatch preferences</Card.Description>
              </VStack>
            </HStack>
          </Card.Header>
          <Card.Body p="4" pt="2">
            <VStack gap="2.5" align="stretch">
              <HStack justify="space-between" p="3" bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                <VStack align="start" gap="0">
                  <Text fontSize="xs" fontWeight="600">Bus Controller Disconnect Alert</Text>
                  <Text fontSize="xs" color="fg.muted">Notify depot manager if device ceases heartbeat for &gt; 5 min</Text>
                </VStack>
                <Badge colorPalette="green" borderRadius="full" px="2.5">Enabled</Badge>
              </HStack>
              <HStack justify="space-between" p="3" bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                <VStack align="start" gap="0">
                  <Text fontSize="xs" fontWeight="600">Route Waypoint Deviation Notice</Text>
                  <Text fontSize="xs" color="fg.muted">Flag driver routes departing from scheduled corridor</Text>
                </VStack>
                <Badge colorPalette="green" borderRadius="full" px="2.5">Enabled</Badge>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </Box>
  );
};

export default Settings;
