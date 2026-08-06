import { useState } from 'react';
import { CreateOrganizationDto, Organization } from '../../types/organization';
import { Button, Input, VStack, HStack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';

interface OrganizationFormProps {
	initialData?: Organization;
	onSubmit: (data: CreateOrganizationDto) => void;
	onCancel: () => void;
}

export const OrganizationForm = ({
	initialData,
	onSubmit,
	onCancel,
}: OrganizationFormProps) => {
	const [formData, setFormData] = useState<CreateOrganizationDto>({
		organizationName: initialData?.organizationName || '',
		emailId: initialData?.emailId || '',
		phoneNumber: initialData?.phoneNumber || '',
		contactPerson: initialData?.contactPerson || '',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit}>
			<VStack gap="4" align="stretch">
				<Field label="Organization Name" required>
					<Input
						type="text"
						id="organizationName"
						value={formData.organizationName}
						onChange={(e) =>
							setFormData({ ...formData, organizationName: e.target.value })
						}
						placeholder="e.g. Navitronix Transport"
						required
					/>
				</Field>

				<Field label="Email Address" required>
					<Input
						type="email"
						id="emailId"
						value={formData.emailId}
						onChange={(e) =>
							setFormData({ ...formData, emailId: e.target.value })
						}
						placeholder="e.g. admin@navitronix.com"
						required
					/>
				</Field>

				<Field label="Phone Number" required>
					<Input
						type="tel"
						id="phoneNumber"
						value={formData.phoneNumber}
						onChange={(e) =>
							setFormData({ ...formData, phoneNumber: e.target.value })
						}
						placeholder="e.g. +91 9876543210"
						required
					/>
				</Field>

				<Field label="Contact Person" required>
					<Input
						type="text"
						id="contactPerson"
						value={formData.contactPerson}
						onChange={(e) =>
							setFormData({ ...formData, contactPerson: e.target.value })
						}
						placeholder="e.g. John Doe"
						required
					/>
				</Field>

				<HStack justify="flex-end" gap="3" pt="2">
					<Button variant="outline" size="sm" onClick={onCancel} type="button">
						Cancel
					</Button>
					<Button colorPalette="blue" size="sm" type="submit">
						{initialData ? 'Update Organization' : 'Create Organization'}
					</Button>
				</HStack>
			</VStack>
		</form>
	);
};
