import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../../services/organizationService';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import useAuthStore from '@/store/authStore';
import { useEffect } from 'react';

export const OrganizationSelector = () => {
  const { selectedOrganization, setSelectedOrganization } = useOrganizationStore();
  const user = useAuthStore((state) => state.user); // Get user details
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.getAll,
  });

  // Filter organizations based on user's assigned organization
  const filteredOrganizations = user?.organization ? organizations?.filter(org => org.organizationId === user.organization.organizationId) : organizations;

  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrganization) {
      setSelectedOrganization(organizations[0]); // Set the first organization as selected
    }
  }, [organizations, selectedOrganization, setSelectedOrganization]);

  return (
    <div className="flex flex-col gap-1">
      {/* <label className='text-xs text-neutral-500'>
        Select Organization
      </label> */}
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
        {user.userRole === 'master' ? organizations?.map((org) => (
          <option key={org.organizationId} value={org.organizationId}>
            {org.organizationName}
          </option>
        )) : filteredOrganizations?.map((org) => (
          <option key={org.organizationId} value={org.organizationId}>
            {org.organizationName}
          </option>
        ))}
      </select>
    </div>
  );
};
