import React, { useState, useMemo, useEffect } from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "@/ui/utils";
import Avvvatars from "avvvatars-react";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import {
  FeatherAlertTriangle,
  FeatherArrowDown,
  FeatherArrowRight,
  FeatherArrowUp,
  FeatherArrowUpDown,
  FeatherCheck,
  FeatherCopy,
  FeatherEdit2,
  FeatherExternalLink,
  FeatherGitBranch,
  FeatherGlobe,
  FeatherGripVertical,
  FeatherLayers,
  FeatherMapPin,
  FeatherMonitor,
  FeatherMoreHorizontal,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherRepeat,
  FeatherRoute,
  FeatherSearch,
  FeatherSliders,
  FeatherTag,
  FeatherTrash,
  FeatherTv,
  FeatherType,
  FeatherX,
} from "@subframe/core";
import { Dialog, IconButton, Select, TextField, Checkbox, Badge, Table } from "@/ui";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegionStore } from "@/store/useRegionStore";
import { useDepotStore } from "@/store/useDepotStore";
import { IRegion, regionCrud } from "@/types/IRegion";
import { IDepot, depotCrud } from "@/types/IDepot";
import { IRoute, routeCrud } from "@/types/IRoute";
import { IStopWithAudio, stopCrud } from "@/types/IStop";
import { Simulation, SimulationFormat, SimulationType } from "@/types/routeConfigV2";
import { AVAILABLE_LANGUAGES } from "@/constants/defaultRouteValues";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import RBAC from "@/components/RBAC";
import { RegionSelect } from "@/components/RegionSelect";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkActiveDuplicate } from "@/hooks/useCrud";
import { sortByLatestCreated, formatDate } from "@/utils/dateUtils";

interface ViaItem {
  id: string;
  name: string;
  name_kn?: string;
}

export type BoardType = "front" | "side" | "rear";

export interface SimulationPlaceholder {
  id: string;
  format: SimulationFormat; // "single" | "two" | "three"
  language: string; // e.g. "en", "kn", "hi"
  type: SimulationType; // "route" | "special message" | "slogan" | "stop"
  label?: string;
}

const BOARD_CONFIGS: { id: BoardType; label: string; icon: string; width: number; height: number; desc: string }[] = [
  { id: "front", label: "Front Board", icon: "front", width: 128, height: 16, desc: "Main windshield external LED display" },
  { id: "side", label: "Side Board", icon: "side", width: 128, height: 16, desc: "Side passenger boarding entrance LED display" },
  { id: "rear", label: "Rear Board", icon: "rear", width: 96, height: 16, desc: "Rear trailing traffic LED display" },
];

/**
 * Converts simulation placeholders into full V2 simulation slide objects
 * so they automatically prepopulate the V2 create route canvas.
 */
function generateSimulationsFromPlaceholders(
  placeholders: SimulationPlaceholder[],
  board: BoardType,
  routeInfo: {
    routeNumber: string;
    routeNumber1?: string;
    routeNumber2?: string;
    isSplitRoute: boolean;
    source: string;
    source_kn?: string;
    destination: string;
    destination_kn?: string;
    via: string;
    via_kn?: string;
    viaStops?: { name: string; name_kn?: string }[];
  }
): Simulation[] {
  const boardMeta = BOARD_CONFIGS.find((b) => b.id === board) || BOARD_CONFIGS[0];
  const { width, height } = boardMeta;

  return placeholders.map((p) => {
    const lang = p.language || "en";
    const isKn = lang === "kn";
    const rt = routeInfo.routeNumber || "100";
    const rt1 = routeInfo.routeNumber1 || routeInfo.routeNumber || "100";
    const rt2 = routeInfo.routeNumber2 || "";
    const isSplit = routeInfo.isSplitRoute;
    const curRoute = isSplit ? rt1 : rt;

    const src = isKn && routeInfo.source_kn ? routeInfo.source_kn : routeInfo.source || "SOURCE";
    const dest = isKn && routeInfo.destination_kn ? routeInfo.destination_kn : routeInfo.destination || "DESTINATION";

    // Vias as array
    const vias: string[] =
      routeInfo.viaStops && routeInfo.viaStops.length > 0
        ? routeInfo.viaStops.map((v) => (isKn && v.name_kn ? v.name_kn : v.name)).filter(Boolean)
        : routeInfo.via
        ? routeInfo.via
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const viaJoined = vias.join(" - ");

    // 1. Single text: Route-Number-Source-destinatiion-via's
    const singleRouteText = [curRoute, src, dest, ...vias].filter(Boolean).join(" - ");

    // 2. Two text: RouteNumber | source-destination-via's
    const twoStopsText = [src, dest, ...vias].filter(Boolean).join(" - ");

    // 3. Three text: Route Number | Source-destination (upperline)/ via's(lower line)
    const threeUpperText = `${src} - ${dest}`;
    const threeLowerText = vias.length > 0 ? viaJoined : isKn ? "ನೇರ ಪ್ರಯಾಣ" : "Direct";

    const fontH = height <= 16 ? 14 : 16;

    if (p.format === "single") {
      let textVal = singleRouteText;
      if (p.type === "slogan") textVal = "PLEASE WEAR SEAT BELT";
      else if (p.type === "special message") textVal = "SPECIAL SERVICE";

      return {
        format: "single",
        texts: {
          text: {
            text: textVal,
            language: lang,
            scrollType: "Fixed",
            position: "Center",
            scrollSpeed: 4,
            fontWeight: "Bold",
            fontHeight: fontH,
            fontWidth: 12,
            bitmap: "",
          },
        },
        height: height as any,
        width: width as any,
        type: p.type,
      };
    }

    if (p.format === "three") {
      let upper = threeUpperText;
      let lower = threeLowerText;
      if (p.type === "slogan") {
        upper = "WELCOME";
        lower = "PLEASE WEAR SEAT BELT";
      } else if (p.type === "special message") {
        upper = "SPECIAL";
        lower = "EXPRESS SERVICE";
      }

      return {
        format: "three",
        texts: {
          routeNumber1: {
            text: rt1,
            language: lang,
            scrollType: "Fixed",
            position: "Center",
            scrollSpeed: 4,
            fontWeight: "Bold",
            fontHeight: fontH,
            fontWidth: 12,
            bitmap: "",
          },
          routeNumber2: {
            text: rt2,
            language: lang,
            scrollType: "Fixed",
            position: "Center",
            scrollSpeed: 4,
            fontWeight: "Bold",
            fontHeight: fontH,
            fontWidth: 12,
            bitmap: "",
          },
          sideText: {
            text: curRoute,
            language: lang,
            scrollType: "Fixed",
            position: "Center",
            scrollSpeed: 4,
            fontWeight: "Bold",
            fontHeight: fontH,
            fontWidth: 12,
            bitmap: "",
          },
          upperHalfText: {
            text: upper,
            language: lang,
            scrollType: "Fixed",
            position: "Center",
            scrollSpeed: 4,
            fontWeight: "Bold",
            fontHeight: Math.min(fontH, 14),
            fontWidth: 10,
            bitmap: "",
          },
          lowerHalfText: {
            text: lower,
            language: lang,
            scrollType: "Fixed",
            position: "Center",
            scrollSpeed: 4,
            fontWeight: "Bold",
            fontHeight: Math.min(fontH, 14),
            fontWidth: 10,
            bitmap: "",
          },
        },
        height: height as any,
        width: width as any,
        type: p.type,
      };
    }

    // Default "two"
    let twoMainText = twoStopsText;
    if (p.type === "slogan") twoMainText = "PLEASE WEAR SEAT BELT";
    else if (p.type === "special message") twoMainText = "SPECIAL SERVICE";

    return {
      format: "two",
      texts: {
        routeNumber1: {
          text: rt1,
          language: lang,
          scrollType: "Fixed",
          position: "Center",
          scrollSpeed: 4,
          fontWeight: "Bold",
          fontHeight: fontH,
          fontWidth: 12,
          bitmap: "",
        },
        routeNumber2: {
          text: rt2,
          language: lang,
          scrollType: "Fixed",
          position: "Center",
          scrollSpeed: 4,
          fontWeight: "Bold",
          fontHeight: fontH,
          fontWidth: 12,
          bitmap: "",
        },
        sideText: {
          text: curRoute,
          language: lang,
          scrollType: "Fixed",
          position: "Center",
          scrollSpeed: 4,
          fontWeight: "Bold",
          fontHeight: fontH,
          fontWidth: 12,
          bitmap: "",
        },
        text: {
          text: twoMainText,
          language: lang,
          scrollType: "Fixed",
          position: "Center",
          scrollSpeed: 4,
          fontWeight: "Bold",
          fontHeight: fontH,
          fontWidth: 12,
          bitmap: "",
        },
      },
      height: height as any,
      width: width as any,
      type: p.type,
    };
  });
}

/**
 * Extracts placeholder simulation specs from existing raw DB simulations
 */
function parseSimulationsToPlaceholders(raw: any): SimulationPlaceholder[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.map((sim: any, idx: number) => {
    const texts = sim.texts || {};
    let lang = "en";
    for (const key of ["sideText", "text", "upperHalfText", "lowerHalfText", "routeNumber1"]) {
      if (texts[key]?.language) {
        lang = texts[key].language;
        break;
      }
    }
    const fmt: SimulationFormat =
      sim.format === "three" ? "three" : sim.format === "single" ? "single" : "two";

    return {
      id: `sim-${idx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      format: fmt,
      language: lang,
      type: sim.type || "route",
    };
  });
}

export default function RouteConfigurationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useLoggedUserStore((state) => state.user);

  // Stores
  const { selectedOrganization } = useOrganizationStore();
  const selectedRegion = useRegionStore((state) => state.routesPageRegion ?? state.selectedRegion);
  const setRoutesPageRegion = useRegionStore((state) => state.setRoutesPageRegion);
  const selectedDepot = useDepotStore((state) => state.routesPageDepot ?? state.selectedDepot);
  const setRoutesPageDepot = useDepotStore((state) => state.setRoutesPageDepot);

  // Queries
  const { data: regionData } = regionCrud.useList({
    filters: {
      organization_id: selectedOrganization?.id || "",
    },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedOrganization?.id,
  });

  const { data: depotData } = depotCrud.useList({
    filters: { region_id: selectedRegion?.id || "" },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedRegion?.id,
  });

  const { data: stopsData, refetch: refetchStops, isPending: isLoadingStops } = stopCrud.useList({
    filters: {
      depot_id: selectedDepot?.id || "",
      organization_id: selectedOrganization?.id || "",
    },
    orderBy: { column: "name", ascending: true },
    skip: !selectedDepot?.id || !selectedOrganization?.id,
  });

  const { data: routesData, refetch: refetchRoutes } = routeCrud.useList({
    filters: {
      depot_id: selectedDepot?.id || "",
      organization_id: selectedOrganization?.id || "",
    },
    orderBy: { column: "created_at", ascending: false },
    custom(query) {
      return query.select(`*, created_by_user:created_by (email)`);
    },
    skip: !selectedDepot?.id || !selectedOrganization?.id,
  });

  const { mutate: createRoute, isPending: isSavingRoute } = routeCrud.useCreate();
  const { mutate: updateRoute, isPending: isUpdatingRoute } = routeCrud.useUpdate();
  const { mutate: deleteRoute } = routeCrud.useDelete();

  const regions = (regionData?.data as IRegion[]) || [];
  const depots = (depotData?.data as IDepot[]) || [];
  const stops = useMemo(() => (stopsData?.data as IStopWithAudio[]) || [], [stopsData]);
  const routes = useMemo(() => {
    const list = (routesData?.data as IRoute[]) || [];
    return sortByLatestCreated(list);
  }, [routesData]);

  // Auto-select Region for depot_admin / region_admin
  useEffect(() => {
    if (!regions || regions.length === 0) return;
    const userRole = user?.role?.name?.toLowerCase();
    const isRegionOrDepotAdmin = userRole === "region_admin" || userRole === "depot_admin";
    const userRegionId = user?.region?.id || (user as any)?.region_id;

    if (isRegionOrDepotAdmin && userRegionId) {
      const assigned = regions.find((r) => r.id === userRegionId) || user.region || null;
      if (selectedRegion?.id !== userRegionId && assigned) {
        setRoutesPageRegion(assigned as any);
        return;
      }
    }

    if (!selectedRegion || !regions.some((r) => r.id === selectedRegion.id)) {
      setRoutesPageRegion(regions[0]);
    }
  }, [regions, selectedRegion, setRoutesPageRegion, user]);

  // Auto-select Depot
  useEffect(() => {
    if (!depots) return;
    if (depots.length === 0 && selectedDepot) {
      setRoutesPageDepot(null);
      return;
    }

    const userRole = user?.role?.name?.toLowerCase();
    const isDepotAdmin = userRole === "depot_admin";
    const userDepotId = user?.depot?.id || (user as any)?.depot_id;

    if (isDepotAdmin && userDepotId) {
      const assigned = depots.find((d) => d.id === userDepotId) || user.depot || null;
      if (selectedDepot?.id !== userDepotId && assigned) {
        setRoutesPageDepot(assigned as any);
        return;
      }
    }

    if (depots.length > 0 && (!selectedDepot || !depots.some((d) => d.id === selectedDepot.id))) {
      setRoutesPageDepot(depots[0]);
    }
  }, [depots, selectedDepot, setRoutesPageDepot, user]);

  // Filter routes search
  const [searchTerm, setSearchTerm] = useState("");
  const filteredRoutes = useMemo(() => {
    if (!routes) return [];
    if (!searchTerm.trim()) return routes;
    const q = searchTerm.toLowerCase();
    return routes.filter((r) => {
      const rNum = (r.route_number || "").toLowerCase();
      const rNum1 = (r.route_number_1 || "").toLowerCase();
      const rNum2 = (r.route_number_2 || "").toLowerCase();
      const src = (r.source || "").toLowerCase();
      const dst = (r.destination || "").toLowerCase();
      const via = (r.via || "").toLowerCase();
      return (
        rNum.includes(q) ||
        rNum1.includes(q) ||
        rNum2.includes(q) ||
        src.includes(q) ||
        dst.includes(q) ||
        via.includes(q)
      );
    });
  }, [routes, searchTerm]);

  // Selected routes for batch actions
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedRouteIds), [selectedRouteIds]);

  const handleDeleteSelectedRoutes = async () => {
    if (!selectedRouteIds.length) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedRouteIds.length} selected route(s)? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await Promise.all(selectedRouteIds.map((id) => deleteRoute(id)));
      toast.success(`${selectedRouteIds.length} route(s) deleted successfully`);
      setSelectedRouteIds([]);
      refetchRoutes();
    } catch (err: any) {
      toast.error(`Error deleting routes: ${err?.message || "Unknown error"}`);
    }
  };

  // ==================== Modal State ====================
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1); // Step 1: Route & Stops, Step 2: Signboard Display Slides
  const [editingRoute, setEditingRoute] = useState<IRoute | null>(null);

  // Step 1: Form Fields
  const [isSplitRoute, setIsSplitRoute] = useState(false);
  const [routeNumber, setRouteNumber] = useState("");
  const [routeNumber1, setRouteNumber1] = useState("");
  const [routeNumber2, setRouteNumber2] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("");
  const [viaStops, setViaStops] = useState<ViaItem[]>([]);
  const [selectedViaPickerId, setSelectedViaPickerId] = useState<string>("");

  // Step 1: Drag-and-drop state for vias
  const [draggedViaIndex, setDraggedViaIndex] = useState<number | null>(null);
  const [dragOverViaIndex, setDragOverViaIndex] = useState<number | null>(null);

  // Step 2: Signboard Display Placeholders
  const [activeBoardTab, setActiveBoardTab] = useState<BoardType>("front");
  const [frontPlaceholders, setFrontPlaceholders] = useState<SimulationPlaceholder[]>([]);
  const [sidePlaceholders, setSidePlaceholders] = useState<SimulationPlaceholder[]>([]);
  const [rearPlaceholders, setRearPlaceholders] = useState<SimulationPlaceholder[]>([]);

  // Step 2: Slide Builder Form State
  const [newSlideFormat, setNewSlideFormat] = useState<SimulationFormat>("two");
  const [newSlideLanguage, setNewSlideLanguage] = useState<string>("en");
  const [newSlideType, setNewSlideType] = useState<SimulationType>("route");

  // Step 2: Drag-and-drop state for slides
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState<number | null>(null);

  // Delete Route Confirmation
  const [deleteConfirmRoute, setDeleteConfirmRoute] = useState<IRoute | null>(null);

  // Open modal if ?create=true in query
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams]);

  // Reset or initialize modal
  const handleOpenCreate = () => {
    setEditingRoute(null);
    setModalStep(1);
    setIsSplitRoute(false);
    setRouteNumber("");
    setRouteNumber1("");
    setRouteNumber2("");
    setSelectedSourceId("");
    setSelectedDestinationId("");
    setViaStops([]);
    setSelectedViaPickerId("");

    // Initial default placeholder configurations for a brand new route
    setFrontPlaceholders([
      { id: "front-1", format: "two", language: "en", type: "route" },
      { id: "front-2", format: "two", language: "kn", type: "route" },
    ]);
    setSidePlaceholders([
      { id: "side-1", format: "two", language: "en", type: "route" },
      { id: "side-2", format: "three", language: "en", type: "route" },
    ]);
    setRearPlaceholders([
      { id: "rear-1", format: "two", language: "en", type: "route" },
    ]);

    setActiveBoardTab("front");
    setIsConfigModalOpen(true);
  };

  const handleOpenEdit = (route: IRoute) => {
    setEditingRoute(route);
    setModalStep(1);
    setIsSplitRoute(Boolean(route.is_split_route));
    setRouteNumber(route.route_number || "");
    setRouteNumber1(route.route_number_1 || "");
    setRouteNumber2(route.route_number_2 || "");

    // Match source stop by name or id
    const foundSrc = stops.find(
      (s) => s.name?.toLowerCase().trim() === (route.source || "").toLowerCase().trim()
    );
    setSelectedSourceId(foundSrc ? foundSrc.id : "");

    // Match destination stop by name or id
    const foundDest = stops.find(
      (s) => s.name?.toLowerCase().trim() === (route.destination || "").toLowerCase().trim()
    );
    setSelectedDestinationId(foundDest ? foundDest.id : "");

    // Parse existing via stops from route.stops JSON or route.via string
    const loadedVias: ViaItem[] = [];
    if (route.stops) {
      try {
        const parsed = typeof route.stops === "string" ? JSON.parse(route.stops) : route.stops;
        if (Array.isArray(parsed)) {
          const intermediate = parsed.filter(
            (p: any) =>
              p.type === "via" ||
              (p.name !== route.source && p.name !== route.destination)
          );
          if (intermediate.length > 0) {
            intermediate.forEach((item: any) => {
              const matched = stops.find((s) => s.id === item.id || s.name === item.name);
              loadedVias.push({
                id: matched ? matched.id : item.id || `via-${item.name}`,
                name: item.name,
                name_kn: matched ? (matched as any).name_kn : undefined,
              });
            });
          }
        }
      } catch (err) {
        console.warn("Could not parse route.stops JSON:", err);
      }
    }

    // Fallback: If no vias parsed from stops array, parse from route.via comma-separated string
    if (loadedVias.length === 0 && route.via) {
      const names = route.via
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      names.forEach((name) => {
        const matched = stops.find((s) => s.name?.toLowerCase().trim() === name.toLowerCase().trim());
        loadedVias.push({
          id: matched ? matched.id : `via-${name}`,
          name: name,
          name_kn: matched ? (matched as any).name_kn : undefined,
        });
      });
    }

    setViaStops(loadedVias);
    setSelectedViaPickerId("");

    // Load existing board simulation placeholders or fallback to defaults
    const loadedFront = parseSimulationsToPlaceholders(route.front);
    const loadedSide = parseSimulationsToPlaceholders(route.side);
    const loadedRear = parseSimulationsToPlaceholders(route.rear);

    setFrontPlaceholders(
      loadedFront.length > 0
        ? loadedFront
        : [{ id: "f-1", format: "two", language: "en", type: "route" }]
    );
    setSidePlaceholders(
      loadedSide.length > 0
        ? loadedSide
        : [{ id: "s-1", format: "two", language: "en", type: "route" }]
    );
    setRearPlaceholders(
      loadedRear.length > 0
        ? loadedRear
        : [{ id: "r-1", format: "two", language: "en", type: "route" }]
    );

    setActiveBoardTab("front");
    setIsConfigModalOpen(true);
  };

  // 1. Source stops options (all available stops in depot)
  const sourceStopOptions = useMemo(() => stops, [stops]);

  // 2. Destination stops options (excludes the selected Source stop!)
  const destinationStopOptions = useMemo(() => {
    return stops.filter((s) => s.id !== selectedSourceId);
  }, [stops, selectedSourceId]);

  // 3. Via stops picker options (excludes Source, Destination, and stops already in viaStops)
  const viaStopOptions = useMemo(() => {
    const existingViaIds = new Set(viaStops.map((v) => v.id));
    return stops.filter(
      (s) =>
        s.id !== selectedSourceId &&
        s.id !== selectedDestinationId &&
        !existingViaIds.has(s.id)
    );
  }, [stops, selectedSourceId, selectedDestinationId, viaStops]);

  // Swap Source & Destination
  const handleSwapSourceDestination = () => {
    const tempSrc = selectedSourceId;
    setSelectedSourceId(selectedDestinationId);
    setSelectedDestinationId(tempSrc);
    toast.info("Swapped Source and Destination");
  };

  // Add a via stop to the list
  const handleAddVia = (stopIdToAdd?: string) => {
    const id = stopIdToAdd || selectedViaPickerId;
    if (!id) return;
    const stopObj = stops.find((s) => s.id === id);
    if (!stopObj) return;

    if (stopObj.id === selectedSourceId) {
      toast.warning("Selected stop is already the Source stop");
      return;
    }
    if (stopObj.id === selectedDestinationId) {
      toast.warning("Selected stop is already the Destination stop");
      return;
    }
    if (viaStops.some((v) => v.id === stopObj.id)) {
      toast.warning("This stop is already in the Via list");
      return;
    }

    setViaStops((prev) => [
      ...prev,
      {
        id: stopObj.id,
        name: stopObj.name,
        name_kn: (stopObj as any).name_kn,
      },
    ]);
    setSelectedViaPickerId("");
  };

  // Remove a via stop
  const handleRemoveVia = (index: number) => {
    setViaStops((prev) => prev.filter((_, i) => i !== index));
  };

  // Move via stop up
  const handleMoveViaUp = (index: number) => {
    if (index === 0) return;
    setViaStops((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move via stop down
  const handleMoveViaDown = (index: number) => {
    if (index >= viaStops.length - 1) return;
    setViaStops((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Drag and Drop handlers for Vias
  const handleViaDragStart = (index: number) => setDraggedViaIndex(index);
  const handleViaDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverViaIndex !== index) setDragOverViaIndex(index);
  };
  const handleViaDrop = (index: number) => {
    if (draggedViaIndex === null || draggedViaIndex === index) {
      setDraggedViaIndex(null);
      setDragOverViaIndex(null);
      return;
    }
    setViaStops((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(draggedViaIndex, 1);
      copy.splice(index, 0, item);
      return copy;
    });
    setDraggedViaIndex(null);
    setDragOverViaIndex(null);
  };

  // ==================== Step 2: Simulation Placeholders Management ====================
  const currentBoardPlaceholders = useMemo(() => {
    if (activeBoardTab === "front") return frontPlaceholders;
    if (activeBoardTab === "side") return sidePlaceholders;
    return rearPlaceholders;
  }, [activeBoardTab, frontPlaceholders, sidePlaceholders, rearPlaceholders]);

  const setCurrentBoardPlaceholders = (
    updater: (prev: SimulationPlaceholder[]) => SimulationPlaceholder[]
  ) => {
    if (activeBoardTab === "front") setFrontPlaceholders(updater);
    else if (activeBoardTab === "side") setSidePlaceholders(updater);
    else setRearPlaceholders(updater);
  };

  // Add slide placeholder
  const handleAddSlide = () => {
    const newSlide: SimulationPlaceholder = {
      id: `${activeBoardTab}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      format: newSlideFormat,
      language: newSlideLanguage,
      type: newSlideType,
    };
    setCurrentBoardPlaceholders((prev) => [...prev, newSlide]);
    toast.success(
      `Added ${newSlideFormat.toUpperCase()} slide (${newSlideLanguage.toUpperCase()}) to ${activeBoardTab.toUpperCase()} board`
    );
  };

  // Remove slide placeholder
  const handleRemoveSlide = (index: number) => {
    setCurrentBoardPlaceholders((prev) => prev.filter((_, i) => i !== index));
  };

  // Duplicate slide placeholder
  const handleDuplicateSlide = (index: number) => {
    const item = currentBoardPlaceholders[index];
    if (!item) return;
    const cloned: SimulationPlaceholder = {
      ...item,
      id: `${activeBoardTab}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setCurrentBoardPlaceholders((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, cloned);
      return copy;
    });
    toast.info("Slide duplicated");
  };

  // Move slide up
  const handleMoveSlideUp = (index: number) => {
    if (index === 0) return;
    setCurrentBoardPlaceholders((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move slide down
  const handleMoveSlideDown = (index: number) => {
    if (index >= currentBoardPlaceholders.length - 1) return;
    setCurrentBoardPlaceholders((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Drag and drop for slides
  const handleSlideDragStart = (index: number) => setDraggedSlideIndex(index);
  const handleSlideDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverSlideIndex !== index) setDragOverSlideIndex(index);
  };
  const handleSlideDrop = (index: number) => {
    if (draggedSlideIndex === null || draggedSlideIndex === index) {
      setDraggedSlideIndex(null);
      setDragOverSlideIndex(null);
      return;
    }
    setCurrentBoardPlaceholders((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(draggedSlideIndex, 1);
      copy.splice(index, 0, item);
      return copy;
    });
    setDraggedSlideIndex(null);
    setDragOverSlideIndex(null);
  };

  // Copy slides from Front to Side or Rear
  const handleCopyBoardSlides = (targetBoard: BoardType) => {
    const sourceSlides = activeBoardTab === "front" ? frontPlaceholders : currentBoardPlaceholders;
    if (sourceSlides.length === 0) {
      toast.warning(`No slides on ${activeBoardTab.toUpperCase()} board to copy.`);
      return;
    }
    const cloned = sourceSlides.map((s) => ({
      ...s,
      id: `${targetBoard}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    if (targetBoard === "side") setSidePlaceholders(cloned);
    else if (targetBoard === "rear") setRearPlaceholders(cloned);
    else setFrontPlaceholders(cloned);

    toast.success(`Copied ${cloned.length} slides to ${targetBoard.toUpperCase()} board!`);
  };

  // Selected stop objects
  const selectedSourceStop = useMemo(
    () => stops.find((s) => s.id === selectedSourceId),
    [stops, selectedSourceId]
  );
  const selectedDestStop = useMemo(
    () => stops.find((s) => s.id === selectedDestinationId),
    [stops, selectedDestinationId]
  );

  // ==================== Save Route Configuration ====================
  const handleSaveRoute = async () => {
    if (!selectedDepot?.id) {
      toast.error("Please select a depot before saving route configuration");
      return;
    }

    // 1. Validate route number
    const trimmedNum = routeNumber.trim();
    const trimmedNum1 = routeNumber1.trim();
    const trimmedNum2 = routeNumber2.trim();

    if (!isSplitRoute && !trimmedNum) {
      toast.error("Route Number is required");
      setModalStep(1);
      return;
    }
    if (isSplitRoute && (!trimmedNum1 || !trimmedNum2)) {
      toast.error("Both Route #1 and Route #2 are required for Split Route");
      setModalStep(1);
      return;
    }

    // 2. Validate Source & Destination
    if (!selectedSourceId || !selectedSourceStop) {
      toast.error("Please select a valid Source stop from the list");
      setModalStep(1);
      return;
    }
    if (!selectedDestinationId || !selectedDestStop) {
      toast.error("Please select a valid Destination stop from the list");
      setModalStep(1);
      return;
    }
    if (selectedSourceId === selectedDestinationId) {
      toast.error("Source and Destination cannot be the same stop");
      setModalStep(1);
      return;
    }

    // 3. Duplicate check in depot
    const checkNum = isSplitRoute ? `${trimmedNum1}-${trimmedNum2}` : trimmedNum;
    const isDup = await checkActiveDuplicate(
      "routes",
      "route_number",
      checkNum,
      { depot_id: selectedDepot.id },
      editingRoute?.id
    );

    if (isDup) {
      toast.error(`Route number "${checkNum}" is already in use in depot ${selectedDepot.name}`);
      return;
    }

    // 4. Construct complete stops array
    const orderedStops = [
      {
        id: selectedSourceStop.id,
        name: selectedSourceStop.name,
        name_kn: (selectedSourceStop as any).name_kn,
        type: "source",
        sequence: 1,
      },
      ...viaStops.map((v, i) => ({
        id: v.id,
        name: v.name,
        name_kn: v.name_kn,
        type: "via",
        sequence: i + 2,
      })),
      {
        id: selectedDestStop.id,
        name: selectedDestStop.name,
        name_kn: (selectedDestStop as any).name_kn,
        type: "destination",
        sequence: viaStops.length + 2,
      },
    ];

    const viaString = viaStops.map((v) => v.name).join(", ");

    // 5. Prepopulate full simulations for front, side, and rear boards from placeholders!
    const routeMeta = {
      routeNumber: checkNum,
      routeNumber1: isSplitRoute ? trimmedNum1 : checkNum,
      routeNumber2: isSplitRoute ? trimmedNum2 : "",
      isSplitRoute,
      source: selectedSourceStop.name,
      source_kn: (selectedSourceStop as any).name_kn || selectedSourceStop.name,
      destination: selectedDestStop.name,
      destination_kn: (selectedDestStop as any).name_kn || selectedDestStop.name,
      via: viaString,
      via_kn: viaStops.map((v) => (v as any).name_kn || v.name).join(" - "),
      viaStops: viaStops.map((v) => ({ name: v.name, name_kn: (v as any).name_kn })),
    };

    const frontSimulations = generateSimulationsFromPlaceholders(
      frontPlaceholders.length > 0
        ? frontPlaceholders
        : [{ id: "f-def", format: "two", language: "en", type: "route" }],
      "front",
      routeMeta
    );

    const sideSimulations = generateSimulationsFromPlaceholders(
      sidePlaceholders.length > 0
        ? sidePlaceholders
        : [{ id: "s-def", format: "two", language: "en", type: "route" }],
      "side",
      routeMeta
    );

    const rearSimulations = generateSimulationsFromPlaceholders(
      rearPlaceholders.length > 0
        ? rearPlaceholders
        : [{ id: "r-def", format: "two", language: "en", type: "route" }],
      "rear",
      routeMeta
    );

    const payload: Partial<IRoute> = {
      route_number: checkNum,
      is_split_route: isSplitRoute,
      route_number_1: isSplitRoute ? trimmedNum1 : "",
      route_number_2: isSplitRoute ? trimmedNum2 : "",
      source: selectedSourceStop.name,
      destination: selectedDestStop.name,
      via: viaString,
      stops: JSON.stringify(orderedStops),
      front: JSON.stringify(frontSimulations),
      side: JSON.stringify(sideSimulations),
      rear: JSON.stringify(rearSimulations),
      depot_id: selectedDepot.id,
      organization_id: selectedOrganization?.id || null,
      version: editingRoute?.version || "2.0",
      return: editingRoute?.return ?? false,
      created_by: user?.id || "",
    };

    if (editingRoute) {
      updateRoute(
        {
          id: editingRoute.id,
          payload,
        },
        {
          onSuccess: () => {
            toast.success(`Route configuration "${checkNum}" updated successfully!`);
            setIsConfigModalOpen(false);
            refetchRoutes();
          },
          onError: (err: any) => {
            console.error("Error updating route configuration:", err);
            toast.error(`Failed to update route: ${err.message || "Unknown error"}`);
          },
        }
      );
    } else {
      createRoute(
        {
          ...payload,
          internal: "[]",
          created_at: new Date().toISOString(),
        } as any,
        {
          onSuccess: () => {
            toast.success(`Route configuration "${checkNum}" created successfully!`);
            setIsConfigModalOpen(false);
            refetchRoutes();
          },
          onError: (err: any) => {
            console.error("Error creating route configuration:", err);
            toast.error(`Failed to save route: ${err.message || "Unknown error"}`);
          },
        }
      );
    }
  };

  // Delete Route
  const handleDeleteRoute = () => {
    if (!deleteConfirmRoute) return;
    deleteRoute(deleteConfirmRoute.id, {
      onSuccess: () => {
        toast.success(`Route ${deleteConfirmRoute.route_number} deleted successfully`);
        setDeleteConfirmRoute(null);
        refetchRoutes();
      },
      onError: (err: any) => {
        toast.error(`Error deleting route: ${err.message || "Unknown error"}`);
      },
    });
  };

  const hasRegions = regions && regions.length > 0;
  const hasDepots = depots && depots.length > 0;
  const hasStops = stops && stops.length > 0;

  // Language Code helper
  const getLanguageLabel = (code: string) => {
    const item = AVAILABLE_LANGUAGES.find((l) => l.code === code);
    return item ? `${item.label} (${code})` : code.toUpperCase();
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-5 p-4 sm:p-6 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-border pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-primary border border-brand-500/20">
              <FeatherGitBranch className="h-4 w-4" />
            </div>
            <h1 className="text-heading-2 font-heading-2 text-default-font tracking-tight">
              Route Configuration
            </h1>
          </div>
          <p className="text-caption font-caption text-subtext-color">
            Configure transit routes, assign stops, and plan simulation slide types for Front, Side, and Rear signboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRouteIds.length > 0 && (
            <RBAC
              roles={["depot_admin", "region_admin", "organization_admin", "master"]}
              features={["PIS", "PAS", "ITMS"]}
            >
              <Button
                variant="destructive-secondary"
                icon={<FeatherTrash />}
                onClick={handleDeleteSelectedRoutes}
              >
                Delete ({selectedRouteIds.length})
              </Button>
            </RBAC>
          )}
          <Button
            variant="neutral-secondary"
            icon={<FeatherMapPin />}
            onClick={() => navigate("/home/stops")}
            title="Manage depot stops in Stops page"
          >
            Manage Stops
          </Button>
          <Button
            variant="neutral-secondary"
            icon={<FeatherRefreshCw />}
            onClick={() => {
              refetchRoutes();
              refetchStops();
              toast.success("Refreshed routes and stops");
            }}
          >
            Refresh
          </Button>
          <RBAC
            roles={["depot_admin", "region_admin", "organization_admin", "master"]}
            features={["PIS", "PAS", "ITMS"]}
          >
            <Button
              variant="brand-primary"
              icon={<FeatherPlus />}
              disabled={!selectedDepot}
              onClick={handleOpenCreate}
            >
              New Route Configuration
            </Button>
          </RBAC>
        </div>
      </div>

      {/* Filter & Depot Selection Bar */}
      <div className="flex w-full flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TextField
            className="h-9 w-full sm:w-72 flex-none"
            variant="filled"
            icon={<FeatherSearch />}
            helpText=""
          >
            <TextField.Input
              placeholder="Search routes, stops, vias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </TextField>
        </div>

        {/* Region & Depot Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {hasRegions && (
            <>
              <RBAC features={[]} roles={["depot_admin", "region_admin"]}>
                <RegionSelect
                  regions={regions.filter((r) => user?.region?.id === r.id)}
                  selectedRegionId={selectedRegion?.id ?? ""}
                  onValueChange={(val) => {
                    setRoutesPageRegion(regions.find((r) => r.id === val) || null);
                  }}
                />
              </RBAC>
              <RBAC features={[]} roles={["master", "organization_admin", "guest"]}>
                <RegionSelect
                  regions={regions}
                  selectedRegionId={selectedRegion?.id ?? ""}
                  onValueChange={(val) => {
                    setRoutesPageRegion(regions.find((r) => r.id === val) || null);
                  }}
                />
              </RBAC>
            </>
          )}

          {hasDepots && (
            <RBAC features={[]} roles={["master", "organization_admin", "region_admin", "guest"]}>
              <Select
                className="h-auto flex-none"
                variant="filled"
                label="Select Depot"
                placeholder="Select Depot"
                value={selectedDepot?.id ?? ""}
                onValueChange={(val) => {
                  setRoutesPageDepot(depots.find((d) => d.id === val) || null);
                }}
              >
                {depots.map((depot) => (
                  <Select.Item key={depot.id} value={depot.id}>
                    {depot.name}
                  </Select.Item>
                ))}
              </Select>
            </RBAC>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-3.5 shadow-2xs">
          <span className="text-caption font-medium text-subtext-color">Total Routes</span>
          <span className="text-heading-3 font-heading-3 text-default-font">{routes.length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-3.5 shadow-2xs">
          <span className="text-caption font-medium text-subtext-color">Catalog Stops</span>
          <span className="text-heading-3 font-heading-3 text-brand-primary">{stops.length}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-3.5 shadow-2xs">
          <span className="text-caption font-medium text-subtext-color">Split Routes</span>
          <span className="text-heading-3 font-heading-3 text-default-font">
            {routes.filter((r) => r.is_split_route).length}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-border bg-sidebar-background p-3.5 shadow-2xs">
          <span className="text-caption font-medium text-subtext-color">Active Depot</span>
          <span className="text-caption-bold font-caption-bold text-default-font truncate">
            {selectedDepot?.name || "None"}
          </span>
        </div>
      </div>

      {/* Warning if depot has no stops */}
      {selectedDepot && stops.length === 0 && !isLoadingStops && (
        <div className="flex w-full items-center justify-between gap-3 p-4 rounded-xl border border-warning-200 bg-warning-50/70 text-warning-900">
          <div className="flex items-center gap-3">
            <FeatherAlertTriangle className="h-5 w-5 text-warning-600 flex-none" />
            <div className="flex flex-col">
              <span className="text-body-bold font-body-bold">No stops found in this depot!</span>
              <span className="text-caption font-caption">
                Before configuring routes, create stops for <strong>{selectedDepot.name}</strong> in the Stops page.
              </span>
            </div>
          </div>
          <Button
            variant="brand-primary"
            size="small"
            icon={<FeatherPlus />}
            onClick={() => navigate("/home/stops")}
          >
            Add Stops in Stops Page
          </Button>
        </div>
      )}

      {/* Route Configurations Table */}
      <div className="flex flex-col overflow-auto w-full items-start gap-6 rounded-md border border-solid border-neutral-border bg-sidebar-background px-4 py-4 shadow-xs">
        <Table
          className="overflow-auto touch-scroll-x"
          header={
            <Table.HeaderRow>
              <Table.HeaderCell className="w-10">
                <Checkbox
                  label=""
                  checked={
                    filteredRoutes.length > 0 && selectedRouteIds.length === filteredRoutes.length
                  }
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setSelectedRouteIds(filteredRoutes.map((r) => r.id));
                    } else {
                      setSelectedRouteIds([]);
                    }
                  }}
                />
              </Table.HeaderCell>
              <Table.HeaderCell className="min-w-[100px]">Route No</Table.HeaderCell>
              <Table.HeaderCell className="min-w-[120px]">Source</Table.HeaderCell>
              <Table.HeaderCell className="min-w-[120px]">Destination</Table.HeaderCell>
              <Table.HeaderCell className="min-w-[150px]">Via Stops</Table.HeaderCell>
              <Table.HeaderCell className="hidden md:table-cell min-w-[110px] justify-center text-center">
                Split Route
              </Table.HeaderCell>
              <Table.HeaderCell className="hidden md:table-cell min-w-[90px] justify-center text-center">
                Return
              </Table.HeaderCell>
              <Table.HeaderCell className="hidden sm:table-cell min-w-[90px] justify-center text-center">
                Version
              </Table.HeaderCell>
              <Table.HeaderCell className="hidden lg:table-cell min-w-[130px] justify-center text-center">
                Signboards (F / S / R)
              </Table.HeaderCell>
              <Table.HeaderCell className="hidden lg:table-cell min-w-[110px]">
                Created At
              </Table.HeaderCell>
              <Table.HeaderCell className="hidden xl:table-cell min-w-[140px]">
                Created By
              </Table.HeaderCell>
              <Table.HeaderCell className="w-12 justify-end" />
            </Table.HeaderRow>
          }
        >
          {filteredRoutes.length === 0 ? (
            <Table.Row>
              <Table.Cell className="col-span-12 text-center py-12 justify-center text-subtext-color">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FeatherRoute className="h-8 w-8 text-neutral-400" />
                  <span className="text-body-bold font-body-bold text-default-font">
                    {routes.length === 0
                      ? "No Route Configurations Found"
                      : "No matching routes for filter"}
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    {routes.length === 0
                      ? "Create your first route configuration by assigning stops and simulation slides."
                      : "Try a different search term or clear the filter."}
                  </span>
                  {routes.length === 0 && (
                    <Button
                      className="mt-2"
                      variant="brand-primary"
                      icon={<FeatherPlus />}
                      disabled={!selectedDepot || stops.length === 0}
                      onClick={handleOpenCreate}
                    >
                      Create Route Configuration
                    </Button>
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
          ) : (
            filteredRoutes.map((route) => {
              const isSelected = selectedSet.has(route.id);
              let viaList: string[] = [];
              if (route.stops) {
                try {
                  const parsed =
                    typeof route.stops === "string" ? JSON.parse(route.stops) : route.stops;
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    viaList = parsed
                      .filter((p: any) => p.type === "via")
                      .map((p: any) => p.name);
                  }
                } catch {
                  // Fallback
                }
              }
              if (viaList.length === 0 && route.via) {
                viaList = route.via
                  .split(/[,;]/)
                  .map((s) => s.trim())
                  .filter(Boolean);
              }

              // Count slides
              const fCount = parseSimulationsToPlaceholders(route.front).length;
              const sCount = parseSimulationsToPlaceholders(route.side).length;
              const rCount = parseSimulationsToPlaceholders(route.rear).length;

              return (
                <Table.Row
                  key={route.id}
                  id={`route-row-${route.id}`}
                  className={SubframeUtils.twClassNames(
                    "transition-all duration-300",
                    isSelected &&
                      "!bg-brand-50/90 border-l-4 !border-l-brand-primary ring-1 ring-inset ring-brand-300 shadow-xs"
                  )}
                >
                  <Table.Cell className="w-10">
                    <Checkbox
                      label=""
                      checked={isSelected}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          setSelectedRouteIds((prev) => [...prev, route.id]);
                        } else {
                          setSelectedRouteIds((prev) => prev.filter((id) => id !== route.id));
                        }
                      }}
                    />
                  </Table.Cell>

                  <Table.Cell className="min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                        {!route.is_split_route
                          ? `${route.route_number}`
                          : `${route.route_number_1} - ${route.route_number_2}`}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand-primary text-white shadow-xs">
                          Selected
                        </span>
                      )}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="min-w-[120px]">
                    <span className="whitespace-nowrap text-body font-body text-neutral-500">
                      {route.source}
                    </span>
                  </Table.Cell>

                  <Table.Cell className="min-w-[120px]">
                    <span className="whitespace-nowrap text-body font-body text-neutral-500">
                      {route.destination}
                    </span>
                  </Table.Cell>

                  <Table.Cell className="min-w-[150px]">
                    {viaList.length > 0 ? (
                      <span
                        className="whitespace-nowrap text-body font-body text-neutral-500 truncate max-w-[200px]"
                        title={viaList.join(" ➔ ")}
                      >
                        {viaList.join(", ")}
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-body font-body text-neutral-400 italic">Direct (No via)</span>
                    )}
                  </Table.Cell>

                  <Table.Cell className="hidden md:table-cell min-w-[110px] justify-center text-center">
                    <Badge
                      variant={route.is_split_route ? "brand" : "neutral"}
                      icon={route.is_split_route ? <FeatherCheck className="h-3 w-3" /> : <FeatherX className="h-3 w-3" />}
                    >
                      {route.is_split_route ? "Yes" : "No"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell className="hidden md:table-cell min-w-[90px] justify-center text-center">
                    <Badge
                      variant={route.return ? "brand" : "neutral"}
                      icon={route.return ? <FeatherCheck className="h-3 w-3" /> : <FeatherX className="h-3 w-3" />}
                    >
                      {route.return ? "Yes" : "No"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell className="hidden sm:table-cell min-w-[90px] justify-center text-center">
                    <Badge
                      variant={route.version === "1.0" ? "warning" : "brand"}
                      icon={
                        route.version === "1.0" ? (
                          <FeatherTag className="h-3 w-3" />
                        ) : (
                          <FeatherLayers className="h-3 w-3" />
                        )
                      }
                    >
                      {route.version === "1.0" ? "V1" : "V2"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell className="hidden lg:table-cell min-w-[130px] justify-center text-center">
                    <div className="flex items-center gap-1.5 text-xs font-mono justify-center">
                      <span
                        className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-primary border border-brand-500/20 font-semibold"
                        title="Front Board Slides"
                      >
                        F: {fCount}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded bg-neutral-100 text-default-font border border-neutral-border font-semibold"
                        title="Side Board Slides"
                      >
                        S: {sCount}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded bg-neutral-100 text-default-font border border-neutral-border font-semibold"
                        title="Rear Board Slides"
                      >
                        R: {rCount}
                      </span>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="hidden lg:table-cell min-w-[110px]">
                    <span className="whitespace-nowrap text-body font-body text-neutral-500">
                      {formatDate(route.created_at)}
                    </span>
                  </Table.Cell>

                  <Table.Cell className="hidden xl:table-cell min-w-[140px]">
                    <span className="whitespace-nowrap text-body font-body flex items-center gap-1.5 text-default-font">
                      <Avvvatars
                        value={(route as any).created_by_user?.email || "Unknown"}
                        size={20}
                        style="shape"
                      />
                      {(route as any).created_by_user?.email || "Unknown"}
                    </span>
                  </Table.Cell>

                  <Table.Cell className="w-12 justify-end">
                    <div className="flex grow shrink-0 basis-0 items-center justify-end">
                      <SubframeCore.DropdownMenu.Root>
                        <SubframeCore.DropdownMenu.Trigger asChild={true}>
                          <IconButton
                            variant="neutral-tertiary"
                            size="medium"
                            icon={<FeatherMoreHorizontal />}
                          />
                        </SubframeCore.DropdownMenu.Trigger>
                        <SubframeCore.DropdownMenu.Portal>
                          <SubframeCore.DropdownMenu.Content
                            side="bottom"
                            align="end"
                            sideOffset={8}
                            asChild={true}
                          >
                            <DropdownMenu>
                              <DropdownMenu.DropdownItem
                                onClick={() => handleOpenEdit(route)}
                                icon={<FeatherEdit2 />}
                              >
                                Edit Configuration
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem
                                onClick={() =>
                                  navigate(
                                    `/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}/${route.id}`
                                  )
                                }
                                icon={<FeatherExternalLink />}
                              >
                                Open Canvas Editor
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownDivider />
                              <DropdownMenu.DropdownItem
                                onClick={() => setDeleteConfirmRoute(route)}
                                icon={<FeatherTrash />}
                              >
                                Delete
                              </DropdownMenu.DropdownItem>
                            </DropdownMenu>
                          </SubframeCore.DropdownMenu.Content>
                        </SubframeCore.DropdownMenu.Portal>
                      </SubframeCore.DropdownMenu.Root>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table>
      </div>

      {/* ============================================================== */}
      {/* ROUTE CONFIGURATION MODAL / DIALOG */}
      {/* ============================================================== */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <Dialog.Content className="w-[98vw] max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] max-h-[92vh] flex flex-col items-stretch p-0 overflow-hidden bg-sidebar-background rounded-2xl shadow-2xl border border-neutral-border">
          {/* Modal Header */}
          <div className="flex h-18 w-full flex-none items-center justify-between border-b border-neutral-border px-8 py-4 bg-neutral-0/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-primary border border-brand-500/20 flex-none">
                <FeatherGitBranch className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-heading-3 font-heading-3 text-default-font leading-tight">
                  {editingRoute ? "Edit Route Configuration" : "New Route Configuration"}
                </h2>
                <span className="text-xs text-subtext-color">
                  Depot: <strong>{selectedDepot?.name || "None"}</strong> | Configure route path & signboard templates
                </span>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-border">
              <button
                type="button"
                onClick={() => setModalStep(1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  modalStep === 1
                    ? "bg-sidebar-background text-brand-primary shadow-xs"
                    : "text-subtext-color hover:text-default-font"
                }`}
              >
                <span>1. Route & Stops</span>
              </button>
              <button
                type="button"
                onClick={() => setModalStep(2)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  modalStep === 2
                    ? "bg-sidebar-background text-brand-primary shadow-xs"
                    : "text-subtext-color hover:text-default-font"
                }`}
              >
                <span>2. Signboards (F / S / R)</span>
                <Badge variant="neutral" className="text-[11px] px-1.5 py-0 h-4">
                  {frontPlaceholders.length + sidePlaceholders.length + rearPlaceholders.length}
                </Badge>
              </button>
            </div>

            <IconButton
              variant="neutral-tertiary"
              size="small"
              icon={<FeatherX className="h-4 w-4" />}
              onClick={() => setIsConfigModalOpen(false)}
            />
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 w-full overflow-y-auto p-6 md:p-8 space-y-6">
            {/* ============================================================== */}
            {/* STEP 1: ROUTE NUMBER, SPLIT ROUTE & STOPS                      */}
            {/* ============================================================== */}
            {modalStep === 1 && (
              <div className="w-full space-y-6">
                {/* Section 1: Route Number & Split Route */}
                <div className="w-full rounded-2xl border border-neutral-border bg-neutral-0/40 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                    <div className="flex flex-col">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Split Route (Dual Route Numbers)
                      </span>
                      <span className="text-caption text-subtext-color">
                        Enable if this service operates under two distinct route identifiers (e.g., 101A outward / 101B return)
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-caption font-medium text-subtext-color">Split Route</span>
                      <Checkbox
                        checked={isSplitRoute}
                        onCheckedChange={(checked) => setIsSplitRoute(Boolean(checked))}
                      />
                    </div>
                  </div>

                  {!isSplitRoute ? (
                    <div className="w-full max-w-xl">
                      <TextField
                        size="medium"
                        className="w-full"
                        label={
                          <span>
                            Route Number <span className="text-red-500">*</span>
                          </span>
                        }
                        variant="filled"
                        helpText="Primary route number displayed on boards (e.g. 500-D, 12, 215, 335-E)"
                      >
                        <TextField.Input
                          placeholder="e.g. 500-D"
                          value={routeNumber}
                          onChange={(e) => setRouteNumber(e.target.value)}
                        />
                      </TextField>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                      <TextField
                        size="medium"
                        className="w-full"
                        label={
                          <span>
                            Route #1 (Outward) <span className="text-red-500">*</span>
                          </span>
                        }
                        variant="filled"
                        helpText="Primary outward number (e.g. 101)"
                      >
                        <TextField.Input
                          placeholder="e.g. 101"
                          value={routeNumber1}
                          onChange={(e) => setRouteNumber1(e.target.value)}
                        />
                      </TextField>
                      <TextField
                        size="medium"
                        className="w-full"
                        label={
                          <span>
                            Route #2 (Return) <span className="text-red-500">*</span>
                          </span>
                        }
                        variant="filled"
                        helpText="Secondary return number (e.g. 102)"
                      >
                        <TextField.Input
                          placeholder="e.g. 102"
                          value={routeNumber2}
                          onChange={(e) => setRouteNumber2(e.target.value)}
                        />
                      </TextField>
                    </div>
                  )}
                </div>

                {/* Section 2: Origin (Source) & Destination Selectors */}
                <div className="w-full rounded-2xl border border-neutral-border bg-neutral-0/40 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                    <div className="flex flex-col">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Origin & Destination Endpoints
                      </span>
                      <span className="text-caption text-subtext-color">
                        Pick source and destination strictly from registered depot stops
                      </span>
                    </div>
                    {selectedSourceId && selectedDestinationId && (
                      <Button
                        variant="neutral-secondary"
                        size="small"
                        icon={<FeatherArrowUpDown className="h-3.5 w-3.5" />}
                        onClick={handleSwapSourceDestination}
                      >
                        Swap Source ⇄ Dest
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
                    {/* Source Stop Picker */}
                    <div className="flex flex-col gap-3 p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-none" />
                        <span className="text-caption-bold font-caption-bold text-default-font">
                          Source Stop (Origin) <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <Select
                        className="w-full min-w-0"
                        variant="filled"
                        placeholder="Select Source Stop"
                        value={selectedSourceId}
                        onValueChange={(val) => {
                          setSelectedSourceId(val);
                          if (val === selectedDestinationId) {
                            setSelectedDestinationId("");
                          }
                        }}
                      >
                        {sourceStopOptions.map((s) => (
                          <Select.Item key={s.id} value={s.id}>
                            {s.name} {(s as any).name_kn ? `(${ (s as any).name_kn })` : ""}
                          </Select.Item>
                        ))}
                      </Select>

                      {selectedSourceStop ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                            Selected
                          </span>
                          <span className="truncate"><strong>{selectedSourceStop.name}</strong> {(selectedSourceStop as any).name_kn ? `— ${(selectedSourceStop as any).name_kn}` : ""}</span>
                        </div>
                      ) : (
                        <span className="text-micro text-subtext-color">Choose the starting stop for this route</span>
                      )}
                    </div>

                    {/* Destination Stop Picker (Excludes Source) */}
                    <div className="flex flex-col gap-3 p-5 rounded-xl border border-rose-500/25 bg-rose-500/5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 flex-none" />
                        <span className="text-caption-bold font-caption-bold text-default-font">
                          Destination Stop (Terminus) <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <Select
                        className="w-full min-w-0"
                        variant="filled"
                        placeholder="Select Destination Stop"
                        value={selectedDestinationId}
                        onValueChange={(val) => setSelectedDestinationId(val)}
                      >
                        {destinationStopOptions.map((s) => (
                          <Select.Item key={s.id} value={s.id}>
                            {s.name} {(s as any).name_kn ? `(${ (s as any).name_kn })` : ""}
                          </Select.Item>
                        ))}
                      </Select>

                      {selectedDestStop ? (
                        <div className="flex items-center gap-2 text-xs text-rose-800 font-medium">
                          <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                            Selected
                          </span>
                          <span className="truncate"><strong>{selectedDestStop.name}</strong> {(selectedDestStop as any).name_kn ? `— ${(selectedDestStop as any).name_kn}` : ""}</span>
                        </div>
                      ) : (
                        <span className="text-micro text-subtext-color">Source stop is excluded automatically</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Multiple Via's (Intermediate Stops) */}
                <div className="w-full rounded-2xl border border-neutral-border bg-neutral-0/40 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-border pb-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Via Stops (Intermediate Waypoints)
                        </span>
                        <Badge variant="neutral" className="text-xs font-semibold">
                          {viaStops.length} Added
                        </Badge>
                      </div>
                      <span className="text-caption text-subtext-color">
                        Select stops along the path (excludes source & destination). Drag or use arrow keys to rearrange sequence.
                      </span>
                    </div>

                    {viaStops.length > 0 && (
                      <Button
                        variant="destructive-tertiary"
                        size="small"
                        icon={<FeatherTrash className="h-3.5 w-3.5" />}
                        onClick={() => setViaStops([])}
                      >
                        Clear All Vias
                      </Button>
                    )}
                  </div>

                  {/* Add Via Picker Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center w-full">
                    <div className="sm:col-span-9 md:col-span-10">
                      <Select
                        className="w-full"
                        variant="filled"
                        placeholder={
                          viaStopOptions.length === 0
                            ? "No additional stops available in this depot"
                            : "Select intermediate stop to add as Via..."
                        }
                        value={selectedViaPickerId}
                        onValueChange={(val) => setSelectedViaPickerId(val)}
                      >
                        {viaStopOptions.map((s) => (
                          <Select.Item key={s.id} value={s.id}>
                            {s.name} {(s as any).name_kn ? `(${ (s as any).name_kn })` : ""}
                          </Select.Item>
                        ))}
                      </Select>
                    </div>
                    <div className="sm:col-span-3 md:col-span-2">
                      <Button
                        variant="brand-primary"
                        className="w-full h-9 flex items-center justify-center font-medium"
                        icon={<FeatherPlus className="h-4 w-4" />}
                        disabled={!selectedViaPickerId}
                        onClick={() => handleAddVia()}
                      >
                        Add Via Stop
                      </Button>
                    </div>
                  </div>

                  {/* Rearrangeable Via Stops List */}
                  <div className="w-full pt-1">
                    {viaStops.length === 0 ? (
                      <div className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-border bg-neutral-50/50 p-4 text-center">
                        <FeatherMapPin className="h-5 w-5 text-neutral-400 mb-1" />
                        <span className="text-caption font-medium text-subtext-color">
                          No via stops added yet
                        </span>
                        <span className="text-micro text-subtext-color">
                          Select stops above and click &quot;Add Via Stop&quot; to configure intermediate waypoints.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2.5 w-full">
                        {viaStops.map((via, idx) => {
                          const isDragged = draggedViaIndex === idx;
                          const isDragOver = dragOverViaIndex === idx;

                          return (
                            <div
                              key={via.id}
                              draggable
                              onDragStart={() => handleViaDragStart(idx)}
                              onDragOver={(e) => handleViaDragOver(e, idx)}
                              onDrop={() => handleViaDrop(idx)}
                              className={`flex items-center justify-between p-3.5 px-4 rounded-xl border transition-all ${
                                isDragOver
                                  ? "border-brand-primary bg-brand-50/70 scale-[1.005]"
                                  : isDragged
                                  ? "opacity-40 border-neutral-border bg-neutral-100"
                                  : "border-neutral-border bg-sidebar-background hover:border-neutral-400/60"
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-default-font p-1">
                                  <FeatherGripVertical className="h-4 w-4" />
                                </div>

                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/10 text-brand-primary font-mono text-xs font-bold border border-brand-500/20 flex-none">
                                  {idx + 1}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span className="text-body font-semibold text-default-font truncate">
                                    {via.name}
                                  </span>
                                  {via.name_kn && (
                                    <span className="text-caption text-subtext-color truncate">
                                      {via.name_kn}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-none">
                                <IconButton
                                  variant="neutral-tertiary"
                                  size="small"
                                  icon={<FeatherArrowUp className="h-3.5 w-3.5" />}
                                  title="Move Stop Up"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveViaUp(idx)}
                                />
                                <IconButton
                                  variant="neutral-tertiary"
                                  size="small"
                                  icon={<FeatherArrowDown className="h-3.5 w-3.5" />}
                                  title="Move Stop Down"
                                  disabled={idx === viaStops.length - 1}
                                  onClick={() => handleMoveViaDown(idx)}
                                />
                                <IconButton
                                  variant="destructive-tertiary"
                                  size="small"
                                  icon={<FeatherTrash className="h-3.5 w-3.5" />}
                                  title="Remove Via Stop"
                                  onClick={() => handleRemoveVia(idx)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Visual Route Sequence Preview (Journey Map) */}
                <div className="w-full rounded-2xl border border-neutral-border bg-neutral-0/40 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Live Route Journey Sequence
                    </span>
                    <span className="text-caption font-mono text-subtext-color">
                      Total: {selectedSourceStop ? 1 : 0} Source + {viaStops.length} Vias +{" "}
                      {selectedDestStop ? 1 : 0} Dest ={" "}
                      {(selectedSourceStop ? 1 : 0) + viaStops.length + (selectedDestStop ? 1 : 0)} Stops
                    </span>
                  </div>

                  <div className="w-full flex items-center gap-3 overflow-x-auto touch-scroll-x p-4 rounded-xl bg-sidebar-background border border-neutral-border">
                    <div className="flex items-center gap-3 flex-none">
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 font-semibold text-xs shadow-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-none" />
                        <span>{selectedSourceStop?.name || "Pick Source"}</span>
                      </div>
                      <span className="text-neutral-400 font-bold">➔</span>
                    </div>

                    {viaStops.map((via) => (
                      <div key={via.id} className="flex items-center gap-3 flex-none">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-border text-default-font font-medium text-xs shadow-xs">
                          <span className="h-2 w-2 rounded-full bg-brand-primary flex-none" />
                          <span>{via.name}</span>
                        </div>
                        <span className="text-neutral-400 font-bold">➔</span>
                      </div>
                    ))}

                    <div className="flex items-center gap-3 flex-none">
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 font-semibold text-xs shadow-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 flex-none" />
                        <span>{selectedDestStop?.name || "Pick Destination"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: FRONT, SIDE, REAR SIGNBOARD DISPLAY SLIDES            */}
            {/* ============================================================== */}
            {modalStep === 2 && (
              <div className="w-full space-y-6">
                {/* Board Selector Tabs (Front, Side, Rear) */}
                <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-border pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {BOARD_CONFIGS.map((board) => {
                      const isActive = activeBoardTab === board.id;
                      const count =
                        board.id === "front"
                          ? frontPlaceholders.length
                          : board.id === "side"
                          ? sidePlaceholders.length
                          : rearPlaceholders.length;

                      return (
                        <button
                          key={board.id}
                          type="button"
                          onClick={() => setActiveBoardTab(board.id)}
                          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-semibold transition-all border ${
                            isActive
                              ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                              : "bg-sidebar-background text-subtext-color border-neutral-border hover:text-default-font hover:bg-neutral-100/60"
                          }`}
                        >
                          <FeatherMonitor className="h-4 w-4" />
                          <span className="text-sm font-semibold">{board.label}</span>
                          <span className="text-[11px] opacity-80 font-mono">
                            ({board.width}×{board.height})
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                              isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-default-font"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Copy actions */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {activeBoardTab === "front" ? (
                      <>
                        <Button
                          variant="neutral-secondary"
                          size="small"
                          icon={<FeatherCopy className="h-3.5 w-3.5" />}
                          onClick={() => handleCopyBoardSlides("side")}
                          title="Duplicate all Front slides into Side board"
                        >
                          Copy to Side Board
                        </Button>
                        <Button
                          variant="neutral-secondary"
                          size="small"
                          icon={<FeatherCopy className="h-3.5 w-3.5" />}
                          onClick={() => handleCopyBoardSlides("rear")}
                          title="Duplicate all Front slides into Rear board"
                        >
                          Copy to Rear Board
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="neutral-secondary"
                        size="small"
                        icon={<FeatherCopy className="h-3.5 w-3.5" />}
                        onClick={() => handleCopyBoardSlides(activeBoardTab)}
                        title="Copy all slides from Front board into this board"
                      >
                        Copy from Front Board
                      </Button>
                    )}
                  </div>
                </div>

                {/* Add Simulation Slide Toolbar */}
                <div className="w-full rounded-2xl border border-neutral-border bg-neutral-0/40 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                    <div className="flex flex-col">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Add Simulation Type ({activeBoardTab.toUpperCase()} BOARD)
                      </span>
                      <span className="text-caption text-subtext-color">
                        Specify layout format and language code to generate placeholder display slides
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end w-full">
                    {/* Format selector */}
                    <div className="sm:col-span-4 flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-subtext-color">Layout Format</span>
                      <Select
                        className="w-full"
                        variant="filled"
                        value={newSlideFormat}
                        onValueChange={(val: any) => setNewSlideFormat(val)}
                      >
                        <Select.Item value="two">Two Text (Route + Text)</Select.Item>
                        <Select.Item value="three">Three Text (Route + Upper/Lower)</Select.Item>
                        <Select.Item value="single">Single Text (Full Line)</Select.Item>
                      </Select>
                    </div>

                    {/* Language selector */}
                    <div className="sm:col-span-3 flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-subtext-color">Language Code</span>
                      <Select
                        className="w-full"
                        variant="filled"
                        value={newSlideLanguage}
                        onValueChange={(val) => setNewSlideLanguage(val)}
                      >
                        {AVAILABLE_LANGUAGES.map((lang) => (
                          <Select.Item key={lang.code} value={lang.code}>
                            {lang.label} ({lang.code})
                          </Select.Item>
                        ))}
                      </Select>
                    </div>

                    {/* Simulation Type */}
                    <div className="sm:col-span-3 flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-subtext-color">Slide Purpose</span>
                      <Select
                        className="w-full"
                        variant="filled"
                        value={newSlideType}
                        onValueChange={(val: any) => setNewSlideType(val)}
                      >
                        <Select.Item value="route">Route & Destination</Select.Item>
                        <Select.Item value="slogan">Slogan Slide</Select.Item>
                        <Select.Item value="special message">Special Message</Select.Item>
                      </Select>
                    </div>

                    {/* Add button */}
                    <div className="sm:col-span-2">
                      <Button
                        variant="brand-primary"
                        className="w-full h-9 flex items-center justify-center font-medium"
                        icon={<FeatherPlus className="h-4 w-4" />}
                        onClick={handleAddSlide}
                      >
                        Add Slide
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Reorderable List of Placeholder Slides */}
                <div className="w-full rounded-2xl border border-neutral-border bg-neutral-0/40 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Planned Display Cycle ({currentBoardPlaceholders.length} Slides)
                      </span>
                    </div>
                    {currentBoardPlaceholders.length > 0 && (
                      <Button
                        variant="destructive-tertiary"
                        size="small"
                        icon={<FeatherTrash className="h-3.5 w-3.5" />}
                        onClick={() => setCurrentBoardPlaceholders(() => [])}
                      >
                        Clear Board Slides
                      </Button>
                    )}
                  </div>

                  {currentBoardPlaceholders.length === 0 ? (
                    <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-border bg-neutral-50/50 p-6 text-center">
                      <FeatherTv className="h-6 w-6 text-neutral-400 mb-1.5" />
                      <span className="text-caption font-medium text-subtext-color">
                        No slides added to {activeBoardTab.toUpperCase()} board yet
                      </span>
                      <span className="text-micro text-subtext-color">
                        Use the controls above to add Single, Two, or Three text slides with your chosen languages.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 w-full">
                      {currentBoardPlaceholders.map((slide, idx) => {
                        const isDragged = draggedSlideIndex === idx;
                        const isDragOver = dragOverSlideIndex === idx;

                        const isKn = slide.language === "kn";
                        const curRouteNum = !isSplitRoute
                          ? routeNumber.trim() || "ROUTE"
                          : routeNumber1.trim() || routeNumber.trim() || "ROUTE";

                        const srcName =
                          isKn && (selectedSourceStop as any)?.name_kn
                            ? (selectedSourceStop as any).name_kn
                            : selectedSourceStop?.name || "SOURCE";

                        const destName =
                          isKn && (selectedDestStop as any)?.name_kn
                            ? (selectedDestStop as any).name_kn
                            : selectedDestStop?.name || "DESTINATION";

                        const viaNames = viaStops
                          .map((v) => (isKn && (v as any).name_kn ? (v as any).name_kn : v.name))
                          .filter(Boolean);

                        const viaText = viaNames.join(" - ");

                        // Formats according to user rule:
                        // 1. Single text: Route-Number-Source-destinatiion-via's
                        const singleRouteText = [curRouteNum, srcName, destName, ...viaNames]
                          .filter(Boolean)
                          .join(" - ");

                        // 2. Two text: RouteNumber | source-destination-via's
                        const twoStopsText = [srcName, destName, ...viaNames]
                          .filter(Boolean)
                          .join(" - ");

                        // 3. Three text: Route Number | Source-destination (upperline)/ via's(lower line)
                        const threeUpperText = `${srcName} - ${destName}`;
                        const threeLowerText =
                          viaNames.length > 0 ? viaText : isKn ? "ನೇರ ಪ್ರಯಾಣ" : "Direct";

                        let singleDisplay = singleRouteText;
                        let twoDisplay = twoStopsText;
                        let threeUpperDisplay = threeUpperText;
                        let threeLowerDisplay = threeLowerText;

                        if (slide.type === "slogan") {
                          singleDisplay = "PLEASE WEAR SEAT BELT";
                          twoDisplay = "PLEASE WEAR SEAT BELT";
                          threeUpperDisplay = "WELCOME";
                          threeLowerDisplay = "PLEASE WEAR SEAT BELT";
                        } else if (slide.type === "special message") {
                          singleDisplay = "SPECIAL SERVICE";
                          twoDisplay = "SPECIAL SERVICE";
                          threeUpperDisplay = "SPECIAL";
                          threeLowerDisplay = "EXPRESS SERVICE";
                        }

                        return (
                          <div
                            key={slide.id}
                            draggable
                            onDragStart={() => handleSlideDragStart(idx)}
                            onDragOver={(e) => handleSlideDragOver(e, idx)}
                            onDrop={() => handleSlideDrop(idx)}
                            className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 px-5 rounded-xl border transition-all gap-4 w-full ${
                              isDragOver
                                ? "border-brand-primary bg-brand-50/70 scale-[1.005]"
                                : isDragged
                                ? "opacity-40 border-neutral-border bg-neutral-100"
                                : "border-neutral-border bg-sidebar-background hover:border-neutral-400/60"
                            }`}
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              {/* Drag Handle */}
                              <div className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-default-font p-1 flex-none">
                                <FeatherGripVertical className="h-4 w-4" />
                              </div>

                              {/* Sequence Badge */}
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-brand-primary font-mono text-xs font-bold border border-brand-500/20 flex-none">
                                #{idx + 1}
                              </div>

                              {/* Visual Layout Mockup Snippet */}
                              <div className="flex flex-col gap-2 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant={
                                      slide.format === "three"
                                        ? "brand"
                                        : slide.format === "two"
                                        ? "success"
                                        : "neutral"
                                    }
                                    className="text-xs font-semibold"
                                  >
                                    {slide.format.toUpperCase()} TEXT
                                  </Badge>

                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-neutral-100 border border-neutral-border text-default-font">
                                    <FeatherGlobe className="h-3 w-3 text-subtext-color" />
                                    {getLanguageLabel(slide.language)}
                                  </span>

                                  <span className="text-[11px] text-subtext-color italic">
                                    Type: {slide.type}
                                  </span>
                                </div>

                                {/* Mini layout diagram */}
                                <div className="w-full text-xs font-mono">
                                  {slide.format === "two" && (
                                    <div className="flex items-center gap-3 border border-neutral-border rounded-lg px-4 py-2 bg-neutral-50/80 w-full">
                                      <span className="font-bold text-default-font bg-neutral-200 px-2 py-0.5 rounded flex-none">
                                        {curRouteNum}
                                      </span>
                                      <span className="text-neutral-300 flex-none">|</span>
                                      <span className="truncate font-medium text-default-font flex-1" title={twoDisplay}>
                                        {twoDisplay}
                                      </span>
                                    </div>
                                  )}

                                  {slide.format === "three" && (
                                    <div className="flex items-center gap-3 border border-neutral-border rounded-lg px-4 py-2 bg-neutral-50/80 w-full">
                                      <span className="font-bold text-default-font bg-neutral-200 px-2 py-0.5 rounded flex-none">
                                        {curRouteNum}
                                      </span>
                                      <span className="text-neutral-300 flex-none">|</span>
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className="truncate font-semibold text-default-font" title={threeUpperDisplay}>
                                          {threeUpperDisplay}
                                        </span>
                                        <span className="truncate text-[11px] text-subtext-color" title={threeLowerDisplay}>
                                          {threeLowerDisplay}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {slide.format === "single" && (
                                    <div className="flex items-center gap-2 border border-neutral-border rounded-lg px-4 py-2 bg-neutral-50/80 w-full truncate">
                                      <span className="font-medium text-default-font truncate" title={singleDisplay}>
                                        {singleDisplay}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2 justify-end flex-none pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-border/50">
                              <IconButton
                                variant="neutral-tertiary"
                                size="small"
                                icon={<FeatherArrowUp className="h-4 w-4" />}
                                title="Move Slide Up"
                                disabled={idx === 0}
                                onClick={() => handleMoveSlideUp(idx)}
                              />
                              <IconButton
                                variant="neutral-tertiary"
                                size="small"
                                icon={<FeatherArrowDown className="h-4 w-4" />}
                                title="Move Slide Down"
                                disabled={idx === currentBoardPlaceholders.length - 1}
                                onClick={() => handleMoveSlideDown(idx)}
                              />
                              <IconButton
                                variant="neutral-tertiary"
                                size="small"
                                icon={<FeatherCopy className="h-4 w-4" />}
                                title="Duplicate Slide"
                                onClick={() => handleDuplicateSlide(idx)}
                              />
                              <IconButton
                                variant="destructive-tertiary"
                                size="small"
                                icon={<FeatherTrash className="h-4 w-4" />}
                                title="Remove Slide"
                                onClick={() => handleRemoveSlide(idx)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Prepopulate Notice */}
                <div className="flex items-start gap-3 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 text-default-font">
                  <FeatherLayers className="h-5 w-5 text-brand-primary flex-none mt-0.5" />
                  <span className="text-xs text-subtext-color leading-relaxed">
                    <strong>Pre-population active:</strong> These {frontPlaceholders.length} Front, {sidePlaceholders.length} Side, and {rearPlaceholders.length} Rear slide specifications will automatically pre-populate the V2 route editor simulations with your configured endpoints, route numbers, and language codes when saved.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex h-18 w-full flex-none items-center justify-between border-t border-neutral-border px-8 py-4 bg-neutral-0/50">
            {modalStep === 1 ? (
              <Button
                variant="neutral-secondary"
                onClick={() => setIsConfigModalOpen(false)}
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="neutral-secondary"
                onClick={() => setModalStep(1)}
              >
                ← Back to Route & Stops
              </Button>
            )}

            <div className="flex items-center gap-2">
              {modalStep === 1 ? (
                <Button
                  variant="brand-primary"
                  icon={<FeatherArrowRight className="h-4 w-4" />}
                  disabled={
                    !selectedSourceId ||
                    !selectedDestinationId ||
                    (!isSplitRoute ? !routeNumber.trim() : !routeNumber1.trim() || !routeNumber2.trim())
                  }
                  onClick={() => setModalStep(2)}
                >
                  Next: Signboard Displays (F / S / R)
                </Button>
              ) : (
                <Button
                  variant="brand-primary"
                  loading={isSavingRoute || isUpdatingRoute}
                  onClick={handleSaveRoute}
                >
                  {editingRoute ? "Update Route Configuration" : "Save Route Configuration"}
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog>

      {/* ============================================================== */}
      {/* DELETE ROUTE CONFIRMATION DIALOG */}
      {/* ============================================================== */}
      <Dialog open={!!deleteConfirmRoute} onOpenChange={(o) => !o && setDeleteConfirmRoute(null)}>
        <Dialog.Content className="w-full max-w-md p-6 bg-sidebar-background rounded-2xl shadow-xl border border-neutral-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 flex-none">
              <FeatherTrash className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-heading-3 font-heading-3 text-default-font">
                Delete Route Configuration?
              </h3>
              <p className="text-caption text-subtext-color">
                Are you sure you want to delete route <strong>{deleteConfirmRoute?.route_number}</strong>? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="neutral-secondary" onClick={() => setDeleteConfirmRoute(null)}>
              Cancel
            </Button>
            <Button variant="destructive-primary" onClick={handleDeleteRoute}>
              Delete Route
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
