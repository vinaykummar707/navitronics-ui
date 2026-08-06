import { useState } from 'react';
import { Area, CreateAreaDto } from '../../types/area';
import { Button, Input, VStack, HStack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';

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
    <form onSubmit={handleSubmit}>
      <VStack gap="4" align="stretch">
        <Field label="Area Name" required>
          <Input
            type="text"
            id="areaName"
            value={formData.areaName}
            onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
            placeholder="e.g. North Zone / Hosur Central"
            required
          />
        </Field>

        <HStack justify="flex-end" gap="3" pt="2">
          <Button variant="outline" size="sm" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button colorPalette="blue" size="sm" type="submit">
            {initialData ? 'Update Area' : 'Create Area'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
