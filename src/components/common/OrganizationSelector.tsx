import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../../services/organizationService';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import useAuthStore from '@/store/authStore';
import { useEffect, useMemo } from 'react';
import { createListCollection } from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export const OrganizationSelector = () => {
  const { selectedOrganization, setSelectedOrganization } = useOrganizationStore();
  const user = useAuthStore((state) => state.user);
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.getAll,
  });

  const filteredOrganizations = user?.organization
    ? organizations?.filter((org) => org.organizationId === user.organization.organizationId)
    : organizations;

  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrganization) {
      setSelectedOrganization(organizations[0]);
    }
  }, [organizations, selectedOrganization, setSelectedOrganization]);

  const displayOrgs = user?.userRole === 'master' ? organizations : filteredOrganizations;

  const collection = useMemo(() => {
    return createListCollection({
      items: displayOrgs
        ? displayOrgs.map((org) => ({
            label: org.organizationName,
            value: org.organizationId,
          }))
        : [],
    });
  }, [displayOrgs]);

  return (
    <SelectRoot
      collection={collection}
      size="sm"
      value={selectedOrganization?.organizationId ? [selectedOrganization.organizationId] : []}
      onValueChange={(e) => {
        const val = e.value[0];
        const selected = organizations?.find((org) => org.organizationId === val);
        setSelectedOrganization(selected || null);
      }}
    >
      <SelectTrigger bg="white">
        <SelectValueText placeholder="Select Organization" />
      </SelectTrigger>
      <SelectContent>
        {collection.items.map((item) => (
          <SelectItem item={item} key={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
