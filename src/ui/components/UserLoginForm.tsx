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
import {  FeatherKeyRound } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { TextField } from "./TextField";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserDetails } from "@/api/users/hooks";
import { set } from "zod";
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
  const {setSelectedOrganization} = useOrganizationStore((state) => state); // Access organization store if needed
  const navigate = useNavigate(); // React Router navigation

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(""); // State to hold user ID after login

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
    setUserId(""); // Clear previous user ID on new login attempt
    // Authenticate with Supabase (assuming email)
    const { data, error: supaError } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
      password,
    });
    if (supaError) {
      toast.error(`Login failed: ${supaError.message}`);
    } else if (data && data.user) {
      setUserId(data.user.id); // Set user ID to trigger fetching user details
    }
  };

  

 // Fetch user data and handle login
  useEffect(() => {
    const processData = async () => {
      const userData = loggedUserDetails?.data as ILoggedUser;
      console.log("Fetched user details:", userData);
      try {
        if (userData) {
          login(userData);
          if (userData.organization?.active) {
            if (userData.active) {
              toast.success("Login successful!");
              setSelectedOrganization(userData.organization);
              navigate("/home");
            } else {
              throw new Error("Your account is not active. Please contact support.");
            }
          } else {
            throw new Error("Your organization is not active. Please contact support.");
          }
        }
      } catch (error) {
        toast.error(error.message);
        logout();
        supabase.auth.signOut();
      }
    };

    if (userId) processData(); // Only process data if userId is set
  }, [userId, loggedUserDetails, login, navigate, logout, setSelectedOrganization]);

  // Remaining render part remains the same...

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
      <div className="flex grow justify-center shrink-0 bg-[url('https://images.pexels.com/photos/9980493/pexels-photo-9980493.jpeg')] bg-no-repeat bg-cover bg-center basis-0 flex-col items-center gap-12 self-stretch bg-brand-50 px-12 py-12">
        <div className="flex  max-w-[288px] grow shrink-0 basis-0 flex-col items-center  gap-2">
          <Avatar
            size="x-large"
            image="https://navitronix.in/assets/navitronix.jpeg"
          >
            HW
          </Avatar>
          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className=" text-heading text-white-default font-heading text-center">
                Navitronix
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-[380px] flex-none flex-col items-center justify-center gap-6 self-stretch px-12 py-12">
        <div className="flex w-full  flex-col items-start gap-8">
          <img
            className="h-6 flex-none object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
          />
          <span className="text-heading-2 font-heading-2 text-default-font">
            Sign In
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
            <Button
              className="h-10 mt-3 w-full flex-none"
              size="large"
              onClick={handleSubmit}
              disabled={usersLoading}
            >
              {usersLoading ? "Fetching User Details..." : "Submit"}
            </Button>
          </div>
          {/* <div className="flex flex-wrap items-center justify-center gap-1">
            <span className="text-body font-body text-subtext-color text-center">
              Use this link to reset your password
            </span>
            <LinkButton onClick={() => setShowResetDialog(true)} variant="brand">Reset Password</LinkButton>
          </div> */}
        </div>
      </div>
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <Dialog.Content>
          <ResetPasswordForm onSuccess={() => setShowResetDialog(false)} onCancel={() => setShowResetDialog(false)} />
        </Dialog.Content>
      </Dialog>
    </div>
  );
});

export const UserLoginForm = UserLoginFormRoot;
