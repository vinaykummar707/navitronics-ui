"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FeatherArrowRight,
  FeatherBusFront,
  FeatherEdit2,
  FeatherExternalLink,
  FeatherGlobe,
  FeatherLayers,
  FeatherMapPin,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherRoute,
  FeatherSearch,
  FeatherTag,
  FeatherUser,
  FeatherUsers,
  FeatherX,
} from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Badge } from "@/ui/components/Badge";
import { Table } from "@/ui/components/Table";
import { TextField } from "@/ui/components/TextField";
import { Select } from "@/ui/components/Select";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegionStore } from "@/store/useRegionStore";
import { useDepotStore } from "@/store/useDepotStore";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { regionCrud, IRegion } from "@/types/IRegion";
import { depotCrud, IDepot } from "@/types/IDepot";
import { IRoute } from "@/types/IRoute";
import { stopCrud } from "@/types/IStop";
import { userCrud, ILoggedUser } from "@/types/IUser";
import { isSuperAdmin } from "@/utils/customerType";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";
import { formatDate, sortByLatestCreated } from "@/utils/dateUtils";

export default function DashboardPage() {
  const navigate = useNavigate();
  const loggedInUser = useLoggedUserStore((state) => state.user);
  const isSuper = isSuperAdmin(loggedInUser);

  const { selectedOrganization } = useOrganizationStore();
  const setRoutesPageRegion = useRegionStore((state) => state.setRoutesPageRegion);
  const setRoutesPageDepot = useDepotStore((state) => state.setRoutesPageDepot);

  const targetOrgId = isSuper
    ? selectedOrganization?.id
    : loggedInUser?.organization?.id || loggedInUser?.organization_id;

  // 1. Fetch Regions
  const { data: regionsData, refetch: refetchRegions } = regionCrud.useList({
    filters: { organization_id: targetOrgId || "", deleted: false },
    skip: !targetOrgId,
    orderBy: { column: "name", ascending: true },
  });
  const regions = (regionsData?.data as IRegion[]) || [];

  // 2. Fetch Depots
  const { data: depotsData, refetch: refetchDepots } = depotCrud.useList({
    filters: { organization_id: targetOrgId || "", deleted: false },
    skip: !targetOrgId,
    orderBy: { column: "name", ascending: true },
  });
  const depots = (depotsData?.data as IDepot[]) || [];

  // 3. Fetch Stops
  const { data: stopsData, refetch: refetchStops } = stopCrud.useList({
    filters: { organization_id: targetOrgId || "", deleted: false },
    skip: !targetOrgId,
  });
  const stops = (stopsData?.data as any[]) || [];

  // 4. Fetch Users
  const { data: usersData, refetch: refetchUsers } = userCrud.useList({
    filters: { organization_id: targetOrgId || "", deleted: false },
    skip: !targetOrgId,
  });
  const users = (usersData?.data as ILoggedUser[]) || [];

  // 5. Route counts for KPI card (lightweight head: true count queries - zero route rows loaded)
  const { data: routeStats, refetch: refetchRouteStats } = useQuery({
    queryKey: ["dashboard-route-stats", targetOrgId],
    queryFn: async () => {
      const [stuRes, regularRes, v1Res] = await Promise.all([
        targetOrgId
          ? supabase
            .from("routes")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", targetOrgId)
            .eq("deleted", false)
          : supabase
            .from("routes")
            .select("*", { count: "exact", head: true })
            .not("depot_id", "is", null)
            .eq("deleted", false),
        supabase
          .from("routes")
          .select("*", { count: "exact", head: true })
          .is("depot_id", null)
          .eq("deleted", false),
        supabase
          .from("routes")
          .select("*", { count: "exact", head: true })
          .eq("version", "1.0")
          .eq("deleted", false),
      ]);
      const stu = stuRes.count || 0;
      const regular = regularRes.count || 0;
      const total = stu + regular;
      const v1 = v1Res.count || 0;
      const v2 = Math.max(0, total - v1);
      return { total, stu, regular, v1, v2 };
    },
    enabled: true,
  });

  const totalRoutesCount = routeStats?.total ?? 0;
  const stuRoutesCount = routeStats?.stu ?? 0;
  const regularRoutesCount = routeStats?.regular ?? 0;

  // Quick lookup maps
  const depotMap = useMemo(() => {
    const map = new Map<string, IDepot>();
    depots.forEach((d) => map.set(d.id, d));
    return map;
  }, [depots]);

  const regionMap = useMemo(() => {
    const map = new Map<string, IRegion>();
    regions.forEach((r) => map.set(r.id, r));
    return map;
  }, [regions]);

  // Search & Filter States
  const [routeSearchQuery, setRouteSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "stu" | "regular">("all");
  const [selectedVersionFilter, setSelectedVersionFilter] = useState<"all" | "v1" | "v2">("all");
  const [selectedDepotFilter, setSelectedDepotFilter] = useState<string>("all");

  // Debounce user input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(routeSearchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [routeSearchQuery]);

  const isDebouncing = routeSearchQuery.trim() !== debouncedQuery;

  // 6. Dynamic Route Search Query - Searches BOTH STU routes and Regular Customer routes!
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    refetch: refetchSearchResults,
  } = useQuery({
    queryKey: ["dashboard-routes-search", targetOrgId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const sanitized = debouncedQuery.replace(/[,()]/g, "");
      if (!sanitized) return [];

      let query = supabase
        .from("routes")
        .select(`
          *,
          created_by_user:created_by (email)
        `)
        .eq("deleted", false)
        .or(
          `route_number.ilike.%${sanitized}%,route_number_1.ilike.%${sanitized}%,route_number_2.ilike.%${sanitized}%`
        );

      // Search BOTH STU routes (for selected organization) AND all Regular Customer routes (depot_id is null)
      if (targetOrgId) {
        query = query.or(`organization_id.eq.${targetOrgId},depot_id.is.null`);
      }

      query = query.order("created_at", { ascending: false }).limit(100);

      const { data, error } = await query;
      if (error) {
        console.error("Error searching routes:", error);
        throw error;
      }
      return (data as (IRoute & { created_by_user?: { email?: string } })[]) || [];
    },
    enabled: debouncedQuery.length > 0,
  });

  const searchRoutes = searchResults || [];

  // Filter returned routes by type, version, and depot (sorted by latest created date)
  const filteredRoutes = useMemo(() => {
    const list = searchRoutes.filter((r) => {
      const isRegular = !r.depot_id;

      // Customer Tier / Type filter
      if (selectedTypeFilter === "stu" && isRegular) return false;
      if (selectedTypeFilter === "regular" && !isRegular) return false;

      // Version filter
      if (selectedVersionFilter === "v1" && r.version !== "1.0") return false;
      if (selectedVersionFilter === "v2" && r.version === "1.0") return false;

      // Depot filter (only applies to STU routes)
      if (selectedDepotFilter !== "all") {
        if (isRegular || r.depot_id !== selectedDepotFilter) return false;
      }

      return true;
    });

    return sortByLatestCreated(list);
  }, [searchRoutes, selectedTypeFilter, selectedVersionFilter, selectedDepotFilter]);

  const stuCountInResults = useMemo(
    () => searchRoutes.filter((r) => !!r.depot_id).length,
    [searchRoutes]
  );
  const regularCountInResults = useMemo(
    () => searchRoutes.filter((r) => !r.depot_id).length,
    [searchRoutes]
  );

  // Refresh all
  const handleRefreshAll = () => {
    refetchRegions();
    refetchDepots();
    refetchStops();
    refetchUsers();
    refetchRouteStats();
    if (debouncedQuery) {
      refetchSearchResults();
    }
    toast.success("Dashboard metrics refreshed");
  };

  const handleNavigateToDepotRoutes = (depotId?: string | null) => {
    if (depotId) {
      const targetDepot = depotMap.get(depotId);
      if (targetDepot) {
        setRoutesPageDepot(targetDepot);
        if (targetDepot.region_id) {
          const targetRegion = regionMap.get(targetDepot.region_id);
          if (targetRegion) setRoutesPageRegion(targetRegion);
        }
      }
    }
    navigate("/home/routes");
  };

  const handleEditRoute = (route: IRoute) => {
    const isV1 = route.version === "1.0";
    if (route.depot_id) {
      // STU route
      if (isV1) {
        navigate(
          `/routes/create-v1/${route.organization_id || targetOrgId}/${route.depot_id}/${route.id}`
        );
      } else {
        navigate(
          `/routes/create/${route.organization_id || targetOrgId}/${route.depot_id}/${route.id}`
        );
      }
    } else {
      // Regular customer route
      if (isV1) {
        navigate(`/routes/create-v1/${route.id}`);
      } else {
        navigate(`/routes/create/${route.id}`);
      }
    }
  };

  const formatCreatedAt = (dateStr?: string | null) => {
    return formatDate(dateStr);
  };

  const isQueryActive = debouncedQuery.length > 0;
  const isBusySearching = isDebouncing || isSearchLoading || isSearchFetching;

  return (
    <div className="flex h-full w-full flex-col items-start gap-5 overflow-y-auto">
      {/* Dashboard Header */}
      <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 flex-none">
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Dashboard & Route Explorer
            </span>
            <span className="inline-flex rounded px-2 py-0.5 text-micro font-caption-bold text-brand-primary bg-brand-50 border border-brand-200">
              {selectedOrganization?.name || "All Transit Operations"}
            </span>
          </div>
          <span className="text-body font-body text-subtext-color">
            Search and inspect routes across STU enterprise fleets and regular customers
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="neutral-primary"
            icon={<FeatherRefreshCw className="h-4 w-4" />}
            onClick={handleRefreshAll}
          >
            Refresh
          </Button>
          <Button
            variant="brand-primary"
            icon={<FeatherRoute className="h-4 w-4" />}
            onClick={() => navigate("/home/routes")}
          >
            Manage Routes
          </Button>
        </div>
      </div>

      {/* High-Level KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full flex-none">
        {/* Regions KPI */}
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-subtext-color">Regions</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FeatherGlobe className="h-4 w-4" />
            </div>
          </div>
          <span className="text-heading-3 font-heading-3 font-bold text-default-font">
            {regions.length}
          </span>
          <span className="text-micro text-subtext-color">Operational Divisions</span>
        </div>

        {/* Depots KPI */}
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-subtext-color">Depots</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FeatherBusFront className="h-4 w-4" />
            </div>
          </div>
          <span className="text-heading-3 font-heading-3 font-bold text-default-font">
            {depots.length}
          </span>
          <span className="text-micro text-subtext-color">Transit Facilities</span>
        </div>

        {/* Routes KPI (fetched via zero-row count queries: STU + Regular) */}
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-subtext-color">Routes</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FeatherRoute className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-heading-3 font-heading-3 font-bold text-default-font">
              {totalRoutesCount}
            </span>
            <div className="flex items-center gap-1 text-micro">
              <span className="text-brand-primary font-medium">{stuRoutesCount} STU</span>
              <span className="text-subtext-color">•</span>
              <span className="text-purple-600 font-medium">{regularRoutesCount} Regular</span>
            </div>
          </div>
          <span className="text-micro text-subtext-color">STU & Regular Routes</span>
        </div>

        {/* Stops KPI */}
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-subtext-color">Stops</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <FeatherMapPin className="h-4 w-4" />
            </div>
          </div>
          <span className="text-heading-3 font-heading-3 font-bold text-default-font">
            {stops.length}
          </span>
          <span className="text-micro text-subtext-color">Configured Waypoints</span>
        </div>

        {/* Users KPI */}
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-subtext-color">Users</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <FeatherUsers className="h-4 w-4" />
            </div>
          </div>
          <span className="text-heading-3 font-heading-3 font-bold text-default-font">
            {users.length}
          </span>
          <span className="text-micro text-subtext-color">Admins & Staff</span>
        </div>
      </div>

      {/* Route Search & Explorer Section (On-Demand Debounced Search) */}
      <div className="flex w-full flex-col rounded-xl border border-neutral-border bg-sidebar-background shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-neutral-border bg-sidebar-background/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-primary">
              <FeatherSearch className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-body-bold font-body-bold text-default-font">
                Search All Routes (STU & Regular Customers)
              </span>
              <span className="text-caption text-subtext-color">
                Search by route number across both enterprise STU depots and regular customer routes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isQueryActive ? (
              <Badge variant="brand">
                {filteredRoutes.length} route{filteredRoutes.length === 1 ? "" : "s"} found ({stuCountInResults} STU, {regularCountInResults} Regular)
              </Badge>
            ) : (
              <Badge variant="neutral">
                {totalRoutesCount} total routes ({stuRoutesCount} STU, {regularRoutesCount} Regular)
              </Badge>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-neutral-border/60 bg-neutral-50/50">
          {/* Route Number Search Input with Debounce */}
          <div className="relative flex-1 max-w-lg">
            <TextField
              className="w-full h-10"
              icon={
                isBusySearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
                ) : (
                  <FeatherSearch className="h-4 w-4 text-subtext-color" />
                )
              }
            >
              <TextField.Input
                placeholder="Search route number (e.g. 123, 899, 5K)..."
                value={routeSearchQuery}
                onChange={(e) => setRouteSearchQuery(e.target.value)}
                className={routeSearchQuery ? "pr-8" : ""}
              />
            </TextField>
            {routeSearchQuery && (
              <div className="absolute right-2 top-2.5 z-10">
                <IconButton
                  size="small"
                  variant="neutral-tertiary"
                  icon={<FeatherX className="h-3.5 w-3.5" />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRouteSearchQuery("");
                    setDebouncedQuery("");
                  }}
                  title="Clear search"
                />
              </div>
            )}
          </div>

          {/* Filter Controls: Customer Tier, Format & Depot */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type / Tier Filter: All vs STU vs Regular */}
            <div className="flex items-center rounded-lg border border-neutral-border bg-sidebar-background p-0.5">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedTypeFilter === "all"
                    ? "bg-brand-primary text-white shadow-xs font-semibold"
                    : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setSelectedTypeFilter("all")}
              >
                All Types
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedTypeFilter === "stu"
                    ? "bg-brand-primary text-white shadow-xs font-semibold"
                    : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setSelectedTypeFilter("stu")}
              >
                STU Routes {isQueryActive ? `(${stuCountInResults})` : ""}
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedTypeFilter === "regular"
                    ? "bg-brand-primary text-white shadow-xs font-semibold"
                    : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setSelectedTypeFilter("regular")}
              >
                Regular Customer {isQueryActive ? `(${regularCountInResults})` : ""}
              </button>
            </div>

            {/* Version Toggle */}
            <div className="flex items-center rounded-lg border border-neutral-border bg-sidebar-background p-0.5">
              <button
                type="button"
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${selectedVersionFilter === "all"
                    ? "bg-neutral-800 text-white shadow-xs font-semibold"
                    : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setSelectedVersionFilter("all")}
              >
                All Versions
              </button>
              <button
                type="button"
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${selectedVersionFilter === "v2"
                    ? "bg-neutral-800 text-white shadow-xs font-semibold"
                    : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setSelectedVersionFilter("v2")}
              >
                V2
              </button>
              <button
                type="button"
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${selectedVersionFilter === "v1"
                    ? "bg-neutral-800 text-white shadow-xs font-semibold"
                    : "text-subtext-color hover:text-default-font"
                  }`}
                onClick={() => setSelectedVersionFilter("v1")}
              >
                V1
              </button>
            </div>

            {/* Depot Selector Filter (shown when not filtering exclusively for regular customers) */}
            {selectedTypeFilter !== "regular" && depots.length > 0 && (
              <div className="w-44">
                <Select
                  placeholder="All Depots"
                  value={selectedDepotFilter}
                  onValueChange={(val) => setSelectedDepotFilter(val as string)}
                >
                  <Select.Item value="all">All Depots</Select.Item>
                  {depots.map((d) => (
                    <Select.Item key={d.id} value={d.id}>
                      {d.name}
                    </Select.Item>
                  ))}
                </Select>
              </div>
            )}

            {(routeSearchQuery || selectedTypeFilter !== "all" || selectedVersionFilter !== "all" || selectedDepotFilter !== "all") && (
              <Button
                variant="neutral-secondary"
                size="small"
                onClick={() => {
                  setRouteSearchQuery("");
                  setDebouncedQuery("");
                  setSelectedTypeFilter("all");
                  setSelectedVersionFilter("all");
                  setSelectedDepotFilter("all");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Routes Results Area */}
        <div className="flex-1 overflow-x-auto touch-scroll-x min-h-[320px]">
          {/* 1. Initial State: No search input provided */}
          {!isQueryActive && !isBusySearching ? (
            <div className="flex flex-col items-center justify-center p-16 text-center gap-3 text-subtext-color">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-primary">
                <FeatherSearch className="h-6 w-6" />
              </div>
              <span className="text-body font-medium text-default-font">
                Search All STU & Regular Customer Routes
              </span>
              <span className="text-caption max-w-md text-subtext-color">
                Type a route number in the search bar above to fetch and inspect matching routes across both STU enterprise fleets and regular customers.
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-micro text-neutral-400">Try searching:</span>
                {["123", "789", "45", "5K", "899"].map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="px-2.5 py-0.5 text-micro rounded bg-neutral-100 hover:bg-neutral-200 text-default-font transition-colors font-mono font-medium"
                    onClick={() => setRouteSearchQuery(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : isBusySearching ? (
            /* 2. Loading State: Debouncing or Query Fetching */
            <div className="flex flex-col items-center justify-center p-16 gap-3 text-subtext-color">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
              <span className="text-caption">
                {isDebouncing
                  ? `Searching for "${routeSearchQuery}"...`
                  : `Fetching matching STU & regular routes for "${debouncedQuery}"...`}
              </span>
            </div>
          ) : filteredRoutes.length === 0 ? (
            /* 3. Empty Results State */
            <div className="flex flex-col items-center justify-center p-16 text-center gap-3 text-subtext-color">
              <FeatherSearch className="h-8 w-8 text-neutral-300" />
              <span className="text-body font-medium text-default-font">
                No routes match "{debouncedQuery}"
              </span>
              <span className="text-caption max-w-sm">
                No STU or regular customer routes were found matching this route number. Try searching for another number or clear filters.
              </span>
              <Button
                variant="neutral-secondary"
                size="small"
                onClick={() => {
                  setRouteSearchQuery("");
                  setDebouncedQuery("");
                  setSelectedTypeFilter("all");
                  setSelectedVersionFilter("all");
                  setSelectedDepotFilter("all");
                }}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            /* 4. Results Table */
            <Table
              header={
                <Table.HeaderRow>
                  <Table.HeaderCell className="min-w-[140px]">Route Number</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[120px]">Type</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[230px]">Origin ➔ Destination</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[190px]">Facility / Owner</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[110px] justify-center text-center">Version</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[110px] justify-center text-center hidden md:table-cell">Created Date</Table.HeaderCell>
                  <Table.HeaderCell className="w-28 text-right justify-end">Actions</Table.HeaderCell>
                </Table.HeaderRow>
              }
            >
              {filteredRoutes.map((route) => {
                const isRegular = !route.depot_id;
                const depot = route.depot_id ? depotMap.get(route.depot_id) : null;
                const region = depot?.region_id ? regionMap.get(depot.region_id) : null;
                const isV1 = route.version === "1.0";

                return (
                  <Table.Row key={route.id}>
                    {/* Route Number */}
                    <Table.Cell className="min-w-[140px]">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-body-bold font-body-bold text-default-font">
                            {route.route_number}
                          </span>
                          {route.is_split_route && (
                            <span className="text-[10px] font-semibold text-brand-primary bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded">
                              Split
                            </span>
                          )}
                        </div>
                        {route.is_split_route && (
                          <span className="text-micro text-subtext-color font-mono">
                            {route.route_number_1} / {route.route_number_2}
                          </span>
                        )}
                      </div>
                    </Table.Cell>

                    {/* Customer Tier / Type */}
                    <Table.Cell className="min-w-[140px]">
                      {isRegular ? (
                        <span className="inline-flex items-center gap-1.5 text-micro font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          <FeatherUser className="h-3 w-3" />
                          Regular Customer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-micro font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          <FeatherBusFront className="h-3 w-3" />
                          STU Enterprise
                        </span>
                      )}
                    </Table.Cell>

                    {/* Origin ➔ Destination */}
                    <Table.Cell className="min-w-[230px]">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-body font-medium text-default-font flex-wrap">
                          <span>{route.source || "—"}</span>
                          <FeatherArrowRight className="h-3.5 w-3.5 text-subtext-color shrink-0" />
                          <span>{route.destination || "—"}</span>
                        </div>
                        {route.via && (
                          <span className="text-micro text-subtext-color truncate max-w-[260px]" title={route.via}>
                            Via: {route.via}
                          </span>
                        )}
                      </div>
                    </Table.Cell>

                    {/* Facility / Owner */}
                    <Table.Cell className="min-w-[190px]">
                      {!isRegular ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <FeatherBusFront className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="text-body font-medium text-default-font truncate">
                              {depot?.name || "Depot Route"}
                            </span>
                          </div>
                          {region && (
                            <div className="flex items-center gap-1 text-micro text-subtext-color">
                              <FeatherGlobe className="h-3 w-3 text-blue-500 shrink-0" />
                              <span>{region.name}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <FeatherUser className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                            <span className="text-body font-medium text-purple-900 truncate">
                              Regular Customer
                            </span>
                          </div>
                          {route.created_by_user?.email && (
                            <span className="text-micro text-subtext-color font-mono truncate max-w-[200px]" title={route.created_by_user.email}>
                              {route.created_by_user.email}
                            </span>
                          )}
                        </div>
                      )}
                    </Table.Cell>

                    {/* Format */}
                    <Table.Cell className="min-w-[110px] justify-center text-center">
                      <Badge
                        variant={isV1 ? "warning" : "brand"}
                        icon={isV1 ? <FeatherTag className="h-3 w-3" /> : <FeatherLayers className="h-3 w-3" />}
                      >
                        {isV1 ? "V1" : "V2"}
                      </Badge>
                    </Table.Cell>

                    {/* Created Date */}
                    <Table.Cell className="min-w-[110px] justify-center text-center hidden md:table-cell">
                      <span className="text-caption font-mono text-subtext-color">
                        {formatCreatedAt(route.created_at)}
                      </span>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell className="w-28 justify-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="small"
                          variant="neutral-secondary"
                          icon={<FeatherExternalLink className="h-3.5 w-3.5" />}
                          onClick={() => {
                            if (route.depot_id) {
                              handleNavigateToDepotRoutes(route.depot_id);
                            } else {
                              navigate("/home/regular-routes");
                            }
                          }}
                          title={route.depot_id ? "Open depot in Routes page" : "Open in Regular Routes page"}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="brand-secondary-2"
                          icon={<FeatherEdit2 className="h-3.5 w-3.5" />}
                          onClick={() => handleEditRoute(route)}
                          title="Edit Route"
                        >
                          Edit
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
