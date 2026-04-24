import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteUser, listUsers } from '../../api/auth.api';
import { Button } from '../../components/common/Button';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';
import { AppShell } from '../../components/layout/AppShell';
import { useAuth } from '../../hooks/useAuth';

export function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => listUsers(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Utilisateur supprime.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error('Impossible de supprimer cet utilisateur.');
    },
  });

  return (
    <AppShell eyebrow="Analytique admin" title="Annuaire des utilisateurs">
      {usersQuery.isLoading ? (
        <Spinner />
      ) : (
        <Panel className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-ink/45">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data?.map((user) => {
                const isCurrentAdmin = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className="border-b border-ink/5 last:border-b-0">
                    <td className="px-4 py-4 font-semibold">
                      {user.firstName} {user.lastName}
                      {isCurrentAdmin ? ' (Vous)' : ''}
                    </td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">{user.role}</td>
                    <td className="px-4 py-4">
                      <Button
                        variant="danger"
                        disabled={isCurrentAdmin}
                        onClick={() => deleteMutation.mutate(user.id)}
                      >
                        {isCurrentAdmin ? 'Votre compte' : 'Supprimer'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </AppShell>
  );
}
