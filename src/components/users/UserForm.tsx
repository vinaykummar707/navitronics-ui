import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../services/roleService';
import { areaService } from '../../services/areaService';
import { depotService } from '../../services/depotService';
import { User, CreateUserDto } from '../../types/user';
import { Button, Input, VStack, HStack, createListCollection } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

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

  useEffect(() => {
    if (selectedAreaId !== formData.areaId) {
      setFormData((prev) => ({ ...prev, depotId: '' }));
    }
  }, [selectedAreaId]);

  const roleCollection = useMemo(() => {
    return createListCollection({
      items: roles
        ? roles.map((role) => ({
            label: role.roleName,
            value: role.id,
          }))
        : [],
    });
  }, [roles]);

  const areaCollection = useMemo(() => {
    return createListCollection({
      items: areas
        ? areas.map((area) => ({
            label: area.areaName,
            value: area.areaId,
          }))
        : [],
    });
  }, [areas]);

  const depotCollection = useMemo(() => {
    return createListCollection({
      items: depots
        ? depots.map((depot: any) => ({
            label: depot.depotName || depot.name || '',
            value: String(depot.depotId || depot.id || ''),
          }))
        : [],
    });
  }, [depots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const findRoleNamebyId = (roleId: string) => {
    const role = roles?.find((r) => r.id === roleId);
    return role?.roleName || '';
  };

  const currentRoleName = findRoleNamebyId(formData.roleId);

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap="4" align="stretch">
        <Field label="Name" required>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </Field>

        <Field label="Username" required>
          <Input
            type="text"
            id="userName"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            placeholder="johndoe"
            required
          />
        </Field>

        {!initialData && (
          <Field label="Password" required>
            <Input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required={!initialData}
            />
          </Field>
        )}

        <Field label="Role" required>
          <SelectRoot
            collection={roleCollection}
            size="sm"
            value={formData.roleId ? [formData.roleId] : []}
            onValueChange={(e) => setFormData({ ...formData, roleId: e.value[0] || '' })}
          >
            <SelectTrigger bg="white">
              <SelectValueText placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {roleCollection.items.map((item) => (
                <SelectItem item={item} key={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Field>

        {(currentRoleName === 'area_admin' || currentRoleName === 'depot_admin') && (
          <Field label="Area" required>
            <SelectRoot
              collection={areaCollection}
              size="sm"
              value={formData.areaId ? [formData.areaId] : []}
              onValueChange={(e) => {
                const val = e.value[0] || '';
                setSelectedAreaId(val);
                setFormData({ ...formData, areaId: val });
              }}
            >
              <SelectTrigger bg="white">
                <SelectValueText placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {areaCollection.items.map((item) => (
                  <SelectItem item={item} key={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>
        )}

        {currentRoleName === 'depot_admin' && (
          <Field label="Depot" required>
            <SelectRoot
              collection={depotCollection}
              size="sm"
              disabled={!formData.areaId}
              value={formData.depotId ? [formData.depotId] : []}
              onValueChange={(e) => setFormData({ ...formData, depotId: e.value[0] || '' })}
            >
              <SelectTrigger bg="white">
                <SelectValueText placeholder="Select Depot" />
              </SelectTrigger>
              <SelectContent>
                {depotCollection.items.map((item) => (
                  <SelectItem item={item} key={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>
        )}

        <HStack justify="flex-end" gap="3" pt="2">
          <Button variant="outline" size="sm" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button colorPalette="blue" size="sm" type="submit">
            {initialData ? 'Update User' : 'Create User'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
