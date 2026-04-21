import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteUser, listUsers } from '../../api/auth.api';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/common/Button';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';

export function UsersManagementPage() {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => listUsers(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('User deleted.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return (
    <AppShell eyebrow="Admin analytics" title="User directory">
      {usersQuery.isLoading ? (
        <Spinner />
      ) : (
        <Panel className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-ink/45">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data?.map((user) => (
                <tr key={user.id} className="border-b border-ink/5 last:border-b-0">
                  <td className="px-4 py-4 font-semibold">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4">{user.role}</td>
                  <td className="px-4 py-4">
                    <Button variant="danger" onClick={() => deleteMutation.mutate(user.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </AppShell>
  );
}
