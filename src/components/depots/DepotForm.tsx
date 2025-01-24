import { useState } from 'react';
import { Depot, CreateDepotDto } from '../../types/depot';

interface DepotFormProps {
  initialData?: Depot;
  selectedAreaId: string;
  selectedOrganizationId: string;
  onSubmit: (data: CreateDepotDto) => void;
  onCancel: () => void;
}

export const DepotForm = ({ initialData, selectedAreaId, selectedOrganizationId, onSubmit, onCancel }: DepotFormProps) => {
  const [formData, setFormData] = useState<CreateDepotDto>({
    depotName: initialData?.depotName || '',
    areaId: selectedAreaId,
    organizationId: selectedOrganizationId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="depotName" className="block text-sm font-medium text-stone-700">
          Depot Name *
        </label>
        <input
          type="text"
          id="depotName"
          value={formData.depotName}
          onChange={(e) => setFormData({ ...formData, depotName: e.target.value })}
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

     

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
