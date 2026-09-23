import { useEffect } from "react";
import { useDepotStore } from "@/store/useDepotStore";
import { IDepot,depotCrud } from "@/types/IDepot";

export function useDepots(regionId?: string) {
  const selectedDepot = useDepotStore((state) => state.selectedDepot);
  const { setSelectedDepot } = useDepotStore();

  const { useList } = depotCrud;
  const {
    data: depotData,
    refetch: refetchDepots
  } = useList({
    filters: { region_id: regionId || "" },
    orderBy: { column: "created_at", ascending: true },
    skip: !regionId
  });

  const depots = depotData?.data;

  useEffect(() => {
    if (depots?.length > 0 && !selectedDepot) {
      setSelectedDepot(depots[0]);
    }
    if (depots && depots.length === 0) {
      setSelectedDepot(null);
    }
  }, [depots, selectedDepot, setSelectedDepot]);

  return { depots, selectedDepot, setSelectedDepot, refetchDepots };
}