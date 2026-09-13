import React, { useState } from "react";
import { Dialog } from "@/ui/components/Dialog";
import { RadioCardGroup } from "@/ui/components/RadioCardGroup";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherDownload, FeatherX, FeatherFileText } from "@subframe/core";

interface ExportFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirmExport: (format: "v1" | "v2") => void;
  hasV1?: boolean;
  hasV2?: boolean;
}

export function ExportFormatDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirmExport,
  hasV1 = true,
  hasV2 = true,
}: ExportFormatDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<"v1" | "v2">(
    hasV1 ? "v1" : "v2"
  );

  React.useEffect(() => {
    if (open) {
      setSelectedFormat(hasV1 ? "v1" : "v2");
    }
  }, [open, hasV1, hasV2]);

  const handleExport = () => {
    onConfirmExport(selectedFormat);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="w-full max-w-md flex-none p-6">
        <div className="flex w-full flex-col gap-6">
          {/* Header */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <FeatherFileText className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Export Selected Routes
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  Exporting {selectedCount} selected route{selectedCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <IconButton
              variant="neutral-tertiary"
              icon={<FeatherX />}
              onClick={() => onOpenChange(false)}
            />
          </div>

          {/* Description */}
          <span className="text-body font-body text-default-font">
            Please choose the JSON configuration format to export:
          </span>

          {/* Format Options */}
          {/* Format Options */}
          <RadioCardGroup
            className="flex-col gap-3"
            value={selectedFormat}
            onValueChange={(val) => setSelectedFormat(val as "v1" | "v2")}
          >
            {hasV1 && (
              <RadioCardGroup.RadioCard
                value="v1"
                checked={selectedFormat === "v1"}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-body-bold font-body-bold text-default-font">
                    V1 Portal Format (Legacy)
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    Converts route configs to V1 schema with language-nested display configurations (<code className="text-xs">v1.json</code>).
                  </span>
                </div>
              </RadioCardGroup.RadioCard>
            )}

            {hasV2 && (
              <RadioCardGroup.RadioCard
                value="v2"
                checked={selectedFormat === "v2"}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-body-bold font-body-bold text-default-font">
                    V2 Portal Format (Current)
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    Exports route configs in standard V2 schema as stored (<code className="text-xs">v2.json</code>).
                  </span>
                </div>
              </RadioCardGroup.RadioCard>
            )}
          </RadioCardGroup>

          {/* Action Buttons */}
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <Button
              variant="neutral-secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              icon={<FeatherDownload />}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
