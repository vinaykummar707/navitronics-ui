"use client";

import React, { useState } from "react";
import {
  FeatherBuilding2,
  FeatherCheck,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherGlobe,
  FeatherMapPin,
  FeatherPlus,
  FeatherShield,
  FeatherTrash2,
  FeatherUserCheck,
  FeatherUsers,
  FeatherX,
} from "@subframe/core";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { TextField } from "./TextField";
import { Switch } from "./Switch";
import { Stepper } from "./Stepper";
import { Select } from "./Select";
import { supabase, supabaseAuthHelper } from "@/supabaseClient";
import { toast } from "react-toastify";

interface STUOnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function STUOnboardingWizard({
  open,
  onClose,
  onSuccess,
}: STUOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Org Details
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgLogo, setOrgLogo] = useState("");

  // Step 2: Modules & Flags
  const [enablePIS, setEnablePIS] = useState(true);
  const [enablePAS, setEnablePAS] = useState(true);
  const [enableITMS, setEnableITMS] = useState(false);
  const [enableV1Routes, setEnableV1Routes] = useState(false);
  const [enableV2Routes, setEnableV2Routes] = useState(true);

  // Step 3: Regions
  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [newRegionInput, setNewRegionInput] = useState("");

  // Step 4: Depots
  const [depotsList, setDepotsList] = useState<
    { name: string; regionName: string }[]
  >([]);
  const [newDepotName, setNewDepotName] = useState("");
  const [newDepotRegion, setNewDepotRegion] = useState("");

  // Step 5: Initial Admin User
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUserId, setAdminUserId] = useState("");

  if (!open) return null;

  const handleAddRegion = () => {
    const trimmed = newRegionInput.trim();
    if (!trimmed) return;
    if (regionsList.includes(trimmed)) {
      toast.warning("This region already exists in your list");
      return;
    }
    setRegionsList([...regionsList, trimmed]);
    setNewRegionInput("");
    if (!newDepotRegion) {
      setNewDepotRegion(trimmed);
    }
  };

  const handleRemoveRegion = (indexToRemove: number) => {
    const targetRegion = regionsList[indexToRemove];
    setRegionsList(regionsList.filter((_, idx) => idx !== indexToRemove));
    // Also remove any depots attached to this region
    setDepotsList(depotsList.filter((d) => d.regionName !== targetRegion));
  };

  const handleAddDepot = () => {
    const trimmed = newDepotName.trim();
    if (!trimmed) {
      toast.error("Enter depot name");
      return;
    }
    if (!newDepotRegion) {
      toast.error("Select a region for this depot");
      return;
    }
    if (depotsList.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("A depot with this name is already in the list");
      return;
    }
    setDepotsList([...depotsList, { name: trimmed, regionName: newDepotRegion }]);
    setNewDepotName("");
  };

  const handleRemoveDepot = (indexToRemove: number) => {
    setDepotsList(depotsList.filter((_, idx) => idx !== indexToRemove));
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!orgName.trim()) {
        toast.error("Organization name is required");
        return false;
      }
      if (!orgEmail.trim() || !/^\S+@\S+\.\S+$/.test(orgEmail.trim())) {
        toast.error("Valid contact email is required");
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!enableV1Routes && !enableV2Routes) {
        toast.error("At least one route version (V1 or V2) must be enabled");
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (regionsList.length === 0) {
        toast.error("Please add at least one region for this STU");
        return false;
      }
      return true;
    }
    if (currentStep === 4) {
      if (depotsList.length === 0) {
        toast.error("Please add at least one depot for this STU");
        return false;
      }
      return true;
    }
    if (currentStep === 5) {
      if (!adminEmail.trim() || !/^\S+@\S+\.\S+$/.test(adminEmail.trim())) {
        toast.error("Valid admin email is required");
        return false;
      }
      if (!adminPassword || adminPassword.length < 6) {
        toast.error("Admin password must be at least 6 characters");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleProvision = async () => {
    setIsSubmitting(true);
    try {
      // 1. Insert Organization
      const { data: orgRecord, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: orgName.trim(),
          email: orgEmail.trim(),
          phone: orgPhone.trim() || null,
          logo: orgLogo.trim() || null,
          PIS: enablePIS,
          PAS: enablePAS,
          ITMS: enableITMS,
          v1_routes: enableV1Routes,
          v2_routes: enableV2Routes,
          customer_type: "stu",
          active: true,
          deleted: false,
        })
        .select()
        .single();

      if (orgError || !orgRecord) {
        throw new Error(orgError?.message || "Failed to create organization");
      }

      const orgId = orgRecord.id;

      // 2. Insert Regions
      const regionIdMap: Record<string, string> = {};
      for (const regionName of regionsList) {
        const { data: regRecord, error: regError } = await supabase
          .from("regions")
          .insert({
            name: regionName.trim(),
            organization_id: orgId,
            active: true,
            deleted: false,
          })
          .select()
          .single();

        if (regError || !regRecord) {
          throw new Error(`Failed to create region ${regionName}: ${regError?.message}`);
        }
        regionIdMap[regionName] = regRecord.id;
      }

      // 3. Insert Depots
      for (const depot of depotsList) {
        const targetRegionId = regionIdMap[depot.regionName];
        const { error: depotError } = await supabase.from("depots").insert({
          name: depot.name.trim(),
          region_id: targetRegionId,
          organization_id: orgId,
          active: true,
          deleted: false,
        });

        if (depotError) {
          throw new Error(`Failed to create depot ${depot.name}: ${depotError?.message}`);
        }
      }

      // 4. Fetch Role ID for organization_admin
      const { data: roleRecord } = await supabase
        .from("roles")
        .select("id")
        .ilike("name", "organization_admin")
        .maybeSingle();

      const orgAdminRoleId = roleRecord?.id || "";

      // 5. Create Org Admin User in Auth & Database
      let authUserId = "";
      const { data: signUpData, error: signUpError } =
        await supabaseAuthHelper.auth.signUp({
          email: adminEmail.trim(),
          password: adminPassword,
          options: {
            data: {
              organization_id: orgId,
              customer_type: "stu",
              v1_routes: enableV1Routes,
              v2_routes: enableV2Routes,
            },
          },
        });

      if (signUpError) {
        // If already registered in auth, attempt login
        const { data: signInData, error: signInErr } =
          await supabaseAuthHelper.auth.signInWithPassword({
            email: adminEmail.trim(),
            password: adminPassword,
          });
        if (signInData?.user?.id) {
          authUserId = signInData.user.id;
        } else {
          throw new Error(
            `Admin email is already registered: ${signInErr?.message || signUpError.message}`
          );
        }
      } else if (signUpData?.user?.id) {
        authUserId = signUpData.user.id;
      }

      if (!authUserId) {
        authUserId = adminUserId || `usr_${Date.now()}`;
      }

      // Insert record into public.users
      const { error: userInsertError } = await supabase.from("users").insert({
        email: adminEmail.trim(),
        user_id: authUserId,
        password: adminPassword,
        organization_id: orgId,
        role_id: orgAdminRoleId || null,
        customer_type: "stu",
        active: true,
        deleted: false,
        v1_routes: enableV1Routes,
        v2_routes: enableV2Routes,
      });

      if (userInsertError) {
        console.warn("User DB record warning:", userInsertError);
      }

      toast.success(`STU Organization "${orgName}" successfully provisioned!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("STU Provisioning error:", err);
      toast.error(`Provisioning failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative flex w-full max-w-3xl flex-col rounded-xl border border-neutral-border bg-default-background shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Wizard Header */}
        <div className="flex flex-none items-center justify-between border-b border-neutral-border px-6 py-4 bg-sidebar-background">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-primary border border-brand-200/50">
              <FeatherBuilding2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-body-bold font-body-bold text-default-font">
                Onboard STU Customer
              </span>
              <span className="text-caption font-caption text-subtext-color">
                Complete enterprise provisioning with organization, regions, depots, and administrators
              </span>
            </div>
          </div>
          <IconButton
            icon={<FeatherX className="h-4 w-4" />}
            size="small"
            variant="neutral-tertiary"
            onClick={onClose}
            title="Cancel wizard"
          />
        </div>

        {/* Stepper Progress Indicator */}
        <div className="border-b border-neutral-border bg-default-background/50 px-6 py-3.5">
          <Stepper>
            <Stepper.Step
              firstStep
              variant={currentStep === 1 ? "active" : currentStep > 1 ? "completed" : "default"}
              stepNumber="1"
              label="Organization"
            />
            <Stepper.Step
              variant={currentStep === 2 ? "active" : currentStep > 2 ? "completed" : "default"}
              stepNumber="2"
              label="Modules"
            />
            <Stepper.Step
              variant={currentStep === 3 ? "active" : currentStep > 3 ? "completed" : "default"}
              stepNumber="3"
              label="Regions"
            />
            <Stepper.Step
              variant={currentStep === 4 ? "active" : currentStep > 4 ? "completed" : "default"}
              stepNumber="4"
              label="Depots"
            />
            <Stepper.Step
              variant={currentStep === 5 ? "active" : currentStep > 5 ? "completed" : "default"}
              stepNumber="5"
              label="Admin User"
            />
            <Stepper.Step
              lastStep
              variant={currentStep === 6 ? "active" : "default"}
              stepNumber="6"
              label="Review"
            />
          </Stepper>
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-[340px]">
          {/* STEP 1: Organization Details */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-body-bold font-body-bold text-default-font">
                  Step 1: Organization Profile
                </span>
                <span className="text-caption text-subtext-color">
                  Provide the official name and operational details of the STU or private operator.
                </span>
              </div>

              <TextField
                className="w-full"
                label={
                  <span>
                    Organization Name <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="e.g. TSRTC or Greenline Express"
              >
                <TextField.Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </TextField>

              <TextField
                className="w-full"
                label={
                  <span>
                    Contact Email <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="e.g. contact@tsrtc.telangana.gov.in"
              >
                <TextField.Input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                />
              </TextField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  className="w-full"
                  label="Contact Phone (Optional)"
                  placeholder="e.g. +91 9876543210"
                >
                  <TextField.Input
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                  />
                </TextField>

                <TextField
                  className="w-full"
                  label="Logo URL (Optional)"
                  placeholder="https://example.com/logo.png"
                >
                  <TextField.Input
                    value={orgLogo}
                    onChange={(e) => setOrgLogo(e.target.value)}
                  />
                </TextField>
              </div>
            </div>
          )}

          {/* STEP 2: Module Selection & Route Flags */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <span className="text-body-bold font-body-bold text-default-font">
                  Step 2: Module Selection & Route Version Capabilities
                </span>
                <span className="text-caption text-subtext-color">
                  Configure the RMS modules and route simulation formats assigned to this STU.
                </span>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-neutral-border bg-sidebar-background/50 p-4">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  System Modules
                </span>
                <div className="flex items-center justify-between py-1 border-b border-neutral-border/60">
                  <div className="flex flex-col">
                    <span className="text-body font-medium text-default-font">PIS (Passenger Information System)</span>
                    <span className="text-micro text-subtext-color">LED destination boards, split-route displays, dynamic text</span>
                  </div>
                  <Switch checked={enablePIS} onCheckedChange={setEnablePIS} />
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-border/60">
                  <div className="flex flex-col">
                    <span className="text-body font-medium text-default-font">PAS (Public Address System)</span>
                    <span className="text-micro text-subtext-color">Stop voice announcements and audio configuration</span>
                  </div>
                  <Switch checked={enablePAS} onCheckedChange={setEnablePAS} />
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-body font-medium text-default-font">ITMS (Intelligent Transport Management)</span>
                    <span className="text-micro text-subtext-color">Fleet scheduling, telemetry, and automated vehicle tracking</span>
                  </div>
                  <Switch checked={enableITMS} onCheckedChange={setEnableITMS} />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-neutral-border bg-sidebar-background/50 p-4">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Route Creation Formats
                </span>
                <div className="flex items-center justify-between py-1 border-b border-neutral-border/60">
                  <div className="flex flex-col">
                    <span className="text-body font-medium text-default-font">V1 LED Single-Board Routes</span>
                    <span className="text-micro text-subtext-color">Legacy binary format export for mono/color LED signboards</span>
                  </div>
                  <Switch checked={enableV1Routes} onCheckedChange={setEnableV1Routes} />
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-body font-medium text-default-font">V2 Multi-Screen Full Signboard Routes</span>
                    <span className="text-micro text-subtext-color">Modern multi-display layout (Front, Side, Rear, Internal LCDs)</span>
                  </div>
                  <Switch checked={enableV2Routes} onCheckedChange={setEnableV2Routes} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Regions Setup */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-body-bold font-body-bold text-default-font">
                  Step 3: Define Operational Regions
                </span>
                <span className="text-caption text-subtext-color">
                  Create the geographical or administrative divisions for this STU.
                </span>
              </div>

              <div className="flex items-end gap-2 w-full">
                <TextField
                  className="flex-1"
                  label="Region Name"
                  placeholder="e.g. Hyderabad Greater Zone"
                >
                  <TextField.Input
                    value={newRegionInput}
                    onChange={(e) => setNewRegionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRegion();
                      }
                    }}
                  />
                </TextField>
                <Button
                  className="h-9 flex-none"
                  icon={<FeatherPlus className="h-4 w-4" />}
                  onClick={handleAddRegion}
                >
                  Add Region
                </Button>
              </div>

              {regionsList.length > 0 ? (
                <div className="flex flex-col gap-2 rounded-lg border border-neutral-border bg-sidebar-background/40 p-3">
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    Configured Regions ({regionsList.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {regionsList.map((region, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs text-brand-900 font-medium"
                      >
                        <FeatherGlobe className="h-3.5 w-3.5 text-brand-600" />
                        <span>{region}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRegion(idx)}
                          className="text-brand-400 hover:text-red-600 transition-colors"
                        >
                          <FeatherX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 rounded-lg border border-dashed border-neutral-border text-caption text-subtext-color">
                  No regions added yet. Type a region name above and click "Add Region".
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Depots Setup */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-body-bold font-body-bold text-default-font">
                  Step 4: Operational Depots
                </span>
                <span className="text-caption text-subtext-color">
                  Map vehicle depots to the regions created in Step 3.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 w-full">
                <TextField
                  className="flex-1"
                  label="Depot Name"
                  placeholder="e.g. MGBS Central Depot"
                >
                  <TextField.Input
                    value={newDepotName}
                    onChange={(e) => setNewDepotName(e.target.value)}
                  />
                </TextField>

                <div className="w-full sm:w-56">
                  <Select
                    className="h-auto w-full"
                    label="Assigned Region"
                    placeholder="Select Region"
                    value={newDepotRegion}
                    onValueChange={setNewDepotRegion}
                  >
                    {regionsList.map((r) => (
                      <Select.Item key={r} value={r}>
                        {r}
                      </Select.Item>
                    ))}
                  </Select>
                </div>

                <Button
                  className="h-9 flex-none"
                  icon={<FeatherPlus className="h-4 w-4" />}
                  onClick={handleAddDepot}
                >
                  Add Depot
                </Button>
              </div>

              {depotsList.length > 0 ? (
                <div className="flex flex-col gap-2 rounded-lg border border-neutral-border bg-sidebar-background/40 p-3">
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    Configured Depots ({depotsList.length})
                  </span>
                  <div className="flex flex-col divide-y divide-neutral-border/60">
                    {depotsList.map((depot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FeatherMapPin className="h-3.5 w-3.5 text-brand-600" />
                          <span className="font-semibold text-default-font">
                            {depot.name}
                          </span>
                          <span className="text-subtext-color">
                            in {depot.regionName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDepot(idx)}
                          className="text-subtext-color hover:text-red-600 transition-colors p-1"
                        >
                          <FeatherTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 rounded-lg border border-dashed border-neutral-border text-caption text-subtext-color">
                  No depots added yet. Add at least one depot mapped to a region.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Initial Admin User */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-body-bold font-body-bold text-default-font">
                  Step 5: Initial STU Organization Administrator
                </span>
                <span className="text-caption text-subtext-color">
                  Create the top-level Organization Admin account for this STU tenant.
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50/60 p-3 text-xs text-brand-900">
                <FeatherShield className="h-5 w-5 text-brand-primary flex-none" />
                <span>
                  This administrator will have full authority over their STU: managing regions, depots, routes, stops, and inviting staff members.
                </span>
              </div>

              <TextField
                className="w-full"
                label={
                  <span>
                    Admin Email Address <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="admin@operator.com"
              >
                <TextField.Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </TextField>

              <TextField
                className="w-full"
                label={
                  <span>
                    Initial Password <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="At least 6 characters"
              >
                <TextField.Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </TextField>

              <TextField
                className="w-full"
                label="Custom User Identifier (Optional)"
                placeholder="e.g. STU-ADMIN-01"
              >
                <TextField.Input
                  value={adminUserId}
                  onChange={(e) => setAdminUserId(e.target.value)}
                />
              </TextField>
            </div>
          )}

          {/* STEP 6: Review & Confirmation */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <span className="text-body-bold font-body-bold text-default-font">
                  Step 6: Review & Provision Hierarchy
                </span>
                <span className="text-caption text-subtext-color">
                  Verify the configuration below before deploying the full STU tenant tree.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-sidebar-background/50 p-3.5">
                  <span className="font-semibold text-default-font flex items-center gap-1.5">
                    <FeatherBuilding2 className="h-4 w-4 text-brand-600" />
                    Organization Profile
                  </span>
                  <span className="text-subtext-color">Name: <strong className="text-default-font">{orgName}</strong></span>
                  <span className="text-subtext-color">Email: {orgEmail}</span>
                  <span className="text-subtext-color">Customer Tier: <strong className="text-brand-600">STU Enterprise</strong></span>
                </div>

                <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-sidebar-background/50 p-3.5">
                  <span className="font-semibold text-default-font flex items-center gap-1.5">
                    <FeatherShield className="h-4 w-4 text-brand-600" />
                    Modules & Route Flags
                  </span>
                  <span className="text-subtext-color">
                    Modules: {[enablePIS && "PIS", enablePAS && "PAS", enableITMS && "ITMS"].filter(Boolean).join(", ") || "None"}
                  </span>
                  <span className="text-subtext-color">
                    Routes: {[enableV1Routes && "V1", enableV2Routes && "V2"].filter(Boolean).join(" & ")}
                  </span>
                </div>

                <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-sidebar-background/50 p-3.5">
                  <span className="font-semibold text-default-font flex items-center gap-1.5">
                    <FeatherGlobe className="h-4 w-4 text-brand-600" />
                    Hierarchy Tree
                  </span>
                  <span className="text-subtext-color">Regions: <strong className="text-default-font">{regionsList.length}</strong></span>
                  <span className="text-subtext-color">Depots: <strong className="text-default-font">{depotsList.length}</strong></span>
                </div>

                <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-sidebar-background/50 p-3.5">
                  <span className="font-semibold text-default-font flex items-center gap-1.5">
                    <FeatherUserCheck className="h-4 w-4 text-brand-600" />
                    Primary Administrator
                  </span>
                  <span className="text-subtext-color">Admin: {adminEmail}</span>
                  <span className="text-subtext-color">Role: Org Admin (organization_admin)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="flex flex-none items-center justify-between border-t border-neutral-border px-6 py-4 bg-sidebar-background">
          <Button
            variant="neutral-secondary"
            icon={<FeatherChevronLeft className="h-4 w-4" />}
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="neutral-tertiary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {currentStep < 6 ? (
              <Button
                icon={<FeatherChevronRight className="h-4 w-4" />}
                onClick={handleNext}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="brand-primary"
                icon={<FeatherCheck className="h-4 w-4" />}
                onClick={handleProvision}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Provisioning Hierarchy..." : "Provision STU Organization"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
