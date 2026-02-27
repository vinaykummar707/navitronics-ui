"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * FontSettingsDrawer — https://app.subframe.com/11b10bc240cf/library?component=FontSettingsDrawer_4c787a4c-09f0-489c-91ff-debf8738813e
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * Text Field — https://app.subframe.com/11b10bc240cf/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 */

import React from "react";
import { FeatherType } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { TextField } from "./TextField";

interface FontSettingsDrawerRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  formFields?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const FontSettingsDrawerRoot = React.forwardRef<
  HTMLDivElement,
  FontSettingsDrawerRootProps
>(function FontSettingsDrawerRoot(
  {
    title,
    description,
    formFields,
    actions,
    className,
    ...otherProps
  }: FontSettingsDrawerRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start bg-default-background",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
        <div className="flex flex-col items-start gap-1">
          {title ? (
            <span className="text-heading-3 font-heading-3 text-default-font">
              {title}
            </span>
          ) : null}
          {description ? (
            <span className="text-body font-body text-subtext-color">
              {description}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start px-2 pb-2 overflow-y-auto">
        <div className="w-full flex-col items-start gap-4 px-4 py-4 grid grid-cols-2">
          <TextField
            className="h-24 w-auto flex-none"
            disabled={false}
            error={false}
            variant="outline"
            label="Language Code"
            helpText="Indian Language Code"
            icon={null}
            iconRight={null}
          >
            <TextField.Input placeholder="ex: hi" />
          </TextField>
          <TextField
            className="h-24 w-auto flex-none"
            disabled={false}
            error={false}
            variant="outline"
            label="Language Name"
            helpText="Full language Name"
            icon={null}
            iconRight={null}
          >
            <TextField.Input placeholder="ex: hindi" />
          </TextField>
        </div>
        <ControlAccordion
          title="Side Text"
          controls={
            formFields ? (
              <div className="flex w-full flex-col items-start gap-6">
                {formFields}
              </div>
            ) : null
          }
          icon={
            <IconWithBackground
              variant="brand"
              size="small"
              icon={<FeatherType />}
              square={false}
            />
          }
        />
        <ControlAccordion
          title="Main Text"
          controls={
            <div className="flex w-full flex-col items-start gap-6">
              <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Height"
                  helpText="Height in pixels"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="14" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (8px)"
                  helpText="Secondary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (16px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (32px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
              </div>
            </div>
          }
          icon={
            <IconWithBackground
              variant="error"
              size="small"
              icon={<FeatherType />}
              square={false}
            />
          }
        />
        <ControlAccordion
          title="Upper Half Text"
          controls={
            <div className="flex w-full flex-col items-start gap-6">
              <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Height"
                  helpText="Height in pixels"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="14" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (8px)"
                  helpText="Secondary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (16px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (32px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
              </div>
            </div>
          }
          icon={
            <IconWithBackground
              variant="neutral"
              size="small"
              icon={<FeatherType />}
              square={false}
            />
          }
        />
        <ControlAccordion
          title="Lower Half Text"
          controls={
            <div className="flex w-full flex-col items-start gap-6">
              <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Height"
                  helpText="Height in pixels"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="14" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (8px)"
                  helpText="Secondary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (16px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (32px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
              </div>
            </div>
          }
          icon={
            <IconWithBackground
              variant="warning"
              size="small"
              icon={<FeatherType />}
              square={false}
            />
          }
        />
        <ControlAccordion
          title="Route Number 1"
          controls={
            <div className="flex w-full flex-col items-start gap-6">
              <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Height"
                  helpText="Height in pixels"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="14" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (8px)"
                  helpText="Secondary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (16px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (32px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
              </div>
            </div>
          }
          icon={
            <IconWithBackground
              variant="error"
              size="small"
              icon={<FeatherType />}
              square={false}
            />
          }
        />
        <ControlAccordion
          title="Route Number 2"
          controls={
            <div className="flex w-full flex-col items-start gap-6">
              <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Height"
                  helpText="Height in pixels"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="14" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (8px)"
                  helpText="Secondary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (16px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
                <TextField
                  className="h-24 w-auto flex-none"
                  disabled={false}
                  error={false}
                  variant="outline"
                  label="Font Family (32px)"
                  helpText="Primary font family"
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input placeholder="Arial" />
                </TextField>
              </div>
            </div>
          }
          icon={
            <IconWithBackground
              size="small"
              icon={<FeatherType />}
              square={false}
            />
          }
        />
      </div>
      <div className="flex w-full flex-col items-center gap-2 px-4 py-4">
        {actions ? (
          <div className="flex w-full flex-col items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
});

export const FontSettingsDrawer = FontSettingsDrawerRoot;
