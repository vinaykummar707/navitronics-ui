"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * RouteCreationHeader — https://app.subframe.com/11b10bc240cf/library?component=RouteCreationHeader_2c1f8c72-5508-4e9b-9575-25f7e76705fb
 */

import React from "react";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherCloud } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";
import { FeatherEye } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";

interface RouteCreationHeaderRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const RouteCreationHeaderRoot = React.forwardRef<
  HTMLDivElement,
  RouteCreationHeaderRootProps
>(function RouteCreationHeaderRoot(
  { className, ...otherProps }: RouteCreationHeaderRootProps,
  ref
) {

 const { handleSubmit } = useFormContext<DisplayConfigPostRequest>();

    const onSubmit: SubmitHandler<DisplayConfigPostRequest> = (data) => {
      console.log("Form Data Submitted:", data);
    };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-16 w-full items-center justify-between border-b border-solid border-neutral-border px-3 py-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-64 flex-none items-center justify-between">
        <Button variant="neutral-secondary" icon={<FeatherChevronLeft />}>
          Back
        </Button>
      </div>
      <div className="flex grow shrink-0 basis-0 flex-col items-center gap-2 px-2 py-2">
        <span className="text-body-bold font-body-bold text-default-font">
          Route Creation
        </span>
      </div>
      <div className="flex w-64 flex-none items-center justify-end gap-2">
        <Button variant="neutral-secondary" icon={<FeatherEye />}>
          View JSON
        </Button>
        <Button variant="neutral-secondary" icon={<FeatherDownload />}>
          Download JSON
        </Button>
        <Button type="submit" onClick={handleSubmit(onSubmit)} variant="brand-secondary-2" icon={<FeatherCloud />}>
          Save Route
        </Button>
      </div>
    </div>
  );
});

export const RouteCreationHeader = RouteCreationHeaderRoot;
