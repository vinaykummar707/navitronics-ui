"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/ui/components/Button";
import {
  FeatherAlertTriangle,
  FeatherDownload,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherSearch,
  FeatherTrash,
  FeatherX,
} from "@subframe/core";
import { IconButton } from "@/ui";
import { TextField } from "@/ui/components/TextField";
import { IRoute, routeCrud } from "@/types/IRoute";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { RouteTable } from "@/ui/components/RouteTable";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";
import { convertV2ToV1 } from "@/utils/routeConfigMapper";
import { Dialog } from "@/ui/components/Dialog";
import { getUserRouteAccess } from "@/utils/featureFlags";
import { isRegularCustomer, isSuperAdmin } from "@/utils/customerType";
import { pickTargetDirectory, writeZipToDirectoryOrFallback } from "@/utils/fileSystemExport";
import { sortByLatestCreated } from "@/utils/dateUtils";

export default function RegularRoutesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightRouteId =
    searchParams.get("highlightRouteId") || searchParams.get("routeId");
  const user = useLoggedUserStore((state) => state.user);
  const routeAccess = getUserRouteAccess(user);
  const isRegular = isRegularCustomer(user);
  const isSuper = isSuperAdmin(user);

  const { useList, useDelete, useCreate, useDeleteAll } = routeCrud;
  const { mutate: deleteRoute } = useDelete();
  const { mutate: createRoute } = useCreate();
  const { mutate: deleteSelectedRoutes } = useDeleteAll();

  // Query: if Regular, only user's own routes. If Super Admin, all standalone routes (depot_id is null)
  const { data: routesData, refetch: refetchRoutes, isLoading } = useList({
    filters: isRegular
      ? {
        created_by: user?.id || "",
      }
      : {},
    orderBy: { column: "created_at", ascending: false },
    custom(query) {
      let q = query.select(`*, created_by_user:created_by (email)`);
      if (isSuper) {
        q = q.is("depot_id", null);
      }
      return q;
    },
    skip: isRegular ? !user?.id : false,
  });

  const routes = (routesData?.data as IRoute[]) || [];

  // Auto-open route creation if URL has ?create=true
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      if (routeAccess.isV1Only) {
        navigate("/routes/create-v1", { replace: true });
      } else {
        navigate("/routes/create", { replace: true });
      }
    }
  }, [searchParams, routeAccess.isV1Only, navigate]);

  const [versionFilter, setVersionFilter] = useState<"all" | "v1" | "v2">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredRoutes = useMemo(() => {
    if (!routes) return [];
    let result = routes;

    // Version filter
    if (routeAccess.isV1Only) {
      result = result.filter((r) => r.version === "1.0");
    } else if (routeAccess.isV2Only) {
      result = result.filter((r) => r.version !== "1.0");
    } else if (versionFilter === "v1") {
      result = result.filter((r) => r.version === "1.0");
    } else if (versionFilter === "v2") {
      result = result.filter((r) => r.version !== "1.0");
    }

    // Search query filter
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter((r) => {
        const routeNum = (r.route_number || "").toLowerCase();
        const routeNum1 = (r.route_number_1 || "").toLowerCase();
        const routeNum2 = (r.route_number_2 || "").toLowerCase();
        const source = (r.source || "").toLowerCase();
        const destination = (r.destination || "").toLowerCase();
        const via = (r.via || "").toLowerCase();
        const email = (r.created_by_user?.email || "").toLowerCase();

        return (
          routeNum.includes(q) ||
          routeNum1.includes(q) ||
          routeNum2.includes(q) ||
          source.includes(q) ||
          destination.includes(q) ||
          via.includes(q) ||
          email.includes(q)
        );
      });
    }

    return sortByLatestCreated(result);
  }, [routes, routeAccess.isV1Only, routeAccess.isV2Only, versionFilter, debouncedSearchQuery]);

  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);

  const selectedRouteIdsSet = useMemo(
    () => new Set(selectedRouteIds),
    [selectedRouteIds]
  );

  const selectedRouteObjects = useMemo(() => {
    if (!filteredRoutes || selectedRouteIds.length === 0) return [];
    return filteredRoutes.filter((route) => selectedRouteIdsSet.has(route.id));
  }, [filteredRoutes, selectedRouteIdsSet]);

  const handleSelectedChange = (routeId: string, selected: boolean) => {
    setSelectedRouteIds((prev) => {
      if (selected) {
        return prev.includes(routeId) ? prev : [...prev, routeId];
      } else {
        return prev.filter((id) => id !== routeId);
      }
    });
  };

  const handleSelectAllChange = (selected: boolean) => {
    if (selected && filteredRoutes) {
      setSelectedRouteIds(filteredRoutes.map((r) => r.id));
    } else {
      setSelectedRouteIds([]);
    }
  };

  // Auto-focus, select, and scroll to highlighted route from navigation
  useEffect(() => {
    if (!highlightRouteId || !routes || routes.length === 0) return;
    const target = routes.find((r) => r.id === highlightRouteId);
    if (target) {
      // 1. Auto-select the route
      setSelectedRouteIds((prev) =>
        prev.includes(highlightRouteId) ? prev : [highlightRouteId, ...prev]
      );

      // 2. Adjust version filter if target would be filtered out
      if (target.version === "1.0" && versionFilter === "v2") {
        setVersionFilter("all");
      } else if (target.version !== "1.0" && versionFilter === "v1") {
        setVersionFilter("all");
      }

      // 3. Smoothly scroll target into view
      const timer = setTimeout(() => {
        const rowElement = document.getElementById(`route-row-${highlightRouteId}`);
        if (rowElement) {
          rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [highlightRouteId, routes]);

  const handleAddV1Route = () => {
    navigate("/routes/create-v1");
  };

  const handleAddV2Route = () => {
    navigate("/routes/create");
  };

  const handleEditRoute = (routeId: string) => {
    const route = routes?.find((r) => r.id === routeId);
    const isV1 = route?.version === "1.0";

    if (isV1) {
      if (!routeAccess.hasV1Routes) {
        toast.error("You do not have permission to edit V1 routes");
        return;
      }
      navigate(`/routes/create-v1/${routeId}`);
    } else {
      if (!routeAccess.hasV2Routes) {
        toast.error("You do not have permission to edit V2 routes");
        return;
      }
      navigate(`/routes/create/${routeId}`);
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    deleteRoute(routeId, {
      onSuccess: () => {
        toast.success("Route deleted successfully");
        refetchRoutes();
      },
      onError: (error) => {
        toast.error(`Error deleting route: ${error.message || "Unknown error"}`);
      },
    });
  };

  const handleDeleteSelectedRoutes = () => {
    deleteSelectedRoutes(selectedRouteIds, {
      onSuccess: () => {
        toast.success("Selected routes deleted successfully");
        setSelectedRouteIds([]);
        refetchRoutes();
      },
      onError: (error) => {
        toast.error(`Error deleting selected routes: ${error.message || "Unknown error"}`);
      },
    });
  };

  const duplicateRoute = async (routeId: string, routeNumberSuffix: string) => {
    const { data: originalRoute, error: fetchError } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !originalRoute) {
      toast.error("Error fetching route to duplicate");
      return;
    }

    const { id, ...routeWithoutId } = originalRoute;
    const baseNumber = (originalRoute.route_number || "").trim();
    const suffix = routeNumberSuffix === " (Copy)" ? "D" : (routeNumberSuffix || "D");
    let candidateNumber = `${baseNumber}${suffix}`;

    // Check duplicate for regular customer
    const { data: existing } = await supabase
      .from("routes")
      .select("id")
      .eq("created_by", user?.id || "")
      .is("depot_id", null)
      .ilike("route_number", candidateNumber)
      .maybeSingle();

    if (existing) {
      candidateNumber = `${baseNumber}${suffix}1`;
    }

    createRoute(
      {
        ...routeWithoutId,
        route_number: candidateNumber,
        created_at: new Date().toISOString(),
        created_by: user?.id || "",
        organization_id: null,
        depot_id: null,
      },
      {
        onSuccess: () => {
          toast.success(`Route duplicated as "${candidateNumber}"`);
          refetchRoutes();
        },
        onError: (error: any) => {
          if (error?.code === "23505" || error?.message?.includes("23505")) {
            toast.error(`Route "${candidateNumber}" already exists in your account.`);
          } else {
            toast.error(`Error duplicating route: ${error.message || "Unknown error"}`);
          }
        },
      },
    );
  };

  const handleReturn = async (routeId: string, routeNumberSuffix: string) => {
    const { data: originalRoute, error: fetchError } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !originalRoute) {
      toast.error("Error fetching return Route");
      return;
    }

    const { id, ...routeWithoutId } = originalRoute;

    let reversedStops = originalRoute.stops;
    if (originalRoute.stops) {
      try {
        const parsed =
          typeof originalRoute.stops === "string"
            ? JSON.parse(originalRoute.stops)
            : originalRoute.stops;
        if (Array.isArray(parsed)) {
          reversedStops = JSON.stringify([...parsed].reverse());
        }
      } catch (err) {
        console.error("Error reversing stops for return route:", err);
      }
    }

    const suffix = routeNumberSuffix === "(Return)" ? "R" : routeNumberSuffix;
    const newRouteNumber = originalRoute.route_number?.endsWith("R")
      ? `${originalRoute.route_number}-R`
      : `${originalRoute.route_number}${suffix}`;

    let swappedConfig = originalRoute.config;
    if (originalRoute.config) {
      try {
        let configStr =
          typeof originalRoute.config === "string"
            ? originalRoute.config
            : JSON.stringify(originalRoute.config);
        const oldSrc = (originalRoute.source || "").trim();
        const oldDest = (originalRoute.destination || "").trim();
        if (oldSrc && oldDest && oldSrc !== oldDest) {
          const PLACEHOLDER = "___TMP_SWAP_SRC_DEST___";
          configStr = configStr
            .split(oldSrc).join(PLACEHOLDER)
            .split(oldDest).join(oldSrc)
            .split(PLACEHOLDER).join(oldDest);
          swappedConfig =
            typeof originalRoute.config === "string"
              ? configStr
              : JSON.parse(configStr);
        }
      } catch (err) {
        console.error("Error swapping source/destination in return route config:", err);
      }
    }

    createRoute(
      {
        ...routeWithoutId,
        source: originalRoute.destination || originalRoute.source,
        destination: originalRoute.source || originalRoute.destination,
        stops: reversedStops,
        config: swappedConfig,
        route_number: newRouteNumber,
        created_at: new Date().toISOString(),
        return: true,
        created_by: user?.id || "",
        organization_id: null,
        depot_id: null,
      },
      {
        onSuccess: () => {
          toast.success("Return Route Created successfully");
          refetchRoutes();
        },
        onError: (error) => {
          toast.error(`Error creating return route: ${error.message || "Unknown error"}`);
        },
      },
    );
  };

  const parseFieldValue = (
    fieldValue: any,
    fieldKey: string,
    json: IRoute,
  ) => {
    const value = fieldValue !== undefined && fieldValue !== null ? fieldValue : json[fieldKey];
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === "object") {
      return value;
    }
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (err) {
        console.warn(`Failed to parse ${fieldKey} as JSON:`, err);
        return value;
      }
    }
    return value;
  };

  const [isMixedVersionDialogOpen, setIsMixedVersionDialogOpen] = useState(false);

  const handleExportSelectedRoutes = () => {
    if (selectedRouteObjects.length === 0) {
      toast.warning("No routes selected for export");
      return;
    }

    const hasV1 = selectedRouteObjects.some((r) => r.version === "1.0");
    const hasV2 = selectedRouteObjects.some((r) => r.version !== "1.0");

    if (hasV1 && hasV2) {
      setIsMixedVersionDialogOpen(true);
      return;
    }

    if (hasV1) {
      executeExport("v1");
      return;
    }

    executeExport("v2");
  };

  const executeExport = async (format: "v1" | "v2") => {
    if (selectedRouteObjects.length === 0) {
      toast.warning("No routes selected for export");
      return;
    }

    const { handle: dirHandle, cancelled } = await pickTargetDirectory();
    if (cancelled) {
      toast.info("Export cancelled");
      return;
    }

    const rawRoutesToExport = selectedRouteObjects.map((route) => ({
      ...route,
      front: parseFieldValue(route.front as string | null, "front", route),
      side: parseFieldValue(route.side as string | null, "side", route),
      rear: parseFieldValue(route.rear as string | null, "rear", route),
      internal: parseFieldValue(route.internal as string | null, "internal", route),
      stops: parseFieldValue(route.stops as string | null, "stops", route),
    }));

    const currentDate = new Date().toISOString().split("T")[0];

    if (format === "v1") {
      const v1RoutesPayload = rawRoutesToExport.map((route) => convertV2ToV1(route));
      toast.info("Requesting V1 export package...");

      const apiBase =
        import.meta.env.VITE_CONTROLLER_API_URL ||
        "https://api.navitronix.in/navitranix/api";

      try {
        const exportUrl = `${apiBase}/routes/export?areaId=&depotId=`;

        const response = await axios.post(exportUrl, v1RoutesPayload, {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/zip" });
        const result = await writeZipToDirectoryOrFallback(
          blob,
          dirHandle,
          `regular_routes_export_v1_${currentDate}.zip`,
          "Navitronix_Routes"
        );

        if (result.savedAsFolder) {
          toast.success(`Exported ${selectedRouteObjects.length} route(s) to Navitronix_Routes folder (V1)`);
        } else {
          toast.success(`Exported ${selectedRouteObjects.length} route(s) in V1 format (.zip)`);
        }
      } catch (error: any) {
        console.error("V1 Export API Error:", error);
        toast.error(`V1 Export failed: ${error?.response?.data?.message || error.message || "Server error"}`);
      }
    } else {
      toast.info("Requesting V2 export package...");

      const apiBase =
        import.meta.env.VITE_CONTROLLER_API_URL ||
        "https://api.navitronix.in/navitranix/api";

      try {
        const exportUrl = `${apiBase}/routes/export-v2?areaId=&depotId=`;

        const response = await axios.post(exportUrl, rawRoutesToExport, {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/zip" });
        const result = await writeZipToDirectoryOrFallback(
          blob,
          dirHandle,
          `regular_routes_export_v2_${currentDate}.zip`,
          "Navitronix_Routes"
        );

        if (result.savedAsFolder) {
          toast.success(`Exported ${selectedRouteObjects.length} route(s) to Navitronix_Routes folder (V2)`);
        } else {
          toast.success(`Exported ${selectedRouteObjects.length} route(s) in V2 format (.zip)`);
        }
      } catch (error: any) {
        console.error("V2 Export API Error:", error);
        toast.error(`V2 Export failed: ${error?.response?.data?.message || error.message || "Server error"}`);
      }
    }
  };

  return (
    <div className="flex h-full overflow-hidden w-full flex-col items-start gap-4">
      {/* Page Header */}
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          {isRegular ? "My Routes" : "Regular Customer Routes"}
        </span>
        <span className="text-body font-body text-subtext-color">
          {isRegular
            ? "Create and manage your standalone custom routes"
            : "View and manage standalone routes created by regular customers"}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex w-full flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Route Search Field */}
          <div className="relative w-full sm:w-72 md:w-80">
            <TextField
              className="w-full h-9"
              icon={<FeatherSearch className="h-4 w-4 text-subtext-color" />}
            >
              <TextField.Input
                placeholder="Search route number, terminal, stop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={searchQuery ? "pr-8" : ""}
              />
            </TextField>
            {searchQuery && (
              <div className="absolute right-2 top-2 z-10">
                <IconButton
                  size="small"
                  variant="neutral-tertiary"
                  icon={<FeatherX className="h-3.5 w-3.5" />}
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                />
              </div>
            )}
          </div>

          {/* Dual User Version Filter Toggle */}
          {routeAccess.isDualUser && routes.length > 0 && (
            <div className="flex items-center rounded-md border border-neutral-border bg-neutral-100 p-0.5 text-xs flex-wrap">
              <button
                type="button"
                className={`px-2.5 py-1 rounded font-medium transition-colors ${versionFilter === "all"
                  ? "bg-brand-50 text-brand-primary border border-brand-primary/40 shadow-xs"
                  : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setVersionFilter("all")}
              >
                All ({routes.length})
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 rounded font-medium transition-colors ${versionFilter === "v1"
                  ? "bg-brand-50 text-brand-primary border border-brand-primary/40 shadow-xs"
                  : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setVersionFilter("v1")}
              >
                V1 ({routes.filter((r) => r.version === "1.0").length})
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 rounded font-medium transition-colors ${versionFilter === "v2"
                  ? "bg-brand-50 text-brand-primary border border-brand-primary/40 shadow-xs"
                  : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setVersionFilter("v2")}
              >
                V2 ({routes.filter((r) => r.version !== "1.0").length})
              </button>
            </div>
          )}

          <span className="text-caption font-caption text-subtext-color shrink-0">
            Showing {filteredRoutes.length} of {routes.length} records
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Button
            variant="neutral-primary"
            className="h-9 flex-1 sm:flex-none"
            icon={<FeatherRefreshCw />}
            onClick={() => {
              toast.success("Routes refreshed successfully");
              refetchRoutes();
            }}
          >
            Refresh
          </Button>

          {routeAccess.hasV1Routes && (
            <Button
              icon={<FeatherPlus />}
              variant="brand-secondary-2"
              className="h-9 flex-1 sm:flex-none"
              onClick={handleAddV1Route}
            >
              {routeAccess.isV1Only ? "Add Route" : "V1 Add Route"}
            </Button>
          )}

          {routeAccess.hasV2Routes && (
            <Button
              icon={<FeatherPlus />}
              className="h-9 flex-1 sm:flex-none"
              onClick={handleAddV2Route}
            >
              {routeAccess.isV2Only ? "Add Route" : "V2 Add Route"}
            </Button>
          )}

          {selectedRouteIds.length > 0 && (
            <>
              <Button
                icon={<FeatherDownload />}
                variant="brand-secondary-2"
                className="h-9 flex-1 sm:flex-none"
                onClick={handleExportSelectedRoutes}
              >
                Export ({selectedRouteIds.length})
              </Button>
              <Button
                icon={<FeatherTrash />}
                variant="destructive-secondary"
                className="h-9 flex-1 sm:flex-none"
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to delete ${selectedRouteIds.length} selected route(s)?`,
                    )
                  ) {
                    handleDeleteSelectedRoutes();
                  }
                }}
              >
                Delete ({selectedRouteIds.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 text-subtext-color w-full">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
          <span className="text-caption">Loading routes...</span>
        </div>
      ) : routes.length === 0 ? (
        <EmptyState title="Routes" hasDepots={true} />
      ) : filteredRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center gap-3 rounded-lg border border-neutral-border bg-sidebar-background w-full">
          <FeatherSearch className="h-8 w-8 text-neutral-300" />
          <span className="text-body font-medium text-default-font">
            No routes match "{searchQuery}"
          </span>
          <span className="text-caption text-subtext-color max-w-sm">
            Try searching for a different route number, terminal, or stop, or clear the search filter.
          </span>
          <Button
            variant="neutral-secondary"
            size="small"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <RouteTable
          routes={filteredRoutes}
          highlightedRouteId={highlightRouteId}
          onEdit={handleEditRoute}
          onDelete={(routeId: string) => {
            if (
              confirm(
                "Are you sure you want to delete this route? This action cannot be undone.",
              )
            ) {
              handleDeleteRoute(routeId);
            }
          }}
          onDuplicate={duplicateRoute}
          onReturn={handleReturn}
          selectedRouteIds={selectedRouteIds}
          onSelectedChange={handleSelectedChange}
          onSelectAllChange={handleSelectAllChange}
        />
      )}

      {/* Mixed Version Export Conflict Dialog */}
      <Dialog
        open={isMixedVersionDialogOpen}
        onOpenChange={setIsMixedVersionDialogOpen}
      >
        <Dialog.Content className="w-full max-w-md flex-none p-6">
          <div className="flex w-full flex-col gap-5">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <FeatherAlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Mixed Route Versions
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    Cannot export V1 and V2 together
                  </span>
                </div>
              </div>
              <IconButton
                variant="neutral-tertiary"
                icon={<FeatherX />}
                onClick={() => setIsMixedVersionDialogOpen(false)}
              />
            </div>
            <p className="text-body font-body text-subtext-color">
              Your selection contains both V1 and V2 route configurations. Please filter by version or select routes of the same type to export.
            </p>
            <div className="flex w-full justify-end">
              <Button
                variant="neutral-secondary"
                onClick={() => setIsMixedVersionDialogOpen(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
