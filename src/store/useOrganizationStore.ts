import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Organization } from '../types/organization';

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
