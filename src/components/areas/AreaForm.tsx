
import { useState } from 'react';
import { Area, CreateAreaDto } from '../../types/area';

interface AreaFormProps {
  initialData?: Area;
  onSubmit: (data: CreateAreaDto) => void;
  onCancel: () => void;
}

export const AreaForm = ({ initialData, onSubmit, onCancel }: AreaFormProps) => {
  const [formData, setFormData] = useState<CreateAreaDto>({
    areaName: initialData?.areaName || '',
    organizationId: initialData?.organizationId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="areaName" className="block text-sm font-medium text-stone-700">
          Area Name *
        </label>
        <input
          type="text"
          id="areaName"
          value={formData.areaName}
          onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
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
