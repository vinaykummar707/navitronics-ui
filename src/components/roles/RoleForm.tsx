import { useState } from 'react';
import { Role, CreateRoleDto } from '../../types/role';

interface RoleFormProps {
  initialData?: Role;
  onSubmit: (data: CreateRoleDto) => void;
  onCancel: () => void;
}

export const RoleForm = ({ initialData, onSubmit, onCancel }: RoleFormProps) => {
  const [formData, setFormData] = useState<CreateRoleDto>({
    roleName: initialData?.roleName || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="roleName" className="block text-sm font-medium text-stone-700">
          Role Name *
        </label>
        <input
          type="text"
          id="roleName"
          value={formData.roleName}
          onChange={(e) => setFormData({ roleName: e.target.value })}
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
