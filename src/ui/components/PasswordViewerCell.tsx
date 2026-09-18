import React, { useState } from "react";
import { FeatherCheck, FeatherCopy, FeatherEye, FeatherEyeOff } from "@subframe/core";
import { IconButton } from "./IconButton";
import { toast } from "react-toastify";

interface PasswordViewerCellProps {
  password?: string | null;
}

export const PasswordViewerCell: React.FC<PasswordViewerCellProps> = ({ password }) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!password) {
    return <span className="text-caption text-subtext-color">—</span>;
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Password copied to clipboard", { autoClose: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealed((prev) => !prev);
  };

  return (
    <div
      className="flex items-center gap-1.5 min-w-[140px]"
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="font-mono text-xs select-all text-default-font font-medium truncate max-w-[100px]"
        title={revealed ? password : "Click eye to reveal"}
      >
        {revealed ? password : "••••••••"}
      </span>
      <div className="flex items-center gap-0.5 shrink-0">
        <IconButton
          size="small"
          variant="neutral-tertiary"
          icon={
            revealed ? (
              <FeatherEyeOff className="h-3.5 w-3.5 text-subtext-color hover:text-default-font" />
            ) : (
              <FeatherEye className="h-3.5 w-3.5 text-subtext-color hover:text-default-font" />
            )
          }
          onClick={handleToggle}
          title={revealed ? "Hide password" : "Show password"}
        />
        <IconButton
          size="small"
          variant="neutral-tertiary"
          icon={
            copied ? (
              <FeatherCheck className="h-3.5 w-3.5 text-success-500" />
            ) : (
              <FeatherCopy className="h-3.5 w-3.5 text-subtext-color hover:text-default-font" />
            )
          }
          onClick={handleCopy}
          title="Copy password"
        />
      </div>
    </div>
  );
};
