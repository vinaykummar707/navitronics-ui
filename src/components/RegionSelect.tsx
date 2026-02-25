import { IRegion } from "@/types/IRegion";
import { Select } from "@/ui/components/Select";

interface RegionSelectProps {
  regions: IRegion[];
  selectedRegionId: string;
  onValueChange: (val: string) => void;
}

export function RegionSelect({ regions, selectedRegionId, onValueChange }: RegionSelectProps) {
  return (
    <Select
      className="h-auto flex-none"
      variant="outline"
      label="Select Region"
      placeholder="Select Region"
      value={selectedRegionId}
      onValueChange={onValueChange}
    >
      {regions.map((region) => (
        <Select.Item key={region.id} value={region.id}>
          {region.name}
        </Select.Item>
      ))}
    </Select>
  );
}