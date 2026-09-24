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

import { stopCrud } from "@/types/IStop";

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
  const depotId = watch("depot_id");
  const { data: stopsData } = stopCrud.useList({
    filters: { depot_id: depotId || "" },
    skip: !depotId,
  });
  const depotStops = (stopsData?.data as any[]) || [];

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-3",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      {/* 1. Split Route Toggle */}
      <div className="flex items-center justify-between w-full p-2.5 rounded-lg bg-neutral-100/60 border border-neutral-border">
        <div className="flex flex-col">
          <span className="text-caption-bold font-caption-bold text-default-font">Split Route</span>
          <span className="text-micro text-subtext-color">Enable dual route numbers</span>
        </div>
        <Checkbox
          checked={watch("is_split_route")}
          onCheckedChange={(bool) => setValue("is_split_route", bool)}
        />
      </div>

      {/* 2. Route Number Fields */}
      {!isSplitRoute ? (
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
      ) : (
        <div className="grid grid-cols-2 gap-2 w-full">
          <TextField
            size="small"
            className="h-auto w-full flex-none"
            label={
              <span>
                Route #1 <span className="text-red-500">*</span>
              </span>
            }
            variant="filled"
            error={!!errors.route_number_1}
            helpText={(errors.route_number_1?.message as string) || ""}
          >
            <TextField.Input
              placeholder="e.g. 101"
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
                Route #2 <span className="text-red-500">*</span>
              </span>
            }
            variant="filled"
            error={!!errors.route_number_2}
            helpText={(errors.route_number_2?.message as string) || ""}
          >
            <TextField.Input
              placeholder="e.g. 102"
              {...register("route_number_2", {
                required: isSplitRoute ? "Route number 2 is required" : false,
              })}
            />
          </TextField>
        </div>
      )}

      {/* 3. Path Endpoints & Waypoints */}
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
          list="depot-stops-source-list"
          {...register("source", { required: "Source is required" })}
        />
      </TextField>
      <datalist id="depot-stops-source-list">
        {depotStops.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </datalist>

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
          list="depot-stops-dest-list"
          {...register("destination", { required: "Destination is required" })}
        />
      </TextField>
      <datalist id="depot-stops-dest-list">
        {depotStops.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </datalist>

      <TextField size="small" className="h-auto w-full flex-none" label="Via" variant="filled" helpText="">
        <TextField.Input placeholder="Enter via" list="depot-stops-via-list" {...register("via")} />
      </TextField>
      <datalist id="depot-stops-via-list">
        {depotStops.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </datalist>
    </div>
  );
});

export const RouteConfigurationForm = RouteConfigurationFormRoot;
