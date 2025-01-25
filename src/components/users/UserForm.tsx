import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../services/roleService';
import { areaService } from '../../services/areaService';
import { depotService } from '../../services/depotService';
import { User, CreateUserDto } from '../../types/user';

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: CreateUserDto) => void;
  onCancel: () => void;
  selectedOrganizationId: string;
}

export const UserForm = ({ initialData, onSubmit, onCancel, selectedOrganizationId }: UserFormProps) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    name: initialData?.name || '',
    userName: initialData?.userName || '',
    password: '',
    roleId: initialData?.roleId || '',
    organizationId: selectedOrganizationId,
    areaId: initialData?.areaId || '',
    depotId: initialData?.depotId || '',
  });

  const [selectedAreaId, setSelectedAreaId] = useState<string>(initialData?.areaId || '');

  // Fetch roles, areas, and depots
  const { data: roles } = useQuery({
    queryKey: ['roles', selectedOrganizationId],
    queryFn: () => roleService.getAll(selectedOrganizationId),
    enabled: !!selectedOrganizationId,
  });

  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganizationId],
    queryFn: () => areaService.getAll(selectedOrganizationId),
    enabled: !!selectedOrganizationId,
  });

  const { data: depots } = useQuery({
    queryKey: ['depots', selectedAreaId],
    queryFn: () => depotService.getAll(selectedAreaId),
    enabled: !!selectedAreaId,
  });

  // Reset depot when area changes
  useEffect(() => {
    if (selectedAreaId !== formData.areaId) {
      setFormData(prev => ({ ...prev, depotId: '' }));
    }
  }, [selectedAreaId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[400px]">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
          required
        />
      </div>

      <div>
        <label htmlFor="userName" className="block text-sm font-medium text-stone-700">
          Username
        </label>
        <input
          type="text"
          id="userName"
          value={formData.userName}
          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
        className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
          required
        />
      </div>

      {!initialData && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
            required={!initialData}
          />
        </div>
      )}

      <div>
        <label htmlFor="roleId" className="block text-sm font-medium text-stone-700">
          Role
        </label>
        <select
          id="roleId"
          value={formData.roleId}
          onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
        className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
          required
        >
          <option value="">Select Role</option>
          {roles?.map((role) => (
            <option key={role.roleId} value={role.roleId}>
              {role.roleName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="areaId" className="block text-sm font-medium text-stone-700">
          Area
        </label>
        <select
          id="areaId"
          value={formData.areaId}
          onChange={(e) => {
            setSelectedAreaId(e.target.value);
            setFormData({ ...formData, areaId: e.target.value });
          }}
        className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
          required
        >
          <option value="">Select Area</option>
          {areas?.map((area) => (
            <option key={area.areaId} value={area.areaId}>
              {area.areaName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="depotId" className="block text-sm font-medium text-stone-700">
          Depot
        </label>
        <select
          id="depotId"
          value={formData.depotId}
          onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
        className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
          required
          disabled={!formData.areaId}
        >
          <option value="">Select Depot</option>
          {depots?.map((depot) => (
            <option key={depot.depotId} value={depot.depotId}>
              {depot.depotName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
