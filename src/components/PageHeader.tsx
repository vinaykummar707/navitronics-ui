import { Button } from "@/ui/components/Button";
import { FeatherPlus, FeatherRefreshCw } from "@subframe/core";
import React from "react";
import RBAC from "./RBAC";
import { toast } from "react-toastify";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  count: number;
  onRefetch: () => void;
  onAdd: () => void;
  buttonLabel?: string;
  roles?: string[]; // Optional roles for RBAC
  extraActions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  count,
  onRefetch,
  onAdd,
  buttonLabel = "Add Organization",
  roles = [],
  extraActions,
}) => {
  return (
    <div className="flex w-full flex-col items-start gap-1">
      <span className="w-full text-heading-2 font-heading-2 text-default-font">
        {title}
      </span>
      <span className="text-body font-body text-subtext-color">{subtitle}</span>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full mt-1">
        <span className="text-caption font-caption text-subtext-color">
          Showing {count} records
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end flex-wrap">
          <Button
            variant="neutral-primary"
            className="h-9 flex-1 sm:flex-none"
            icon={<FeatherRefreshCw />}
            onClick={() => {
              toast.success(`${title} refreshed successfully`);
              onRefetch();
            }}
          >
            Refresh
          </Button>
          {extraActions}
          <RBAC features={[]} roles={roles}>
            <Button
              variant="brand-primary"
              className="h-9 flex-1 sm:flex-none"
              icon={<FeatherPlus />}
              onClick={onAdd}
            >
              {buttonLabel}
            </Button>
          </RBAC>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
