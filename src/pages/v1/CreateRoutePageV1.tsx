import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { Button } from "@/ui/components/Button";
import { FeatherChevronLeft, FeatherExternalLink } from "@subframe/core";
import { toast } from "react-toastify";

interface RouteParams extends Record<string, string> {
  areaId: string;
  depotId: string;
  routeId?: string;
}

export const CreateRoutePageV1: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useLoggedUserStore((state) => state.user);
  const { areaId, depotId, routeId } = useParams<RouteParams>();
  const isEdit = Boolean(routeId);

  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine V1 App URL: configurable via VITE_V1_APP_URL, defaulting to localhost:3090 in dev or navitronix.in in prod
  const defaultHost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:3090"
      : "https://navitronix.in";

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
        navigate("/home/routes");
      } else if (data.type === "NAVITRONIX_V1_ROUTE_BACK") {
        navigate("/home/routes");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, queryClient, isEdit]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-default-background">
      {/* Top Header Bar */}
      <div className="flex h-12 w-full items-center justify-between border-b border-solid border-neutral-border bg-default-background px-4 py-2 flex-none z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-primary"
            icon={<FeatherChevronLeft />}
            onClick={() => navigate("/home/routes")}
          >
            Back to Routes
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-body-bold font-body-bold text-default-font">
            {isEdit ? "Edit Route (V1 Live Simulator)" : "Route Creation (V1 Live Simulator)"}
          </span>
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 border border-brand-200">
            V1 Live App (Supabase)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="neutral-secondary"
            icon={<FeatherExternalLink />}
            onClick={() => window.open(iframeSrc, "_blank")}
            title="Open in new window"
          >
            Open Standalone
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
