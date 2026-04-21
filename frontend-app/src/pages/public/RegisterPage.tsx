import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { register as registerUser } from '../../api/auth.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Panel } from '../../components/common/Panel';
import { SelectField } from '../../components/common/SelectField';
import { TextArea } from '../../components/common/TextArea';
import { PageWrapper } from '../../components/layout/PageWrapper';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['CANDIDATE', 'EMPLOYER']),
  companyName: z.string().optional(),
  companyDescription: z.string().optional(),
  skills: z.string().optional(),
  summary: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CANDIDATE' },
  });
  const role = watch('role');

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Account created. You can sign in now.');
      navigate('/login');
    },
    onError: () => toast.error('Registration failed. Please check the form and try again.'),
  });

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl">
        <Panel>
          <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Create an account</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Join the platform in your role</h1>
          <form
            className="mt-8 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit((values) =>
              registerMutation.mutate({
                ...values,
                skills: values.skills?.split(',').map((skill) => skill.trim()).filter(Boolean),
              }),
            )}
          >
            <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
            <Input label="Email" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
            <SelectField
              label="Role"
              error={errors.role?.message}
              options={[
                { label: 'Candidate', value: 'CANDIDATE' },
                { label: 'Employer', value: 'EMPLOYER' },
              ]}
              {...register('role')}
            />

            {role === 'EMPLOYER' ? (
              <>
                <Input label="Company name" error={errors.companyName?.message} {...register('companyName')} />
                <div className="md:col-span-2">
                  <TextArea label="Company description" error={errors.companyDescription?.message} {...register('companyDescription')} />
                </div>
              </>
            ) : (
              <>
                <Input label="Skills" placeholder="Java, Spring, React" {...register('skills')} />
                <div className="md:col-span-2">
                  <TextArea label="Profile summary" {...register('summary')} />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Creating...' : 'Create account'}
              </Button>
            </div>
          </form>
          <p className="mt-5 text-sm text-ink/65">
            Already registered? <Link to="/login" className="font-semibold text-coral">Sign in instead</Link>.
          </p>
        </Panel>
      </div>
    </PageWrapper>
  );
}
