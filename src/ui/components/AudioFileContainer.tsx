"use client";
/*
 * Documentation:
 * AudioFileContainer — https://app.subframe.com/11b10bc240cf/library?component=AudioFileContainer_cb573e3c-5f31-4f33-b791-766d69703447
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 */

import React from "react";
import { FeatherAudioWaveform } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";

interface AudioFileContainerRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  fileName?: React.ReactNode;
  fileSize?: React.ReactNode;
  actions?: React.ReactNode;
  isAudioAvailable?: boolean;
  audioFileActions?: React.ReactNode;
  className?: string;
}

const AudioFileContainerRoot = React.forwardRef<
  HTMLDivElement,
  AudioFileContainerRootProps
>(function AudioFileContainerRoot(
  {
    fileName,
    fileSize,
    actions,
    isAudioAvailable = false,
    audioFileActions,
    className,
    ...otherProps
  }: AudioFileContainerRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/cb573e3c flex w-full flex-col items-start gap-2 rounded-md border  border-neutral-100",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-2">
        <div className="flex w-full flex-col items-start gap-2  px-4 py-4">
          <div
            className={SubframeUtils.twClassNames(
              "flex w-full items-start justify-between",
              { hidden: isAudioAvailable }
            )}
          >
            <div className="flex items-center gap-3">
              <IconWithBackground
                variant="error"
                size="medium"
                icon={<FeatherAudioWaveform />}
                square={false}
              />
              {fileSize ? (
                <span className="text-caption-bold font-caption-bold text-subtext-color">
                  {fileSize}
                </span>
              ) : null}
            </div>
            {actions ? (
              <div className="flex items-center gap-2">{actions}</div>
            ) : null}
          </div>
          <div
            className={SubframeUtils.twClassNames(
              "hidden w-full items-start justify-between",
              { flex: isAudioAvailable }
            )}
          >
            <div className="flex items-center gap-3">
              <IconWithBackground
                variant="error"
                size="medium"
                icon={<FeatherAudioWaveform />}
                square={false}
              />
              <div className="flex flex-col items-start gap-1">
                {fileName ? (
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    {fileName}
                  </span>
                ) : null}
                {fileSize ? (
                  <span className="text-caption font-caption text-subtext-color">
                    {fileSize}
                  </span>
                ) : null}
              </div>
            </div>
            {audioFileActions ? (
              <div className="flex items-center gap-2">{audioFileActions}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

export const AudioFileContainer = AudioFileContainerRoot;
