"use client";
/*
 * Documentation:
 * Checkbox — https://app.subframe.com/11b10bc240cf/library?component=Checkbox_3816e3b5-c48c-499b-b45e-0777c6972523
 * RouteConfigurationForm — https://app.subframe.com/11b10bc240cf/library?component=RouteConfigurationForm_e8e925aa-55b1-4bf5-a6ca-b26d8de92bf6
 * Text Field — https://app.subframe.com/11b10bc240cf/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Checkbox } from "./Checkbox";
import { TextField } from "./TextField";
import { useFormContext, Watch } from "react-hook-form";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";

interface RouteConfigurationFormRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const RouteConfigurationFormRoot = React.forwardRef<
  HTMLDivElement,
  RouteConfigurationFormRootProps
>(function RouteConfigurationFormRoot(
  { className, ...otherProps }: RouteConfigurationFormRootProps,
  ref,
) {
  const { register, watch, setValue } =
    useFormContext<DisplayConfigPostRequest>();

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-4",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <TextField
        className="h-auto w-full flex-none"
        label="Route Number"
        variant="filled"
        helpText=""
      >
        <TextField.Input
          placeholder="Enter route number"
          {...register("route_number")}
        />
      </TextField>
      <TextField className="h-auto w-full flex-none" label="Source" variant="filled" helpText="">
        <TextField.Input placeholder="Enter source" {...register("source")} />
      </TextField>
      <TextField
        className="h-auto w-full flex-none"
        label="Destination"
        variant="filled"
        helpText=""
      >
        <TextField.Input
          placeholder="Enter destination"
          {...register("destination")}
        />
      </TextField>
      <TextField className="h-auto w-full flex-none" label="Via" variant="filled" helpText="">
        <TextField.Input placeholder="Enter via" {...register("via")} />
      </TextField>
      {/* <TextField
        className="h-auto w-full flex-none"
        label="Separation"
        variant="filled"
        helpText=""
      >
        <TextField.Input placeholder="Enter separation" {...register("separation")} />
      </TextField> */}
      <Checkbox
        checked={watch("is_split_route")}
        onCheckedChange={(bool) => setValue("is_split_route", bool)}
        label="Is Split Route"
      />
      {watch("is_split_route") && (
        <>
          {" "}
          <TextField
            className="h-auto w-full flex-none"
            label="Route Number 1"
            variant="filled"
            helpText=""
          >
            <TextField.Input
              placeholder="Enter route number 1"
              {...register("route_number_1")}
            />
          </TextField>
          <TextField
            className="h-auto w-full flex-none"
            label="Route Number 2"
            variant="filled"
            helpText=""
          >
            <TextField.Input
              placeholder="Enter route number 2"
              {...register("route_number_2")}
            />
          </TextField>{" "}
        </>
      )}
    </div>
  );
});

export const RouteConfigurationForm = RouteConfigurationFormRoot;
