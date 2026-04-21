import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { getCurrentUser, updateProfile } from '../../api/auth.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Panel } from '../../components/common/Panel';
import { TextArea } from '../../components/common/TextArea';
import { AppShell } from '../../components/layout/AppShell';
import { useAuth } from '../../hooks/useAuth';

export function EmployerProfilePage() {
  const { user } = useAuth();
  const profileQuery = useQuery({
    queryKey: ['auth', 'me', 'employer'],
    queryFn: getCurrentUser,
  });
  const profile = profileQuery.data?.profile && 'companyName' in profileQuery.data.profile ? profileQuery.data.profile : undefined;
  const form = useForm({
    values: {
      firstName: profileQuery.data?.firstName ?? '',
      lastName: profileQuery.data?.lastName ?? '',
      companyName: profile?.companyName ?? '',
      companyDescription: profile?.companyDescription ?? '',
      website: profile?.website ?? '',
      industry: profile?.industry ?? '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, string>) => updateProfile(user!.id, values),
    onSuccess: () => toast.success('Employer profile updated.'),
    onError: () => toast.error('Unable to update the employer profile.'),
  });

  return (
    <AppShell eyebrow="Employer command center" title="Polish your company profile">
      <Panel>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}>
          <Input label="First name" {...form.register('firstName')} />
          <Input label="Last name" {...form.register('lastName')} />
          <Input label="Company name" {...form.register('companyName')} />
          <Input label="Industry" {...form.register('industry')} />
          <Input label="Website" className="md:col-span-2" {...form.register('website')} />
          <div className="md:col-span-2">
            <TextArea label="Company description" {...form.register('companyDescription')} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={updateMutation.isPending}>Save changes</Button>
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
