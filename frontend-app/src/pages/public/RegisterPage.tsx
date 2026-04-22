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
      toast.success('Compte créé. Vous pouvez maintenant vous connecter.');
      navigate('/login');
    },
    onError: () => toast.error('Échec de l\'inscription. Veuillez vérifier le formulaire et réessayer.'),
  });

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl">
        <Panel>
          <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Créer un compte</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Rejoignez la plateforme selon votre rôle</h1>
          <form
            className="mt-8 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit((values) =>
              registerMutation.mutate({
                ...values,
                skills: values.skills?.split(',').map((skill) => skill.trim()).filter(Boolean),
              }),
            )}
          >
            <Input label="Prénom" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Nom" error={errors.lastName?.message} {...register('lastName')} />
            <Input label="E-mail" error={errors.email?.message} {...register('email')} />
            <Input label="Mot de passe" type="password" error={errors.password?.message} {...register('password')} />
            <SelectField
              label="Rôle"
              error={errors.role?.message}
              options={[
                { label: 'Candidat', value: 'CANDIDATE' },
                { label: 'Employeur', value: 'EMPLOYER' },
              ]}
              {...register('role')}
            />

            {role === 'EMPLOYER' ? (
              <>
                <Input label="Nom de l'entreprise" error={errors.companyName?.message} {...register('companyName')} />
                <div className="md:col-span-2">
                  <TextArea label="Description de l'entreprise" error={errors.companyDescription?.message} {...register('companyDescription')} />
                </div>
              </>
            ) : (
              <>
                <Input label="Compétences" placeholder="Java, Spring, React" {...register('skills')} />
                <div className="md:col-span-2">
                  <TextArea label="Résumé du profil" {...register('summary')} />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Création en cours...' : 'Créer le compte'}
              </Button>
            </div>
          </form>
          <p className="mt-5 text-sm text-ink/65">
            Déjà inscrit ? <Link to="/login" className="font-semibold text-coral">Connectez-vous</Link>.
          </p>
        </Panel>
      </div>
    </PageWrapper>
  );
}
