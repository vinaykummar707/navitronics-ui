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
  const { register, watch, setValue, formState: { errors } } =
    useFormContext<DisplayConfigPostRequest>();

  const isSplitRoute = watch("is_split_route");

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-3",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      {!isSplitRoute && (
        <TextField
          size="small"
          className="h-auto w-full flex-none"
          label={
            <span>
              Route Number <span className="text-red-500">*</span>
            </span>
          }
          variant="filled"
          error={!!errors.route_number}
          helpText={(errors.route_number?.message as string) || ""}
        >
          <TextField.Input
            placeholder="Enter route number"
            {...register("route_number", {
              required: !isSplitRoute ? "Route number is required" : false,
            })}
          />
        </TextField>
      )}
      <TextField
        size="small"
        className="h-auto w-full flex-none"
        label={
          <span>
            Source <span className="text-red-500">*</span>
          </span>
        }
        variant="filled"
        error={!!errors.source}
        helpText={(errors.source?.message as string) || ""}
      >
        <TextField.Input
          placeholder="Enter source"
          {...register("source", { required: "Source is required" })}
        />
      </TextField>
      <TextField
        size="small"
        className="h-auto w-full flex-none"
        label={
          <span>
            Destination <span className="text-red-500">*</span>
          </span>
        }
        variant="filled"
        error={!!errors.destination}
        helpText={(errors.destination?.message as string) || ""}
      >
        <TextField.Input
          placeholder="Enter destination"
          {...register("destination", { required: "Destination is required" })}
        />
      </TextField>
      <TextField size="small" className="h-auto w-full flex-none" label="Via" variant="filled" helpText="">
        <TextField.Input placeholder="Enter via" {...register("via")} />
      </TextField>
      {/* <TextField
        size="small"
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
      {isSplitRoute && (
        <>
          <TextField
            size="small"
            className="h-auto w-full flex-none"
            label={
              <span>
                Route Number 1 <span className="text-red-500">*</span>
              </span>
            }
            variant="filled"
            error={!!errors.route_number_1}
            helpText={(errors.route_number_1?.message as string) || ""}
          >
            <TextField.Input
              placeholder="Enter route number 1"
              {...register("route_number_1", {
                required: isSplitRoute ? "Route number 1 is required" : false,
              })}
            />
          </TextField>
          <TextField
            size="small"
            className="h-auto w-full flex-none"
            label={
              <span>
                Route Number 2 <span className="text-red-500">*</span>
              </span>
            }
            variant="filled"
            error={!!errors.route_number_2}
            helpText={(errors.route_number_2?.message as string) || ""}
          >
            <TextField.Input
              placeholder="Enter route number 2"
              {...register("route_number_2", {
                required: isSplitRoute ? "Route number 2 is required" : false,
              })}
            />
          </TextField>
        </>
      )}
    </div>
  );
});

export const RouteConfigurationForm = RouteConfigurationFormRoot;
