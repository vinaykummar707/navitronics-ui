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
            "Your account is not active or has been deleted. Please contact support.",
          );
        }
      } else {
        throw new Error(
          "Your organization is not active. Please contact support.",
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
      <div className="flex grow justify-center shrink-0 bg-[url('https://images.pexels.com/photos/9980493/pexels-photo-9980493.jpeg')] bg-no-repeat bg-cover bg-center basis-0 flex-col items-center gap-12 self-stretch bg-brand-50 p-12 mobile:hidden">
        <div className="flex max-w-[320px] grow shrink-0 basis-0 flex-col items-center justify-center gap-4">
          <Avatar
            size="x-large"
            image="https://navitronix.in/assets/navitronix.jpeg"
          >
            HW
          </Avatar>
          <div className="flex w-full flex-col items-center gap-2">
            <span className="text-heading text-white-default font-heading text-center tracking-wide">
              Navitronix
            </span>
            <span className="text-body text-white font-body text-center opacity-90">
              Intelligent Passenger Information & Transit Management System
            </span>
          </div>
        </div>
      </div>
      <div className="flex w-[480px] max-w-full flex-none flex-col items-center justify-center gap-8 self-stretch p-8 md:p-14 bg-default-background">
        <div className="flex w-full flex-col items-start gap-8">
          <div className="flex flex-col items-start gap-2 w-full">
            <span className="text-heading-1 font-heading-1 text-default-font">
              Sign In
            </span>
            <span className="text-body font-body text-subtext-color">
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
            <div className="flex w-full justify-end">
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
