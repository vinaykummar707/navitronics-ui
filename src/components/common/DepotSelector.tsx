import { useQuery } from '@tanstack/react-query';
import { depotService } from '../../services/depotService';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import useAuthStore from '@/store/authStore';

export const DepotSelector = () => {
  const { selectedOrganization } = useOrganizationStore();
  const user = useAuthStore((state) => state.user);

  const { data: depots } = useQuery({
    queryKey: ['depots', selectedOrganization?.organizationId],
    queryFn: () => depotService.getAll(selectedOrganization?.organizationId),
    enabled: !!selectedOrganization,
  });

  const filteredDepots = user.depot ? depots?.filter(depot => depot.depotId === user.depot.depotId) : depots;

  return (
    <div className="mb-4 flex flex-col items-start justify-start">
      <label htmlFor="depot" className="block text-sm font-medium text-stone-700">
        Select Depot
      </label>
      <select
        id="depot"
        className="border text-sm border-neutral-300 text-neutral-900 p-2 rounded-lg"
      >
        <option value="">Select Depot</option>
        {filteredDepots?.map((depot) => (
          <option key={depot.depotId} value={depot.depotId}>
            {depot.depotName}
          </option>
        ))}
      </select>
    </div>
  );
};
