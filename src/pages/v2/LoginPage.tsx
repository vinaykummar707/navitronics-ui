import React, { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  IconButton,
  Input,
  Card,
  Field,
  Avatar,
  Separator,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/supabaseClient";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { ILoggedUser } from "@/types/IUser";
import { ResetPasswordDialog } from "@/components/auth/ResetPasswordDialog";

// Senior QA Input Validation Schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .max(100, "Email address cannot exceed 100 characters")
    .email("Please enter a valid work email address")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useLoggedUserStore((state) => state.login);
  const logout = useLoggedUserStore((state) => state.logout);
  const { setSelectedOrganization } = useOrganizationStore((state) => state);

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const enteredEmail = watch("email");

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      // 1. Authenticate credentials with Supabase
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authErr) {
        if (authErr.message.toLowerCase().includes("invalid login credentials")) {
          throw new Error("Invalid work email or password. Please verify your credentials and try again.");
        }
        if (authErr.message.toLowerCase().includes("email not confirmed")) {
          throw new Error("Your email has not been confirmed yet. Please verify your inbox.");
        }
        if (authErr.message.toLowerCase().includes("rate limit") || authErr.status === 429) {
          throw new Error("Too many sign-in attempts. For security, please wait a few minutes before trying again.");
        }
        throw authErr;
      }

      const user = authData?.user;
      if (!user) {
        throw new Error("Authentication succeeded but no operator session was returned.");
      }

      // 2. Fetch operator profile with role, agency, region, depot relations
      const { data: userProfile, error: profileErr } = await supabase
        .from("users")
        .select(`
          *,
          region:region_id (*),
          organization:organization_id (*),
          depot:depot_id (*),
          role:role_id (*)
        `)
        .eq("user_id", user.id)
        .single();

      if (profileErr || !userProfile) {
        await supabase.auth.signOut();
        throw new Error("Unable to retrieve operator profile details. Please contact your administrator.");
      }

      const userData = userProfile as ILoggedUser;

      // 3. QA Guard: Deactivated/Archived User Account
      if (userData.active === false || userData.deleted === true) {
        await supabase.auth.signOut();
        logout();
        throw new Error("Your account has been deactivated or archived. Please contact your transit administrator.");
      }

      // 4. QA Guard: Inactive Transit Agency
      if (!userData.organization || userData.organization.active === false) {
        await supabase.auth.signOut();
        logout();
        throw new Error("Your assigned transit organization is currently inactive. Please contact support.");
      }

      // 5. Success: Commit to Zustand store & navigate to console
      login(userData);
      setSelectedOrganization(userData.organization);
      toast.success(`Welcome back, ${userData.name || "Operator"}!`);
      navigate("/home");
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred during sign-in. Please try again.";
      setAuthError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <Flex
      minH="100vh"
      w="full"
      bg="#0b0f19"
      color="fg.default"
      direction="column"
      justify="space-between"
      align="stretch"
    >
      {/* 1. TOP MINIMAL SYSTEM NAVIGATION BAR */}
      <Flex
        as="header"
        w="full"
        h="60px"
        px={{ base: "4", sm: "6", md: "10" }}
        align="center"
        justify="space-between"
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        bg="#0b0f19"
      >
        <HStack gap="3" align="center">
          <Avatar.Root size="sm" shape="rounded" borderWidth="1px" borderColor="whiteAlpha.200" bg="#1e293b">
            <Avatar.Image src="https://navitronix.in/assets/navitronix.jpeg" />
            <Avatar.Fallback name="Navitronix">NX</Avatar.Fallback>
          </Avatar.Root>
          <HStack gap="2" align="baseline">
            <Text fontSize="sm" fontWeight="700" color="white" letterSpacing="-0.01em">
              Navitronix
            </Text>
            <Text fontSize="xs" color="gray.400" display={{ base: "none", sm: "inline" }}>
              Transit Cloud
            </Text>
          </HStack>
          <Badge size="xs" colorPalette="gray" variant="subtle" borderRadius="xs" display={{ base: "none", md: "inline-flex" }}>
            v2.4
          </Badge>
        </HStack>

        <HStack gap="3" align="center">
          <HStack
            gap="2"
            px="2.5"
            py="1"
            bg="whiteAlpha.50"
            borderRadius="full"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <Box w="6px" h="6px" borderRadius="full" bg="green.400" />
            <Text fontSize="11px" fontWeight="500" color="gray.300">
              Systems Operational
            </Text>
          </HStack>
          <Text fontSize="11px" color="gray.400" fontFamily="mono" display={{ base: "none", sm: "inline" }}>
            ~38ms
          </Text>
        </HStack>
      </Flex>

      {/* 2. CENTERED ENTERPRISE AUTHENTICATION CARD */}
      <Flex
        as="main"
        flex="1"
        align="center"
        justify="center"
        p={{ base: "4", sm: "6", md: "8" }}
      >
        <Box w="full" maxW="440px">
          <Card.Root
            size="md"
            variant="outline"
            bg="#111827"
            borderColor="whiteAlpha.200"
            borderRadius="md"
            boxShadow="sm"
            p={{ base: "6", sm: "8" }}
          >
            <Card.Body p="0">
              <VStack align="stretch" gap="6">
                {/* Header Title & Identity */}
                <VStack align="start" gap="2">
                  <HStack justify="space-between" w="full" align="center">
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="sm"
                      bg="whiteAlpha.100"
                      color="blue.400"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <KeyRound size={18} />
                    </Box>
                    <Badge size="xs" colorPalette="gray" variant="subtle" borderRadius="xs">
                      Operator Gateway
                    </Badge>
                  </HStack>
                  <VStack align="start" gap="1">
                    <Text fontSize="xl" fontWeight="700" color="white" letterSpacing="-0.01em">
                      Sign In to Console
                    </Text>
                    <Text fontSize="xs" color="gray.400" lineHeight="1.5">
                      Enter your enterprise credentials to access fleet telemetry, display matrix controllers, and dispatch schedules.
                    </Text>
                  </VStack>
                </VStack>

                {/* Error Banner */}
                {authError && (
                  <Box
                    p="3"
                    bg="red.500/10"
                    borderRadius="sm"
                    borderWidth="1px"
                    borderColor="red.500/20"
                  >
                    <HStack align="flex-start" gap="2.5">
                      <AlertTriangle size={16} color="var(--chakra-colors-red-400)" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <Text fontSize="xs" color="red.300" lineHeight="1.4">
                        {authError}
                      </Text>
                    </HStack>
                  </Box>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack align="stretch" gap="4">
                    {/* Work Email */}
                    <Field.Root invalid={!!errors.email}>
                      <Field.Label fontSize="xs" fontWeight="500" color="gray.300">
                        Work Email
                      </Field.Label>
                      <Box position="relative" w="full">
                        <Box
                          position="absolute"
                          left="3"
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                          pointerEvents="none"
                          zIndex={1}
                        >
                          <Mail size={15} />
                        </Box>
                        <Input
                          {...register("email")}
                          placeholder="operator@transit.gov"
                          type="email"
                          autoComplete="email"
                          size="sm"
                          pl="9"
                          maxLength={100}
                          borderRadius="sm"
                          bg="whiteAlpha.50"
                          color="white"
                          borderColor={errors.email ? "red.500" : "whiteAlpha.200"}
                          _placeholder={{ color: "gray.500" }}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                            bg: "whiteAlpha.100",
                          }}
                          disabled={isSubmitting}
                          autoFocus
                        />
                      </Box>
                      {errors.email?.message && (
                        <Field.ErrorText fontSize="11px" color="red.400" mt="1">
                          {errors.email.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Password */}
                    <Field.Root invalid={!!errors.password}>
                      <Flex justify="space-between" align="center" w="full">
                        <Field.Label fontSize="xs" fontWeight="500" color="gray.300" m="0">
                          Password
                        </Field.Label>
                        <Button
                          type="button"
                          variant="plain"
                          size="2xs"
                          color="blue.400"
                          _hover={{ color: "blue.300", textDecoration: "underline" }}
                          onClick={() => setResetDialogOpen(true)}
                          disabled={isSubmitting}
                          tabIndex={-1}
                          p="0"
                          h="auto"
                        >
                          Forgot Password?
                        </Button>
                      </Flex>
                      <Box position="relative" w="full">
                        <Box
                          position="absolute"
                          left="3"
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                          pointerEvents="none"
                          zIndex={1}
                        >
                          <Lock size={15} />
                        </Box>
                        <Input
                          {...register("password")}
                          placeholder="••••••••••••"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          size="sm"
                          pl="9"
                          pr="9"
                          maxLength={100}
                          borderRadius="sm"
                          bg="whiteAlpha.50"
                          color="white"
                          borderColor={errors.password ? "red.500" : "whiteAlpha.200"}
                          _placeholder={{ color: "gray.500" }}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                            bg: "whiteAlpha.100",
                          }}
                          disabled={isSubmitting}
                        />
                        <IconButton
                          type="button"
                          size="2xs"
                          variant="ghost"
                          position="absolute"
                          right="2"
                          top="50%"
                          transform="translateY(-50%)"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          color="gray.400"
                          _hover={{ color: "white", bg: "transparent" }}
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </IconButton>
                      </Box>
                      {errors.password?.message && (
                        <Field.ErrorText fontSize="11px" color="red.400" mt="1">
                          {errors.password.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Submit Button with Keyboard Hint */}
                    <Button
                      type="submit"
                      colorPalette="blue"
                      size="sm"
                      h="38px"
                      mt="2"
                      borderRadius="sm"
                      fontWeight="600"
                      fontSize="xs"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <HStack gap="2" justify="center">
                        <Text>Sign In to Console</Text>
                        <Box
                          as="span"
                          display="inline-flex"
                          alignItems="center"
                          justifyContent="center"
                          px="1.5"
                          py="0.5"
                          bg="whiteAlpha.200"
                          borderRadius="xs"
                          fontSize="10px"
                          lineHeight="1"
                        >
                          ↵
                        </Box>
                      </HStack>
                    </Button>
                  </VStack>
                </form>

                {/* Single-Tenant Security Notice */}
                <Box pt="4" borderTopWidth="1px" borderColor="whiteAlpha.100" textAlign="center">
                  <HStack justify="center" gap="1.5" color="gray.400" fontSize="11px">
                    <ShieldCheck size={13} color="var(--chakra-colors-green-400)" />
                    <Text>Cryptographic Identity & Access Control</Text>
                  </HStack>
                  <Text fontSize="10px" color="gray.400" mt="1">
                    Single-tenant authenticated session. Operator actions are audited per transit security policies.
                  </Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Box>
      </Flex>

      {/* 3. BOTTOM TELEMETRY & COMPLIANCE STRIP */}
      <Flex
        as="footer"
        w="full"
        px={{ base: "4", sm: "6", md: "10" }}
        py="3"
        align="center"
        justify="space-between"
        borderTopWidth="1px"
        borderColor="whiteAlpha.100"
        bg="#0b0f19"
        direction={{ base: "column", sm: "row" }}
        gap="2"
      >
        <Text fontSize="11px" color="gray.400">
          Navitronix Systems India Pvt Ltd • All rights reserved
        </Text>

        <HStack gap="4" fontSize="11px" color="gray.400" wrap="wrap" justify="center">
          <HStack gap="1.5">
            <Box w="5px" h="5px" borderRadius="full" bg="blue.400" />
            <Text>TLS 1.3 Active</Text>
          </HStack>
          <Separator orientation="vertical" h="12px" borderColor="whiteAlpha.200" />
          <HStack gap="1.5">
            <Box w="5px" h="5px" borderRadius="full" bg="blue.400" />
            <Text>ISO 27001 Certified</Text>
          </HStack>
          <Separator orientation="vertical" h="12px" borderColor="whiteAlpha.200" display={{ base: "none", md: "block" }} />
          <Text display={{ base: "none", md: "inline" }}>Region: ap-south-1</Text>
        </HStack>
      </Flex>

      {/* Reset Password Modal */}
      <ResetPasswordDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        defaultEmail={enteredEmail || ""}
      />
    </Flex>
  );
};

export default LoginPage;
