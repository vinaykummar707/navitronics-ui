import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/roleService';
import { Role } from '../types/role';
import { RoleForm } from '../components/roles/RoleForm';
import { Dialog } from '@headlessui/react';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Icon } from '@iconify-icon/react';
import { Container } from '@chakra-ui/react';
import { toast } from 'react-toastify';

const Roles = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? roleService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsCreateModalOpen(false);
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create role');
    }
  });

  const updateMutation = useMutation({
    mutationFn: roleService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update role');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete role');
    }
  });

  if (!selectedOrganization) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-stone-500">Please select an organization first</div>
      </div>
    );
  }

  return (
		<Container overflow={'hidden'} fluid className="py-2 sm:py-4 w-full max-w-full">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
				<div>
					<h1 className="text-xl font-bold text-default-font">Roles</h1>
					<span className="text-caption font-caption text-subtext-color">Manage user access levels and permissions</span>
				</div>
				<button
					onClick={() => setIsCreateModalOpen(true)}
					className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 w-full sm:w-auto font-medium transition-colors"
				>
					Create Role
				</button>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center h-48">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-800" />
				</div>
			) : (
				<div className="bg-white rounded-lg shadow overflow-x-auto touch-scroll-x w-full">
					<table className="min-w-full divide-y divide-stone-200">
						<thead className="bg-stone-50">
							<tr>
								<th
									scope="col"
									className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
								>
									Role Name
								</th>

								<th
									scope="col"
									className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
								>
									Status
								</th>
								<th
									scope="col"
									className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-stone-200">
							{roles && roles.length > 0 ? (
								roles.map((role) => (
									<tr key={role.id} className="hover:bg-stone-50">
										<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-stone-900">
												{role.roleName}
											</div>
										</td>

										<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
													role.active
														? 'bg-green-100 text-green-800'
														: 'bg-red-100 text-red-800'
												}`}
											>
												{role.active ? 'Active' : 'Inactive'}
											</span>
										</td>
										<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<button
												onClick={() => setEditingRole(role)}
												className="text-indigo-600 hover:text-indigo-900 mr-4"
											>
												<Icon icon="solar:pen-bold" className="inline-block" />
											</button>
											<button
												onClick={() => {
													if (
														confirm(
															'Are you sure you want to delete this role?'
														)
													) {
														deleteMutation.mutate(role.id);
													}
												}}
												className="text-red-600 hover:text-red-900"
											>
												<Icon
													icon="solar:trash-bin-trash-bold"
													className="inline-block"
												/>
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={6}
										className="px-6 py-4 text-center text-stone-500"
									>
										No roles found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{/* Create Modal */}
			<Dialog
				open={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				className="relative z-50"
			>
				<div className="fixed inset-0 bg-black/50 backdrop-blur-xs" aria-hidden="true" />
				<div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
					<Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-5 sm:p-6 shadow-2xl">
						<Dialog.Title className="text-lg font-medium mb-4 text-stone-900">
							Create Role
						</Dialog.Title>
						<RoleForm
							onSubmit={(data) => createMutation.mutate(data)}
							onCancel={() => setIsCreateModalOpen(false)}
						/>
					</Dialog.Panel>
				</div>
			</Dialog>

			{/* Edit Modal */}
			<Dialog
				open={!!editingRole}
				onClose={() => setEditingRole(null)}
				className="relative z-50"
			>
				<div className="fixed inset-0 bg-black/50 backdrop-blur-xs" aria-hidden="true" />
				<div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
					<Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-5 sm:p-6 shadow-2xl">
						<Dialog.Title className="text-lg font-medium mb-4 text-stone-900">
							Edit Role
						</Dialog.Title>
						{editingRole && (
							<RoleForm
								initialData={editingRole}
								onSubmit={(data) => updateMutation.mutate({ id: editingRole.id, data })}
								onCancel={() => setEditingRole(null)}
							/>
						)}
					</Dialog.Panel>
				</div>
			</Dialog>
		</Container>
	);
};

export default Roles;
