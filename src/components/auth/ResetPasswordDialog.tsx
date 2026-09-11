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
  Dialog,
  Portal,
  CloseButton,
  Field,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";
import { Mail, KeyRound, CheckCircle2, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";

const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .max(100, "Email address cannot exceed 100 characters")
    .email("Please enter a valid email address")
    .transform((val) => val.trim().toLowerCase()),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  onOpenChange,
  defaultEmail = "",
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: defaultEmail },
  });

  useEffect(() => {
    if (defaultEmail) {
      setValue("email", defaultEmail);
    }
  }, [defaultEmail, setValue]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setIsSuccess(false);
      setApiError(null);
      reset({ email: defaultEmail });
    }, 200);
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setApiError(null);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        if (error.message.toLowerCase().includes("rate limit") || error.status === 429) {
          throw new Error("Too many password reset requests. Please wait a few minutes before trying again.");
        }
        throw error;
      }

      setSubmittedEmail(data.email);
      setIsSuccess(true);
      setCooldown(60); // 60-second cooldown to prevent spam
      toast.success("Password recovery link has been sent to your email.");
    } catch (err: any) {
      const msg = err.message || "Failed to send password recovery email. Please try again.";
      setApiError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog.Root
      role="dialog"
      open={open}
      onOpenChange={(e) => {
        if (!isSubmitting && !e.open) {
          handleClose();
        }
      }}
      size="sm"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.800" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.panel"
            borderColor="border.default"
            boxShadow="2xl"
            borderRadius="md"
            overflow="hidden"
            p="0"
          >
            <Dialog.Header pt="5" px="6" pb="2">
              <HStack gap="3" align="center">
                <Box
                  w="36px"
                  h="36px"
                  borderRadius="sm"
                  bg={isSuccess ? "green.subtle" : "blue.subtle"}
                  color={isSuccess ? "green.600" : "blue.fg"}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shrink="0"
                  transition="all 0.2s ease"
                >
                  {isSuccess ? <CheckCircle2 size={20} /> : <KeyRound size={20} />}
                </Box>
                <VStack align="start" gap="0">
                  <Dialog.Title fontSize="md" fontWeight="600" color="fg.default">
                    {isSuccess ? "Recovery Email Sent" : "Reset Account Password"}
                  </Dialog.Title>
                  <Dialog.Description fontSize="xs" color="fg.muted">
                    {isSuccess
                      ? "Check your inbox for password reset instructions"
                      : "Enter your registered email address to receive a recovery link"}
                  </Dialog.Description>
                </VStack>
              </HStack>
            </Dialog.Header>

            <Dialog.Body px="6" py="4">
              {isSuccess ? (
                <VStack align="stretch" gap="4">
                  <Box
                    p="3.5"
                    bg="green.subtle"
                    borderRadius="sm"
                    borderWidth="1px"
                    borderColor="green.muted"
                  >
                    <VStack align="start" gap="1.5">
                      <HStack gap="2">
                        <CheckCircle2 size={16} color="var(--chakra-colors-green-600)" />
                        <Text fontSize="xs" fontWeight="600" color="green.fg">
                          Instructions Dispatched
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                        We sent a secure recovery link to{" "}
                        <Text as="span" fontWeight="600" color="fg.default">
                          {submittedEmail}
                        </Text>
                        . Follow the link in the email to configure your new credentials.
                      </Text>
                    </VStack>
                  </Box>

                  <Box p="3" bg="bg.subtle" borderRadius="sm" borderWidth="1px" borderColor="border.subtle">
                    <Text fontSize="11px" color="fg.muted" lineHeight="1.5">
                      💡 Didn't receive an email? Check your spam folder or wait for the cooldown timer before requesting another recovery link.
                    </Text>
                  </Box>
                </VStack>
              ) : (
                <form id="reset-password-form" onSubmit={handleSubmit(onSubmit)}>
                  <VStack align="stretch" gap="4">
                    {apiError && (
                      <Box
                        p="3"
                        bg="red.subtle"
                        borderRadius="sm"
                        borderWidth="1px"
                        borderColor="red.muted"
                      >
                        <HStack align="flex-start" gap="2">
                          <AlertTriangle size={15} color="var(--chakra-colors-red-600)" style={{ marginTop: "2px", flexShrink: 0 }} />
                          <Text fontSize="xs" color="red.fg" lineHeight="1.4">
                            {apiError}
                          </Text>
                        </HStack>
                      </Box>
                    )}

                    <Field.Root invalid={!!errors.email}>
                      <Field.Label fontSize="xs" fontWeight="500" color="fg.muted">
                        Registered Work Email
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
                          bg="bg.surface"
                          borderColor={errors.email ? "red.500" : "border.default"}
                          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                          disabled={isSubmitting}
                          autoFocus
                        />
                      </Box>
                      {errors.email?.message ? (
                        <Field.ErrorText fontSize="11px" color="red.500" mt="1">
                          {errors.email.message}
                        </Field.ErrorText>
                      ) : (
                        <Field.HelperText fontSize="11px" color="fg.subtle" mt="1">
                          We will send a single-use authorization token to this address.
                        </Field.HelperText>
                      )}
                    </Field.Root>
                  </VStack>
                </form>
              )}
            </Dialog.Body>

            <Dialog.Footer px="6" py="3.5" bg="bg.subtle" borderTopWidth="1px" borderColor="border.subtle" gap="2">
              {isSuccess ? (
                <HStack justify="space-between" w="full">
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={cooldown > 0}
                    onClick={() => {
                      setIsSuccess(false);
                      setApiError(null);
                    }}
                  >
                    <RotateCcw size={12} style={{ marginRight: "4px" }} />
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Link"}
                  </Button>
                  <Button size="xs" colorPalette="blue" onClick={handleClose}>
                    Done
                  </Button>
                </HStack>
              ) : (
                <HStack justify="flex-end" w="full" gap="2">
                  <Dialog.ActionTrigger asChild>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </Dialog.ActionTrigger>
                  <Button
                    type="submit"
                    form="reset-password-form"
                    colorPalette="blue"
                    size="xs"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fontWeight="600"
                  >
                    Send Recovery Link
                    <ArrowRight size={13} style={{ marginLeft: "4px" }} />
                  </Button>
                </HStack>
              )}
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top="3"
                right="3"
                disabled={isSubmitting}
                onClick={handleClose}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ResetPasswordDialog;
