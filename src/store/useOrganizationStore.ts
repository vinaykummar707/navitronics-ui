import { Organization } from '@/api/organization/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrganizationState {
  selectedOrganization: Organization | null;
  setSelectedOrganization: (organization: Organization | null) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      selectedOrganization: null,
      setSelectedOrganization: (organization) => set({ selectedOrganization: organization }),
    }),
    {
      name: 'organization-storage',
    }
  )
);
