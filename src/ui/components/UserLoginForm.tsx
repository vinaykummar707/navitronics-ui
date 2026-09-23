"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/11b10bc240cf/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Link Button — https://app.subframe.com/11b10bc240cf/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 * Text Field — https://app.subframe.com/11b10bc240cf/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * UserLoginForm — https://app.subframe.com/11b10bc240cf/library?component=UserLoginForm_e5743870-e2c4-4e34-a182-7c38cd5ae2ef
 */

import React, { useState } from "react";
import {
  FeatherEye,
  FeatherEyeOff,
  FeatherKeyRound,
  FeatherUser,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { TextField } from "./TextField";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ILoggedUser } from "@/types/IUser";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Dialog } from "./Dialog";
import { ResetPasswordForm } from "./ResetPassword";
import { Checkbox } from "./Checkbox";
import { isRegularCustomer, isSuperAdmin } from "@/utils/customerType";

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
  const setSelectedOrganization = useOrganizationStore(
    (state) => state.setSelectedOrganization,
  );
  const navigate = useNavigate(); // React Router navigation

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

    setIsSubmitting(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: supaError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (supaError) {
        throw new Error(supaError.message || "Invalid email or password");
      }

      if (!authData?.user) {
        throw new Error("Authentication failed. No user returned from server.");
      }

      // 2. Fetch user profile from public.users with joined relations
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select(`
          *,
          region:region_id (*),
          organization:organization_id (*),
          depot:depot_id (*),
          role:role_id (*)
        `)
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (dbError) {
        throw new Error(`Failed to load user profile: ${dbError.message}`);
      }

      if (!dbUser) {
        throw new Error(
          "Your account profile is not found in the users table. Please contact support at support@navitronix.in or reach your administrator."
        );
      }

      const userData = { ...(dbUser as ILoggedUser) };

      // 3. Account active status check
      if (!userData.active) {
        throw new Error(
          "Your account is inactive. Please contact support at support@navitronix.in or reach your administrator."
        );
      }

      // 4. Hydrate auth user metadata
      try {
        const meta = authData.user.user_metadata;
        if (meta) {
          if (meta.v1_routes !== undefined && (userData.v1_routes === undefined || userData.v1_routes === null)) {
            userData.v1_routes = meta.v1_routes;
          }
          if (meta.v2_routes !== undefined && (userData.v2_routes === undefined || userData.v2_routes === null)) {
            userData.v2_routes = meta.v2_routes;
          }
          if (meta.customer_type && !userData.customer_type) {
            userData.customer_type = meta.customer_type;
          }
        }
      } catch (metaErr) {
        console.warn("Could not fetch auth metadata:", metaErr);
      }

      const roleName = userData.role?.name?.toLowerCase();

      // 5. Super Admin (master / super_admin)
      if (isSuperAdmin(userData) || roleName === "master" || roleName === "super_admin") {
        login(userData);
        if (userData.organization) {
          setSelectedOrganization(userData.organization);
        }
        toast.success("Login successful!");
        navigate("/home");
        return;
      }

      // 6. Guest User
      if (roleName === "guest") {
        login(userData);
        setSelectedOrganization(null);
        toast.success("Login successful!");
        navigate("/home");
        return;
      }

      // 7. Regular Customer
      if (isRegularCustomer(userData)) {
        login(userData);
        setSelectedOrganization(null);
        toast.success("Login successful!");
        navigate("/home/regular-routes");
        return;
      }

      // 8. STU Enterprise Users: must belong to an active organization
      if (!userData.organization || userData.organization.active === false) {
        throw new Error(
          "Your organization account is inactive. Please contact support at support@navitronix.in."
        );
      }

      login(userData);
      setSelectedOrganization(userData.organization);
      toast.success("Login successful!");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message);
      logout();
      await supabase.auth.signOut();
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex min-h-[100dvh] h-[100dvh] w-full max-w-full flex-col bg-default-background select-none overflow-hidden",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Top Bar with safe area */}
      <header className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border bg-sidebar-background/90 px-3 sm:px-6 backdrop-blur-md z-20 pt-safe">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            className="h-8 w-8 rounded-full object-cover ring-1 ring-neutral-border flex-none"
            src="https://navitronix.in/assets/navitronix.jpeg"
            alt="Navitronix"
          />
          <div className="flex items-center gap-2">
            <span className="text-body-bold font-body-bold tracking-tight text-default-font font-bold">
              NAVITRONIX
            </span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-caption-bold text-brand-primary bg-brand-50 border border-brand-200/40">
              RMS v2
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-semibold text-emerald-300 uppercase tracking-wider">
              Systems Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Centered Content Area */}
      <main className="relative flex flex-1 w-full items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Ambient atmospheric glows & subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] rounded-full bg-brand-500/[0.08] blur-[120px] pointer-events-none" />

        {/* Centered Login Card */}
        <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-neutral-border bg-sidebar-background/95 p-5 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 my-auto pb-safe">
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <div className="relative flex items-center justify-center mb-1">
              <div className="absolute -inset-1 rounded-2xl bg-brand-primary/20 blur-sm" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 border border-brand-primary/30 shadow-md">
                <img
                  src="https://navitronix.in/assets/navitronix.jpeg"
                  alt="Navitronix"
                  className="h-8 w-8 rounded-xl object-cover"
                />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-default-font">
              Sign In
            </span>
            <span className="text-xs sm:text-sm text-subtext-color max-w-[320px]">
              Enter your credentials to access the Navitronix RMS portal.
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
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="w-full py-3.5 px-4 text-center text-xs text-subtext-color border-t border-neutral-border/50 bg-sidebar-background/40 backdrop-blur-sm z-10">
        <span>© 2026 Navitronix Technologies Pvt Ltd. All rights reserved.</span>
      </footer>

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
