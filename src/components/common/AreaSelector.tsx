import { useQuery } from '@tanstack/react-query';
import { areaService } from '../../services/areaService';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useAreaStore } from '../../store/useAreaStore';
import useAuthStore from '@/store/authStore';

export const AreaSelector = () => {
  const { selectedOrganization } = useOrganizationStore();
  const { selectedArea, setSelectedArea } = useAreaStore();

  const user = useAuthStore((state) => state.user);

  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const filteredAreas = user.area && user.userRole === 'area_admin' ? areas?.filter(area => area.areaId === user.area.areaId) : areas;


  return (
     <div className="mb-4 flex flex-col items-start justify-start">
        <label htmlFor="area" className="block text-sm font-medium text-stone-700">
          Select Area
        </label>
       <select
      value={selectedArea?.areaId || ''}
      onChange={(e) => {
        const selectedAreaId = e.target.value;
        const area = areas?.find((a) => a.areaId === selectedAreaId) || null;
        setSelectedArea(area);
      }}
      className="border text-sm border-neutral-300 text-neutral-900 p-2 rounded-lg "
      disabled={!selectedOrganization}
    >
      <option value="">Select Area</option>
      {filteredAreas?.map((area) => (
        <option key={area.areaId} value={area.areaId}>
          {area.areaName}
        </option>
      ))}
    </select>
      </div> 
    
  );
};
