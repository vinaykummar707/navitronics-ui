import { useState } from 'react';
import { Depot, CreateDepotDto } from '../../types/depot';
import { Button, Input, VStack, HStack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';

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
    active: initialData?.active,
    deleted: initialData?.deleted
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      areaId: selectedAreaId,
      organizationId: selectedOrganizationId,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap="4" align="stretch">
        <Field label="Depot Name" required>
          <Input
            type="text"
            id="depotName"
            value={formData.depotName}
            onChange={(e) => setFormData({ ...formData, depotName: e.target.value })}
            placeholder="e.g. Hosur Central Depot"
            required
          />
        </Field>

        <HStack justify="flex-end" gap="3" pt="2">
          <Button variant="outline" size="sm" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button colorPalette="blue" size="sm" type="submit">
            {initialData ? 'Update Depot' : 'Create Depot'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
