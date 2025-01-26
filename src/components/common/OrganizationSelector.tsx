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
    <div className="">
      <select
    
        value={selectedOrganization?.organizationId || ''}
        onChange={(e) => {
          const selected = organizations?.find(
            (org) => org.organizationId === e.target.value
          );
          setSelectedOrganization(selected || null);
        }}
        className=" border text-sm border-neutral-300 text-neutral-900 p-2 rounded-lg"
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
