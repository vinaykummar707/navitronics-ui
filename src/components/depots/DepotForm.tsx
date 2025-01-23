import { useState, useEffect } from 'react';
import { Depot, CreateDepotDto } from '../../types/depot';
import { Area } from '../../types/area';
import { useQuery } from '@tanstack/react-query';
import { areaService } from '../../services/areaService';
import { useOrganizationStore } from '../../store/useOrganizationStore';

interface DepotFormProps {
  initialData?: Depot;
  onSubmit: (data: CreateDepotDto) => void;
  onCancel: () => void;
}

export const DepotForm = ({ initialData, onSubmit, onCancel }: DepotFormProps) => {
  const { selectedOrganization } = useOrganizationStore();
  const [formData, setFormData] = useState<CreateDepotDto>({
    depotName: initialData?.depotName || '',
    areaId: initialData?.areaId || '',
    organizationId: selectedOrganization?.organizationId || '',
  });

  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  useEffect(() => {
    if (selectedOrganization) {
      setFormData(prev => ({
        ...prev,
        organizationId: selectedOrganization.organizationId,
      }));
    }
  }, [selectedOrganization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!selectedOrganization) {
    return (
      <div className="text-center text-gray-500">
        Please select an organization from the navbar first
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="areaId" className="block text-sm font-medium text-gray-700">
          Area *
        </label>
        <select
          id="areaId"
          value={formData.areaId}
          onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select Area</option>
          {areas?.map((area: Area) => (
            <option key={area.areaId} value={area.areaId}>
              {area.areaName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="depotName" className="block text-sm font-medium text-gray-700">
          Depot Name *
        </label>
        <input
          type="text"
          id="depotName"
          value={formData.depotName}
          onChange={(e) => setFormData({ ...formData, depotName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
