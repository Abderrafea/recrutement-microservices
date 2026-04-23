import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { changePassword, deleteUser, getCurrentUser, updateProfile } from '../../api/auth.api';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Panel } from '../../components/common/Panel';
import { TextArea } from '../../components/common/TextArea';
import { useAuth } from '../../hooks/useAuth';

export function CandidateProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
  });
  const candidateProfile =
    profileQuery.data?.profile && 'skills' in profileQuery.data.profile ? profileQuery.data.profile : undefined;
  const form = useForm({
    values: {
      firstName: profileQuery.data?.firstName ?? '',
      lastName: profileQuery.data?.lastName ?? '',
      phone: candidateProfile?.phone ?? '',
      address: candidateProfile?.address ?? '',
      summary: candidateProfile?.summary ?? '',
      skills: candidateProfile?.skills?.join(', ') ?? '',
    },
  });
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, string>) =>
      updateProfile(user!.id, {
        ...values,
        skills: values.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      toast.success('Profil mis a jour.');
    },
    onError: () => toast.error('Impossible de mettre a jour le profil.'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: { currentPassword: string; newPassword: string }) => changePassword(user!.id, values),
    onSuccess: () => {
      passwordForm.reset();
      toast.success('Mot de passe mis a jour.');
    },
    onError: () => toast.error('Impossible de changer le mot de passe.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(user!.id),
    onSuccess: () => {
      queryClient.clear();
      logout();
      toast.success('Compte supprime.');
      navigate('/', { replace: true });
    },
    onError: () => toast.error('Impossible de supprimer le compte.'),
  });

  return (
    <AppShell eyebrow="Centre de commande candidat" title="Personnalisez votre profil candidat">
      <Panel>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}>
          <Input label="Prenom" {...form.register('firstName')} />
          <Input label="Nom" {...form.register('lastName')} />
          <Input label="Telephone" {...form.register('phone')} />
          <Input label="Adresse" {...form.register('address')} />
          <div className="md:col-span-2">
            <Input label="Competences" placeholder="Java, Spring Boot, React" {...form.register('skills')} />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Resume" {...form.register('summary')} />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={updateMutation.isPending}>Enregistrer le profil</Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={passwordForm.handleSubmit((values) => {
            if (values.newPassword !== values.confirmPassword) {
              passwordForm.setError('confirmPassword', { message: 'La confirmation ne correspond pas.' });
              return;
            }

            changePasswordMutation.mutate({
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            });
          })}
        >
          <Input
            type="password"
            label="Mot de passe actuel"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword', { required: 'Champ requis.' })}
          />
          <div />
          <Input
            type="password"
            label="Nouveau mot de passe"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword', {
              required: 'Champ requis.',
              minLength: { value: 8, message: '8 caracteres minimum.' },
            })}
          />
          <Input
            type="password"
            label="Confirmation du nouveau mot de passe"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword', { required: 'Champ requis.' })}
          />
          <div className="md:col-span-2">
            <Button type="submit" disabled={changePasswordMutation.isPending}>Modifier le mot de passe</Button>
          </div>
        </form>
      </Panel>

      <Panel className="border-rose-200">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-rose-700">Zone danger</h3>
          <p className="text-sm text-ink/65">Cette action supprimera votre compte et vous deconnectera immediatement.</p>
          <Button
            type="button"
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment supprimer votre compte ?')) {
                deleteMutation.mutate();
              }
            }}
          >
            {deleteMutation.isPending ? 'Suppression...' : 'Supprimer mon compte'}
          </Button>
        </div>
      </Panel>
    </AppShell>
  );
}
