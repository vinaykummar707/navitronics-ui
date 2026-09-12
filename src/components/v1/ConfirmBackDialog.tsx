import React from "react";
import { Dialog } from "@/ui/components/Dialog";
import { Button } from "@/ui/components/Button";
import { FeatherSave } from "@subframe/core";

interface ConfirmBackDialogProps {
  open: boolean;
  onSaveAndGoBack: () => void;
  onGoBackWithoutSaving: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const ConfirmBackDialog: React.FC<ConfirmBackDialogProps> = ({
  open,
  onSaveAndGoBack,
  onGoBackWithoutSaving,
  onCancel,
  isSaving = false,
}) => (
  <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
    <Dialog.Content className="p-6 max-w-md w-full">
      <div className="flex flex-col gap-2 w-full">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Unsaved Changes
        </span>
        <span className="text-body font-body text-subtext-color">
          You have unsaved changes. Do you want to save this route before leaving?
        </span>
      </div>
      <div className="flex w-full items-center justify-end gap-2 pt-4 border-t border-neutral-border mt-4">
        <Button
          variant="neutral-secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          variant="destructive-secondary"
          onClick={onGoBackWithoutSaving}
          disabled={isSaving}
        >
          Leave Without Saving
        </Button>
        <Button
          variant="brand-primary"
          icon={<FeatherSave />}
          onClick={onSaveAndGoBack}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save & Exit"}
        </Button>
      </div>
    </Dialog.Content>
  </Dialog>
);
