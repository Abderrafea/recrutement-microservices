import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Panel } from '../../components/common/Panel';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const storeLogin = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      storeLogin(response.user, response.accessToken);
      toast.success('Bon retour parmi nous.');
      navigate(
        response.user.role === 'CANDIDATE'
          ? '/candidate/dashboard'
          : response.user.role === 'EMPLOYER'
            ? '/employer/dashboard'
            : '/admin/dashboard',
      );
    },
    onError: () => toast.error('Échec de la connexion. Veuillez vérifier vos identifiants.'),
  });

  return (
    <PageWrapper>
      <div className="mx-auto max-w-xl">
        <Panel>
          <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Accès au compte</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Connectez-vous à votre espace</h1>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
            <Input label="E-mail" error={errors.email?.message} {...register('email')} />
            <Input label="Mot de passe" type="password" error={errors.password?.message} {...register('password')} />
            <Button type="submit" disabled={loginMutation.isPending} fullWidth>
              {loginMutation.isPending ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>
          <p className="mt-5 text-sm text-ink/65">
            Pas encore de compte ? <Link to="/register" className="font-semibold text-coral">Créez-en un ici</Link>.
          </p>
        </Panel>
      </div>
    </PageWrapper>
  );
}
