import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import { useAuth } from '../../app/providers/AuthProvider';
import { safeNext } from '../../app/routing/safeNext';
import { Button, TextField } from '../../ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(safeNext(searchParams.get('next')));
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Identifiants invalides',
        );
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <p className="ds-login-brand">Kolos</p>
      <h1>Connexion</h1>
      <p className="ds-login-lead">
        Accédez à votre espace demandeur ou aidant.
      </p>
      <form onSubmit={handleSubmit}>
        <TextField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
        <TextField
          id="login-password"
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
        />
        {error ? <p className="error">{error}</p> : null}
        <Button type="submit" block disabled={isSubmitting}>
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
      <p>
        Pas de compte ? <Link to="/register">S&apos;inscrire</Link>
      </p>
    </div>
  );
}
