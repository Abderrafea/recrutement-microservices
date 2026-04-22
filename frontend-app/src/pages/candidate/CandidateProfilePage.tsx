import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Panel } from '../../components/common/Panel';
import { TextArea } from '../../components/common/TextArea';
import { getCurrentUser, updateProfile, uploadCv } from '../../api/auth.api';
import { useAuth } from '../../hooks/useAuth';

export function CandidateProfilePage() {
  const { user } = useAuth();
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

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, string>) =>
      updateProfile(user!.id, {
        ...values,
        skills: values.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      }),
    onSuccess: () => toast.success('Profil mis à jour.'),
    onError: () => toast.error('Impossible de mettre à jour le profil.'),
  });

  const cvMutation = useMutation({
    mutationFn: (file: File) => uploadCv(user!.id, file),
    onSuccess: () => toast.success('CV téléversé.'),
    onError: () => toast.error('Impossible de téléverser le CV.'),
  });

  return (
    <AppShell eyebrow="Centre de commande candidat" title="Personnalisez votre profil candidat">
      <Panel>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}>
          <Input label="Prénom" {...form.register('firstName')} />
          <Input label="Nom" {...form.register('lastName')} />
          <Input label="Téléphone" {...form.register('phone')} />
          <Input label="Adresse" {...form.register('address')} />
          <div className="md:col-span-2">
            <Input label="Compétences" placeholder="Java, Spring Boot, React" {...form.register('skills')} />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Résumé" {...form.register('summary')} />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={updateMutation.isPending}>Enregistrer le profil</Button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-white/70 px-5 py-3 text-sm font-semibold text-ink">
              Téléverser le CV
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    cvMutation.mutate(file);
                  }
                }}
              />
            </label>
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
