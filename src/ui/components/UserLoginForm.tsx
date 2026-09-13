"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/11b10bc240cf/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Link Button — https://app.subframe.com/11b10bc240cf/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 * Text Field — https://app.subframe.com/11b10bc240cf/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * UserLoginForm — https://app.subframe.com/11b10bc240cf/library?component=UserLoginForm_e5743870-e2c4-4e34-a182-7c38cd5ae2ef
 */

import React, { useEffect, useState } from "react";
import { FeatherEye, FeatherEyeOff, FeatherKeyRound } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { TextField } from "./TextField";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ILoggedUser, loggedUserCrud, userCrud } from "@/types/IUser";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Dialog } from "./Dialog";
import { ResetPasswordForm } from "./ResetPassword";
import { Checkbox } from "./Checkbox";
interface UserLoginFormRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const UserLoginFormRoot = React.forwardRef<
  HTMLDivElement,
  UserLoginFormRootProps
>(function UserLoginFormRoot(
  { className, ...otherProps }: UserLoginFormRootProps,
  ref,
) {
  const login = useLoggedUserStore((state) => state.login); // Zustand store
  const logout = useLoggedUserStore((state) => state.logout); // Zustand store
  const rememberMe = useLoggedUserStore((state) => state.rememberMe);
  const setRememberMe = useLoggedUserStore((state) => state.setRememberMe);
  const { setSelectedOrganization } = useOrganizationStore((state) => state); // Access organization store if needed
  const navigate = useNavigate(); // React Router navigation

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState(""); // State to hold user ID after login

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const { useList } = loggedUserCrud;

  const {
    data: loggedUserDetails,
    isLoading: usersLoading,
    error: usersError,
    refetch: usersRefetch,
  } = useList({
    filters: { user_id: userId },
    custom(query) {
      return query
        .select(
          ` *,
        region:region_id (*),
        organization:organization_id (*),
        depot:depot_id (*),
        role:role_id (*)
      `,
        )
        .single();
    },
    skip: !userId, // Skip the query until we have a userId
  });

  // Update input values and submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Enter email address");
      hasError = true;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Invalid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Enter password");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    setUserId(""); // Clear previous user ID on new login attempt
    // Authenticate with Supabase
    const { data, error: supaError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (supaError) {
      toast.error(`Login failed: ${supaError.message}`);
    } else if (data && data.user) {
      setUserId(data.user.id); // Set user ID to trigger fetching user details
    }
  };

  // Handle post-login navigation when user details are retrieved
  useEffect(() => {
    if (!userId || !loggedUserDetails?.data) return;

    const userData = { ...(loggedUserDetails.data as ILoggedUser) };

    // Hydrate feature flags from user_metadata if not present on DB row
    supabase.auth.getUser().then(({ data: authUser }) => {
      const meta = authUser?.user?.user_metadata;
      if (meta) {
        if (meta.v1_routes !== undefined && userData.v1_routes === undefined) {
          userData.v1_routes = meta.v1_routes;
        }
        if (meta.v2_routes !== undefined && userData.v2_routes === undefined) {
          userData.v2_routes = meta.v2_routes;
        }
        login(userData);
      }
    }).catch(() => {});

    try {
      login(userData);
      if (userData.organization?.active) {
        if (userData.active && !userData.deleted) {
          toast.success("Login successful!");
          setSelectedOrganization(userData.organization);
          navigate("/home");
        } else {
          throw new Error(
            "Your account is inactive or has been deactivated. Please contact support at support@navitronix.in or reach your administrator.",
          );
        }
      } else {
        throw new Error(
          "Your organization account is inactive. Please contact support at support@navitronix.in.",
        );
      }
    } catch (error: any) {
      toast.error(error.message);
      logout();
      supabase.auth.signOut();
      setUserId("");
    }
  }, [
    userId,
    loggedUserDetails,
    login,
    navigate,
    logout,
    setSelectedOrganization,
  ]);

  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-wrap items-start",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="relative flex grow justify-center shrink-0 bg-[url('https://images.pexels.com/photos/9980493/pexels-photo-9980493.jpeg')] bg-no-repeat bg-cover bg-center basis-0 flex-col items-center justify-center gap-8 self-stretch p-12 mobile:hidden overflow-hidden">
        {/* Dark gradient overlay for crystal clear contrast (BUG-004) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-neutral-900/75 to-black/80 backdrop-blur-[1px]" />

        {/* Premium glassmorphic branding card (BUG-004, BUG-013) */}
        <div className="relative z-10 flex max-w-[420px] w-full flex-col items-center justify-center gap-6 rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-md shadow-2xl">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 rounded-full bg-brand-500/30 blur-sm" />
            <Avatar
              size="x-large"
              className="relative ring-2 ring-white/30 shadow-lg"
              image="https://navitronix.in/assets/navitronix.jpeg"
            >
              NX
            </Avatar>
          </div>

          <div className="flex w-full flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                NAVITRONIX
              </span>
              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300 border border-brand-500/30 tracking-wider uppercase">
                RMS v2
              </span>
            </div>
            <p className="text-sm text-neutral-200 leading-relaxed drop-shadow-sm font-medium">
              Intelligent Passenger Information & Transit Management System
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span>Real-Time LED Signboard & Route Studio</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span>Multilingual Audio & Public Address System</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span>Hierarchical Organization, Region & Depot Control</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-[520px] max-w-full flex-none flex-col items-center justify-center gap-8 self-stretch p-8 md:p-12 lg:p-16 bg-default-background shadow-xl">
        <div className="flex w-full flex-col items-start gap-8">
          <div className="flex flex-col items-start gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-primary border border-brand-200">
                Enterprise Portal
              </span>
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font tracking-tight text-2xl font-bold">
              Sign In
            </span>
            <span className="text-body font-body text-subtext-color text-sm">
              Welcome back! Please enter your credentials to access your account.
            </span>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full flex-col items-start justify-center gap-4">
            <TextField
              className="h-auto w-full flex-none"
              label={
                <span>
                  Email <span className="text-red-500">*</span>
                </span>
              }
              helpText={emailError}
              error={!!emailError}
              icon={<FeatherUser />}
            >
              <TextField.Input
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                autoComplete="email"
                autoFocus
              />
            </TextField>
            <TextField
              className="h-auto w-full flex-none"
              label={
                <span>
                  Password <span className="text-red-500">*</span>
                </span>
              }
              helpText={passwordError}
              error={!!passwordError}
              icon={<FeatherKeyRound />}
              iconRight={
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex items-center justify-center p-0.5 text-subtext-color hover:text-default-font transition-colors cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FeatherEyeOff className="w-4 h-4" />
                  ) : (
                    <FeatherEye className="w-4 h-4" />
                  )}
                </button>
              }
            >
              <TextField.Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                autoComplete="current-password"
              />
            </TextField>
            <div className="flex w-full items-center justify-between pt-1">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked)}
                label={
                  <span className="text-caption font-caption text-subtext-color select-none">
                    Remember me
                  </span>
                }
              />
              <LinkButton
                variant="brand"
                size="small"
                type="button"
                onClick={() => setShowResetDialog(true)}
              >
                Forgot Password?
              </LinkButton>
            </div>
            <Button
              className="h-11 mt-1 w-full flex-none text-body-bold font-body-bold"
              size="large"
              type="submit"
              disabled={usersLoading}
            >
              {usersLoading ? "Fetching User Details..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <Dialog.Content>
          <ResetPasswordForm
            onSuccess={() => setShowResetDialog(false)}
            onCancel={() => setShowResetDialog(false)}
          />
        </Dialog.Content>
      </Dialog>
    </div>
  );
});

export const UserLoginForm = UserLoginFormRoot;
