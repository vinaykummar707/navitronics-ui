"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * CreateStopForm — https://app.subframe.com/11b10bc240cf/library?component=CreateStopForm_c993f456-f352-45ca-ad8d-ef6824cba673
 * Select — https://app.subframe.com/11b10bc240cf/library?component=Select_bb88f90b-8c43-4b73-9c2f-3558ce7838f3
 * Text Field — https://app.subframe.com/11b10bc240cf/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 */

import React from "react";
import { FeatherCheck } from "@subframe/core";
import { FeatherMapPin } from "@subframe/core";
import { FeatherPin } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { Select } from "./Select";
import { TextField } from "./TextField";

interface CreateStopFormRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CreateStopFormRoot = React.forwardRef<
  HTMLDivElement,
  CreateStopFormRootProps
>(function CreateStopFormRoot(
  { className, ...otherProps }: CreateStopFormRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start gap-4 bg-default-background px-6 py-6",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Create Stop
        </span>
        <span className="text-caption font-caption text-subtext-color">
          Fill in the details below to create a new Stop
        </span>
      </div>
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4">
        
        <TextField
          className="h-auto w-full flex-none"
          label="Stop Name"
          helpText="Enter the name of your stop"
          icon={<FeatherMapPin />}
        >
          <TextField.Input placeholder="Gachibowli" />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Up Latitude"
          helpText="Upward Latitude"
          icon={<FeatherPin />}
        >
          <TextField.Input placeholder="13.1132212" />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Up Longitude"
          helpText="Upward Latitude"
          icon={<FeatherPin />}
        >
          <TextField.Input placeholder="13.1132212" />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Down Latitude"
          helpText="Return Latitude"
          icon={<FeatherPin />}
        >
          <TextField.Input placeholder="13.1132212" />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Down Longitude"
          helpText="Return Longitude"
          icon={<FeatherPin />}
        >
          <TextField.Input placeholder="13.1132212" />
        </TextField>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <Button className="h-9 w-full flex-none" icon={<FeatherCheck />}>
          Submit
        </Button>
        <Button className="h-9 w-full flex-none" variant="neutral-secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
});

export const CreateStopForm = CreateStopFormRoot;
