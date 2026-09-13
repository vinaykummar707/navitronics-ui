"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Dialog — https://app.subframe.com/11b10bc240cf/library?component=Dialog_ca59db17-43fb-4247-8094-3c55162e902d
 * Icon Button — https://app.subframe.com/11b10bc240cf/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Json Viewer Dialog — https://app.subframe.com/11b10bc240cf/library?component=Json+Viewer+Dialog_850a8b20-6464-4d6d-acd0-69d3d98a3c61
 */

import React from "react";
import { FeatherCopy, FeatherCurlyBraces } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { IconButton } from "./IconButton";
import ReactJson from 'react-json-view';

interface JsonViewerDialogRootProps extends React.HTMLAttributes<HTMLDivElement> {
  buttonLabel?: React.ReactNode;
  dialogTitle?: React.ReactNode;
  jsonContent?: string;
  getJsonData?: () => any;
  size?: "large" | "medium" | "small";
  variant?: any;
  buttonClassName?: string;
  className?: string;
}

const JsonViewerDialogRoot = React.forwardRef<
  HTMLDivElement,
  JsonViewerDialogRootProps
>(function JsonViewerDialogRoot(
  {
    buttonLabel,
    dialogTitle,
    jsonContent,
    getJsonData,
    size = "small",
    variant = "neutral-secondary",
    buttonClassName,
    className,
    ...otherProps
  }: JsonViewerDialogRootProps,
  ref,
) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [resolvedData, setResolvedData] = React.useState<any>(null);

  const handleOpenDialog = () => {
    if (getJsonData) {
      setResolvedData(getJsonData());
    } else if (jsonContent) {
      try {
        setResolvedData(JSON.parse(jsonContent));
      } catch {
        setResolvedData({ raw: jsonContent });
      }
    }
    setIsOpen(true);
  };

  // handle copy JSON content to clipboard
  const handleCopy = () => {
    if (resolvedData) {
      const textToCopy = typeof resolvedData === "string" ? resolvedData : JSON.stringify(resolvedData, null, 2);
      navigator.clipboard.writeText(textToCopy);
    } else if (jsonContent) {
      navigator.clipboard.writeText(jsonContent);
    }
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "inline-flex items-center",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <Button
        variant={variant}
        size={size}
        className={SubframeUtils.twClassNames("h-8 text-xs font-medium px-3", buttonClassName)}
        icon={<FeatherCurlyBraces className="h-3.5 w-3.5" />}
        onClick={handleOpenDialog}
      >
        {buttonLabel}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content className="h-256 w-144 flex-none ">
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 p-3">
            <div className="flex w-full items-center justify-between">
              {dialogTitle ? (
                <span className="text-heading-3 font-heading-3 text-default-font">
                  {dialogTitle}
                </span>
              ) : null}
              <div className="flex items-center gap-2">
                <Button icon={<FeatherCopy />} variant="neutral-primary" onClick={handleCopy}>
                  Copy JSON
                </Button>
                <IconButton onClick={() => setIsOpen(false)} variant="neutral-primary" icon={<FeatherX />} />
              </div>
            </div>
            <div className="flex w-full no-scrollbar grow shrink-0 basis-0 items-start justify-start overflow-auto rounded-md border border-solid border-neutral-border bg-default-background p-2">
              {isOpen && resolvedData ? (
                <ReactJson
                  src={resolvedData}
                  name={null}
                  theme="apathy"
                  collapsed={false}
                  enableClipboard={false}
                  displayDataTypes={false}
                  displayObjectSize={false}
                />
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
});

export const JsonViewerDialog = JsonViewerDialogRoot;
