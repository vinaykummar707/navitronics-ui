import React, { useState, useEffect } from "react";
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
  Avatar,
  Field,
  Progress,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "@/supabaseClient";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RotateCcw,
} from "lucide-react";

// Password strength evaluator
function calculateStrength(pwd: string): { score: number; label: string; colorPalette: string } {
  if (!pwd) return { score: 0, label: "Empty", colorPalette: "gray" };

  let score = 0;
  if (pwd.length >= 8) score += 25;
  if (pwd.length >= 12) score += 15;
  if (/[A-Z]/.test(pwd)) score += 20;
  if (/[a-z]/.test(pwd)) score += 15;
  if (/[0-9]/.test(pwd)) score += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 10;

  if (score < 40) return { score, label: "Weak", colorPalette: "red" };
  if (score < 70) return { score, label: "Fair", colorPalette: "amber" };
  if (score < 90) return { score, label: "Good", colorPalette: "blue" };
  return { score: 100, label: "Strong", colorPalette: "green" };
}

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password cannot exceed 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password")
      .max(100, "Password cannot exceed 100 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match. Please re-enter your password.",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const enteredPassword = watch("password") || "";
  const strength = calculateStrength(enteredPassword);

  // Check for recovery session from URL hash or Supabase event
  useEffect(() => {
    let mounted = true;

    // Check if recovery tokens are in hash
    const hash = window.location.hash;
    const isRecoveryHash = hash.includes("type=recovery") || hash.includes("access_token");

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          if (session || isRecoveryHash) {
            setIsSessionValid(true);
          } else {
            // Allow grace period for hash parsing
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (mounted) {
                if (retrySession) {
                  setIsSessionValid(true);
                } else {
                  setIsSessionValid(false);
                  setSessionError("No valid password recovery token was found. Your link may have expired or already been used.");
                }
              }
            }, 1000);
          }
        }
      } catch (err: any) {
        if (mounted) {
          setIsSessionValid(false);
          setSessionError(err.message || "Failed to verify password reset token.");
        }
      }
    };

    checkSession();

    // Listen for auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (mounted) setIsSessionValid(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [location]);

  const onSubmit = async (values: ResetFormData) => {
    setApiError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success("Your password has been successfully updated!");
    } catch (err: any) {
      const msg = err.message || "Failed to update password. Please try again.";
      setApiError(msg);
      toast.error(msg);
    }
  };

  return (
    <Flex minH="100vh" w="full" bg="bg.subtle" color="fg.default" align="center" justify="center" p={{ base: "4", sm: "6" }}>
      <Box w="full" maxW="440px">
        {/* Top Branding Header */}
        <VStack align="center" gap="2" mb="6">
          <Avatar.Root size="md" shape="rounded" borderWidth="1px" borderColor="border.subtle" bg="bg.panel">
            <Avatar.Image src="https://navitronix.in/assets/navitronix.jpeg" />
            <Avatar.Fallback name="Navitronix">NX</Avatar.Fallback>
          </Avatar.Root>
          <Text fontSize="lg" fontWeight="700" color="fg.default">
            Navitronix Transit Cloud
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Enterprise Security & Credentials Configuration
          </Text>
        </VStack>

        <Card.Root
          size="md"
          variant="outline"
          bg="bg.panel"
          borderColor="border.default"
          borderRadius="md"
          boxShadow="sm"
          p={{ base: "6", sm: "8" }}
        >
          <Card.Body p="0">
            {isSuccess ? (
              /* Success State */
              <VStack align="stretch" gap="5" textAlign="center">
                <Box
                  w="48px"
                  h="48px"
                  borderRadius="full"
                  bg="green.subtle"
                  color="green.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                >
                  <CheckCircle2 size={26} />
                </Box>
                <VStack gap="1">
                  <Text fontSize="lg" fontWeight="700" color="fg.default">
                    Password Updated!
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Your enterprise credentials have been changed successfully. You can now sign in with your new password.
                  </Text>
                </VStack>

                <Button
                  colorPalette="blue"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  <HStack gap="2">
                    <Text>Return to Sign In</Text>
                    <ArrowRight size={14} />
                  </HStack>
                </Button>
              </VStack>
            ) : isSessionValid === false ? (
              /* Expired / Invalid Token State */
              <VStack align="stretch" gap="5" textAlign="center">
                <Box
                  w="48px"
                  h="48px"
                  borderRadius="full"
                  bg="red.subtle"
                  color="red.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                >
                  <AlertTriangle size={24} />
                </Box>
                <VStack gap="1">
                  <Text fontSize="md" fontWeight="700" color="fg.default">
                    Invalid or Expired Link
                  </Text>
                  <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                    {sessionError || "This recovery authorization token is invalid or has expired. Please return to the login screen and request a new password recovery link."}
                  </Text>
                </VStack>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  <HStack gap="2">
                    <RotateCcw size={14} />
                    <Text>Back to Sign In</Text>
                  </HStack>
                </Button>
              </VStack>
            ) : (
              /* Password Reset Form */
              <VStack align="stretch" gap="5">
                <VStack align="start" gap="1">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="lg" fontWeight="700" color="fg.default">
                      Create New Password
                    </Text>
                    <Badge colorPalette="gray">
                      Recovery
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="fg.muted">
                    Configure a strong password for your operator account.
                  </Text>
                </VStack>

                {apiError && (
                  <Box
                    p="3"
                    bg="red.subtle"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="red.muted"
                  >
                    <HStack align="flex-start" gap="2.5">
                      <AlertTriangle size={15} color="var(--chakra-colors-red-600)" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <Text fontSize="xs" color="red.fg" lineHeight="1.4">
                        {apiError}
                      </Text>
                    </HStack>
                  </Box>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack align="stretch" gap="4">
                    {/* New Password */}
                    <Field.Root invalid={!!errors.password}>
                      <Field.Label fontSize="xs" fontWeight="500" color="fg.default">
                        New Password
                      </Field.Label>
                      <Box position="relative" w="full">
                        <Box
                          position="absolute"
                          left="3"
                          top="50%"
                          transform="translateY(-50%)"
                          color="fg.muted"
                          pointerEvents="none"
                          zIndex={1}
                        >
                          <Lock size={15} />
                        </Box>
                        <Input
                          {...register("password")}
                          placeholder="Min 8 chars, mixed case, numbers"
                          type={showPassword ? "text" : "password"}
                          size="sm"
                          pl="9"
                          pr="9"
                          maxLength={100}
                          bg="bg.subtle"
                          color="fg.default"
                          borderColor={errors.password ? "red.500" : "border.default"}
                          _placeholder={{ color: "fg.subtle" }}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                            bg: "bg.panel",
                          }}
                          disabled={isSubmitting}
                          autoFocus
                        />
                        <IconButton
                          type="button"
                          size="xs"
                          variant="ghost"
                          position="absolute"
                          right="1"
                          top="50%"
                          transform="translateY(-50%)"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          color="fg.muted"
                          _hover={{ color: "fg.default", bg: "transparent" }}
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </IconButton>
                      </Box>
                      {errors.password?.message && (
                        <Field.ErrorText fontSize="xs" color="red.500" mt="1">
                          {errors.password.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Password Strength Meter */}
                    {enteredPassword && (
                      <VStack align="stretch" gap="1" p="2" bg="bg.subtle" borderRadius="md">
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="fg.muted">
                            Password Strength
                          </Text>
                          <Text fontSize="xs" fontWeight="600" color={`${strength.colorPalette}.600`}>
                            {strength.label}
                          </Text>
                        </HStack>
                        <Progress.Root value={strength.score} size="xs" colorPalette={strength.colorPalette as any}>
                          <Progress.Track bg="bg.muted" h="4px">
                            <Progress.Range borderRadius="full" />
                          </Progress.Track>
                        </Progress.Root>
                      </VStack>
                    )}

                    {/* Confirm Password */}
                    <Field.Root invalid={!!errors.confirmPassword}>
                      <Field.Label fontSize="xs" fontWeight="500" color="fg.default">
                        Confirm New Password
                      </Field.Label>
                      <Box position="relative" w="full">
                        <Box
                          position="absolute"
                          left="3"
                          top="50%"
                          transform="translateY(-50%)"
                          color="fg.muted"
                          pointerEvents="none"
                          zIndex={1}
                        >
                          <Lock size={15} />
                        </Box>
                        <Input
                          {...register("confirmPassword")}
                          placeholder="Re-enter your new password"
                          type={showConfirmPassword ? "text" : "password"}
                          size="sm"
                          pl="9"
                          pr="9"
                          maxLength={100}
                          bg="bg.subtle"
                          color="fg.default"
                          borderColor={errors.confirmPassword ? "red.500" : "border.default"}
                          _placeholder={{ color: "fg.subtle" }}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                            bg: "bg.panel",
                          }}
                          disabled={isSubmitting}
                        />
                        <IconButton
                          type="button"
                          size="xs"
                          variant="ghost"
                          position="absolute"
                          right="1"
                          top="50%"
                          transform="translateY(-50%)"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          color="fg.muted"
                          _hover={{ color: "fg.default", bg: "transparent" }}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </IconButton>
                      </Box>
                      {errors.confirmPassword?.message && (
                        <Field.ErrorText fontSize="xs" color="red.500" mt="1">
                          {errors.confirmPassword.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      colorPalette="blue"
                      size="sm"
                      mt="2"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      <HStack gap="2">
                        <Text>Update Password</Text>
                        <ArrowRight size={14} />
                      </HStack>
                    </Button>
                  </VStack>
                </form>
              </VStack>
            )}

            <Box pt="4" mt="5" borderTopWidth="1px" borderColor="border.subtle" textAlign="center">
              <HStack justify="center" gap="1.5" color="fg.muted" fontSize="xs">
                <ShieldCheck size={14} color="var(--chakra-colors-green-600)" />
                <Text>Navitronix End-to-End Cryptographic Security</Text>
              </HStack>
            </Box>
          </Card.Body>
        </Card.Root>
      </Box>
    </Flex>
  );
}
