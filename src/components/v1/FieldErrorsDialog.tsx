import React from "react";
import { Dialog } from "@/ui/components/Dialog";
import { Button } from "@/ui/components/Button";
import { FeatherAlertTriangle } from "@subframe/core";

interface FieldErrorsDialogProps {
  open: boolean;
  onClose: () => void;
  errorMessages: string[];
}

export const FieldErrorsDialog: React.FC<FieldErrorsDialogProps> = ({
  open,
  onClose,
  errorMessages,
}) => (
  <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
    <Dialog.Content className="p-6 max-w-md w-full">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-50 text-error-600 flex-none">
          <FeatherAlertTriangle className="h-5 w-5" />
        </div>
        <span className="text-heading-3 font-heading-3 text-default-font">
          Required Fields Missing
        </span>
      </div>
      <div className="flex flex-col gap-2 pt-3 w-full">
        <span className="text-caption font-caption text-subtext-color">
          Please fix the following validation errors before saving:
        </span>
        <ul className="list-disc pl-5 space-y-1 text-body font-body text-error-700">
          {errorMessages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
      <div className="flex w-full justify-end pt-4 border-t border-neutral-border mt-4">
        <Button variant="neutral-primary" onClick={onClose}>
          Got it
        </Button>
      </div>
    </Dialog.Content>
  </Dialog>
);
