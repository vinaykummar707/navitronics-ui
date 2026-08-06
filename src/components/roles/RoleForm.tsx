import { useState } from 'react';
import { Role, CreateRoleDto } from '../../types/role';
import { Button, Input, VStack, HStack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';

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
    <form onSubmit={handleSubmit}>
      <VStack gap="4" align="stretch">
        <Field label="Role Name" required>
          <Input
            type="text"
            id="roleName"
            value={formData.roleName}
            onChange={(e) => setFormData({ roleName: e.target.value })}
            placeholder="e.g. Area Admin"
            required
          />
        </Field>

        <HStack justify="flex-end" gap="3" pt="2">
          <Button variant="outline" size="sm" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button colorPalette="blue" size="sm" type="submit">
            {initialData ? 'Update Role' : 'Create Role'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
