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
import { FeatherKeyRound } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { TextField } from "./TextField";
import { supabase } from "@/supabaseClient";
import useAuthStore from "@/store/authStore";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useUserDetails } from "@/api/users/hooks";
import { set } from "zod";
interface UserLoginFormRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const UserLoginFormRoot = React.forwardRef<
  HTMLDivElement,
  UserLoginFormRootProps
>(function UserLoginFormRoot(
  { className, ...otherProps }: UserLoginFormRootProps,
  ref
) {

  const login = useAuthStore((state) => state.login); // Zustand store
  const navigate = useNavigate(); // React Router navigation

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(""); // State to hold user ID after login

  const { data: userMetadata, loading: userLoading, error: userError, refetch } = useUserDetails(userId);
  // Update input values and submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setUserId(""); // Clear previous user ID on new login attempt

    // Authenticate with Supabase (assuming email)
    const { data, error: supaError } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
      password,
    });
    setLoading(false);

    if (supaError) {
      setError(supaError.message);
      toast.error(`Login failed: ${supaError.message}`);
    } else if (data && data.user) {
      // Optionally: redirect or call props.onLoginSuccess, etc.
      console.log("Login successful, user data:", data.user);
      setError(null);
      setUserId(data.user.id);
    }
  };


  // Only try to refetch after login (userId set):
  useEffect(() => {
    console.log("User ID for metadata fetch:", userId);
    if (userId) {
      refetch();
    }
  }, [userId]);

  // Once userMetadata is fetched, login and navigate:
  useEffect(() => {
    if (userMetadata?.users_by_pk) {
      login({
        userId: userMetadata.users_by_pk.user_id,
        userName: userMetadata.users_by_pk.email || "",
        userRole: userMetadata.users_by_pk.role?.name || "",
        active: userMetadata.users_by_pk.active || false,
        area: {
          areaId: userMetadata.users_by_pk.region?.id || "",
          areaName: userMetadata.users_by_pk.region?.name || "",
        },
        depot: {
          depotId: userMetadata.users_by_pk.depot?.id || "",
          depotName: userMetadata.users_by_pk.depot?.name || "",
        },
        organization: {
          organizationId: userMetadata.users_by_pk.organization?.id || "",
          organizationName: userMetadata.users_by_pk.organization?.name || "",
          PIS: userMetadata.users_by_pk.organization?.PIS || false,
          PAS: userMetadata.users_by_pk.organization?.PAS || false,
          ITMS: userMetadata.users_by_pk.organization?.ITMS || false,
          active: userMetadata.users_by_pk.organization?.active || false,
        },
      });
      if (userMetadata.users_by_pk.organization?.active) {

        if (userMetadata.users_by_pk.active) {
          toast.success("Login successful!");
          navigate("/home");
        } else {
          toast.error("Your account is not active. Please contact support.");
          supabase.auth.signOut();
        }

      } else {
        toast.error("Your organization is not active. Please contact support.");
        supabase.auth.signOut();
      }

    }
  }, [userMetadata, login, navigate]);



  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-wrap items-start",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex grow shrink-0 basis-0 flex-col items-center gap-12 self-stretch bg-brand-50 px-12 py-12">
        <div className="flex w-full max-w-[288px] grow shrink-0 basis-0 flex-col items-center justify-center gap-8">
          <Avatar
            size="x-large"
            image="https://res.cloudinary.com/subframe/image/upload/v1711417514/shared/ubsk7cs5hnnaj798efej.jpg"
          >
            HW
          </Avatar>
          <div className="flex w-full flex-col items-center gap-6">
            <span className="text-heading-3 font-heading-3 text-brand-800 text-center">
              &quot;In less than a week I&#39;ve already saved hours upon hours
              of grunt work – it&#39;s doesn&#39;t get much better than this for
              the price!&quot;
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-body-bold font-body-bold text-brand-800">
                Howard Wayne
              </span>
              <span className="text-body font-body text-brand-800">–</span>
              <span className="text-body font-body text-brand-800">
                Founder, Parachute Inc.
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-90 flex-none flex-col items-center justify-center gap-6 self-stretch px-12 py-12">
        <div className="flex w-full  flex-col items-start gap-8">
          <img
            className="h-6 flex-none object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
          />
          <span className="text-heading-2 font-heading-2 text-default-font">
            Sign up to start your journey
          </span>
          <div className="flex w-full flex-col items-start justify-center gap-2">
            <TextField
              className="h-auto w-full flex-none"
              label="Email or Username"
              helpText=""
              icon={<FeatherUser />}
            >
              <TextField.Input
                placeholder="Enter your work email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </TextField>
            <TextField
              className="h-auto w-full flex-none"
              label="Password"
              helpText=""
              icon={<FeatherKeyRound />}
            >
              <TextField.Input
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </TextField>
            <Button className="h-10 w-full flex-none" size="large" onClick={handleSubmit} disabled={loading}>
              {loading ? "Loading..." : "Continue"}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1">
            <span className="text-body font-body text-subtext-color text-center">
              Use below link to reset your password
            </span>
            <LinkButton variant="brand">Reset Password</LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
});

export const UserLoginForm = UserLoginFormRoot;
