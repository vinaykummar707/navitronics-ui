import { useEffect } from "react";
import { useRegionStore } from "@/store/useRegionStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { regionCrud, IRegion } from "@/types/IRegion";

export function useRegions() {
  const { selectedOrganization } = useOrganizationStore();
  const selectedRegion = useRegionStore((state) => state.selectedRegion);
  const { setSelectedRegion } = useRegionStore();

  const { useList } = regionCrud;
  const { data, refetch } = useList({
    filters: {
      organization_id: selectedOrganization?.id || "",
    },
    orderBy: { column: "created_at", ascending: true },
  });

  const regions = data?.data;

  useEffect(() => {
    if (regions?.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0]);
    }
  }, [regions, selectedRegion, setSelectedRegion]);

  useEffect(() => {
    refetch();
  }, [selectedOrganization, refetch]);

  return { regions, refetchRegions: refetch, selectedRegion, setSelectedRegion };
}