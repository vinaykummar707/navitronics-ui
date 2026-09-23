import React from "react";
import { Button } from "@/ui/components/Button";
import { JsonViewerDialog } from "@/ui/components/JsonViewerDialog";
import { FeatherChevronLeft, FeatherDownload, FeatherSave } from "@subframe/core";
import RBAC from "@/components/RBAC";

interface RouteCreationHeaderV1Props {
  title?: string;
  mode: "create" | "edit";
  isSubmitting: boolean;
  onSave: () => void;
  onBack: () => void;
  getFormData: () => any;
  onDownloadJson?: () => void;
}

export const RouteCreationHeaderV1: React.FC<RouteCreationHeaderV1Props> = ({
  title = "Route Creation (V1 Config)",
  mode,
  isSubmitting,
  onSave,
  onBack,
  getFormData,
  onDownloadJson,
}) => {
  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-solid border-neutral-border bg-default-background px-4 py-2 flex-none">
      <div className="flex w-64 flex-none items-center gap-2">
        <Button
          variant="neutral-primary"
          icon={<FeatherChevronLeft />}
          onClick={onBack}
        >
          Back
        </Button>
      </div>

      <div className="flex grow shrink-0 basis-0 flex-col items-center gap-1">
        <span className="text-body-bold font-body-bold text-default-font">
          {title}
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 flex-wrap">
        {onDownloadJson && (
          <Button
            variant="neutral-secondary"
            icon={<FeatherDownload />}
            onClick={onDownloadJson}
            title="Download JSON file"
          >
            Download JSON
          </Button>
        )}

        <RBAC roles={["master"]} features={[]}>
          <JsonViewerDialog
            dialogTitle="V1 Route Configuration"
            buttonLabel="View JSON"
            getJsonData={getFormData}
          />
        </RBAC>

        <Button
          type="button"
          onClick={onSave}
          variant="brand-primary"
          icon={<FeatherSave />}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Saving..."
            : mode === "edit"
            ? "Update Route"
            : "Save Route"}
        </Button>
      </div>
    </div>
  );
};
