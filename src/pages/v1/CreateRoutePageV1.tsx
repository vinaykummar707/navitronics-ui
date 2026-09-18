import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { isRegularCustomer } from "@/utils/customerType";
import { Button } from "@/ui/components/Button";
import { FeatherChevronLeft, FeatherExternalLink } from "@subframe/core";
import { toast } from "react-toastify";

interface RouteParams extends Record<string, string | undefined> {
  areaId?: string;
  depotId?: string;
  routeId?: string;
}

export const CreateRoutePageV1: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useLoggedUserStore((state) => state.user);
  const isRegular = isRegularCustomer(user);
  const targetRoutesPage = isRegular ? "/home/regular-routes" : "/home/routes";
  const { areaId, depotId, routeId } = useParams<RouteParams>();
  const isEdit = Boolean(routeId);

  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine V1 App URL: configurable via VITE_V1_APP_URL, defaulting to localhost:3090 in dev or navitronix.in in prod
  const defaultHost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://31.97.228.29:9091"
      : "http://31.97.228.29:9091";

  const v1BaseUrl = (import.meta.env.VITE_V1_APP_URL || defaultHost).replace(/\/$/, "");
  const userParam = user?.id ? `?userId=${encodeURIComponent(user.id)}` : "";
  const iframeSrc = `${v1BaseUrl}/route-create/${areaId || ""}/${depotId || ""}${
    routeId ? `/${routeId}` : ""
  }${userParam}`;

  // Listen to postMessage from the V1 embedded app
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if not in development
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "NAVITRONIX_V1_ROUTE_SAVED") {
        toast.success(
          isEdit
            ? "V1 Route updated successfully in Supabase"
            : "V1 Route created successfully in Supabase"
        );
        queryClient.invalidateQueries({ queryKey: ["routes"] });
        navigate(targetRoutesPage);
      } else if (data.type === "NAVITRONIX_V1_ROUTE_BACK") {
        navigate(targetRoutesPage);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, queryClient, isEdit, targetRoutesPage]);

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-default-background pt-safe pb-safe">
      {/* Top Header Bar */}
      <div className="flex min-h-[48px] w-full items-center justify-between border-b border-solid border-neutral-border bg-default-background px-2.5 sm:px-4 py-2 flex-none z-10 shadow-sm gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="neutral-secondary"
            size="small"
            className="h-8 text-xs font-medium px-2.5 sm:px-3 shrink-0"
            icon={<FeatherChevronLeft className="h-3.5 w-3.5" />}
            onClick={() => navigate(targetRoutesPage)}
            title="Return to Routes list"
          >
            <span className="hidden sm:inline">Back</span>
          </Button>
          <span className="text-body-bold font-body-bold text-default-font truncate text-xs sm:text-sm">
            {isEdit ? "Edit Route (V1 Simulator)" : "Create Route (V1 Simulator)"}
          </span>
          <span className="hidden md:inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 border border-brand-200 shrink-0">
            V1 Live App
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="neutral-secondary"
            size="small"
            className="h-8 text-xs px-2 sm:px-3"
            icon={<FeatherExternalLink className="h-3.5 w-3.5" />}
            onClick={() => window.open(iframeSrc, "_blank")}
            title="Open in new window"
          >
            <span className="hidden sm:inline">Open Standalone</span>
            <span className="sm:hidden">External</span>
          </Button>
        </div>
      </div>

      {/* Embedded V1 App Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-neutral-100">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-default-background gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-800" />
            <span className="text-caption font-caption text-subtext-color">
              Loading V1 Route Creation Simulator from {v1BaseUrl}...
            </span>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="V1 Route Creation Simulator"
          className="w-full h-full border-none"
          allow="clipboard-read; clipboard-write"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default CreateRoutePageV1;
