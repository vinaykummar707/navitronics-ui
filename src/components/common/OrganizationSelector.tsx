import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../../services/organizationService';
import { useOrganizationStore } from '../../store/useOrganizationStore';

export const OrganizationSelector = () => {
  const { selectedOrganization, setSelectedOrganization } = useOrganizationStore();

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.getAll,
  });

  return (
    <div className="relative">
      <select
        value={selectedOrganization?.organizationId || ''}
        onChange={(e) => {
          const selected = organizations?.find(
            (org) => org.organizationId === e.target.value
          );
          setSelectedOrganization(selected || null);
        }}
        className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
      >
        <option value="">Select Organization</option>
        {organizations?.map((org) => (
          <option key={org.organizationId} value={org.organizationId}>
            {org.organizationName}
          </option>
        ))}
      </select>
    </div>
  );
};
