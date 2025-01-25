import { useState } from 'react';
import { CreateOrganizationDto, Organization } from '../../types/organization';

interface OrganizationFormProps {
  initialData?: Organization;
  onSubmit: (data: CreateOrganizationDto) => void;
  onCancel: () => void;
}

export const OrganizationForm = ({ initialData, onSubmit, onCancel }: OrganizationFormProps) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="organizationName" className="block text-sm font-medium text-stone-700">
          Organization Name *
        </label>
        <input
          type="text"
          id="organizationName"
          value={formData.organizationName}
          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
          required
        />
      </div>

      <div>
        <label htmlFor="emailId" className="block text-sm font-medium text-stone-700">
          Email *
        </label>
        <input
          type="email"
          id="emailId"
          value={formData.emailId}
          onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
        className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
          required
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-stone-700">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
         className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg w-full mt-2"
          required
        />
      </div>

      <div>
        <label htmlFor="contactPerson" className="block text-sm font-medium text-stone-700">
          Contact Person *
        </label>
        <input
          type="text"
          id="contactPerson"
          value={formData.contactPerson}
          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
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
