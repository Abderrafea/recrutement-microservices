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
  const form = useForm({
    values: {
      firstName: profileQuery.data?.firstName ?? '',
      lastName: profileQuery.data?.lastName ?? '',
      phone: 'phone' in (profileQuery.data?.profile ?? {}) ? profileQuery.data?.profile?.phone ?? '' : '',
      address: 'address' in (profileQuery.data?.profile ?? {}) ? profileQuery.data?.profile?.address ?? '' : '',
      summary: 'summary' in (profileQuery.data?.profile ?? {}) ? profileQuery.data?.profile?.summary ?? '' : '',
      skills: 'skills' in (profileQuery.data?.profile ?? {}) ? profileQuery.data?.profile?.skills?.join(', ') ?? '' : '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, string>) =>
      updateProfile(user!.id, {
        ...values,
        skills: values.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      }),
    onSuccess: () => toast.success('Profile updated.'),
    onError: () => toast.error('Unable to update profile.'),
  });

  const cvMutation = useMutation({
    mutationFn: (file: File) => uploadCv(user!.id, file),
    onSuccess: () => toast.success('CV uploaded.'),
    onError: () => toast.error('Unable to upload CV.'),
  });

  return (
    <AppShell eyebrow="Candidate command center" title="Shape your candidate profile">
      <Panel>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}>
          <Input label="First name" {...form.register('firstName')} />
          <Input label="Last name" {...form.register('lastName')} />
          <Input label="Phone" {...form.register('phone')} />
          <Input label="Address" {...form.register('address')} />
          <div className="md:col-span-2">
            <Input label="Skills" placeholder="Java, Spring Boot, React" {...form.register('skills')} />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Summary" {...form.register('summary')} />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={updateMutation.isPending}>Save profile</Button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-white/70 px-5 py-3 text-sm font-semibold text-ink">
              Upload CV
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
