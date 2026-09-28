import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import { useAuth } from '../../app/providers/AuthProvider';
import { safeNext } from '../../app/routing/safeNext';
import { PageMeta } from '../../app/seo/PageMeta';
import { Button, SelectField, TextField } from '../../ui';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'demandeur' as 'demandeur' | 'aidant',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register(form);
      navigate(safeNext(searchParams.get('next')));
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 409) {
          setError('Cet email est déjà utilisé.');
        } else {
          setError(
            typeof err.body.message === 'string'
              ? err.body.message
              : 'Inscription impossible',
          );
        }
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <PageMeta
        title="Inscription"
        description="Créez votre compte Kolos en tant que demandeur ou aidant."
        path="/register"
      />
      <p className="ds-login-brand">Kolos</p>
      <h1>Inscription</h1>
      <p className="ds-page-lead">
        Une seule action : créer votre compte pour publier ou candidater.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="register-firstName"
          label="Prénom"
          value={form.firstName}
          onChange={(event) =>
            setForm((current) => ({ ...current, firstName: event.target.value }))
          }
          required
          autoComplete="given-name"
        />
        <TextField
          id="register-lastName"
          label="Nom"
          value={form.lastName}
          onChange={(event) =>
            setForm((current) => ({ ...current, lastName: event.target.value }))
          }
          required
          autoComplete="family-name"
        />
        <TextField
          id="register-email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          required
          autoComplete="email"
        />
        <TextField
          id="register-password"
          label="Mot de passe"
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          required
          minLength={8}
          autoComplete="new-password"
          hint="8 caractères minimum"
        />
        <SelectField
          id="register-role"
          label="Je suis"
          value={form.role}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              role: event.target.value as 'demandeur' | 'aidant',
            }))
          }
        >
          <option value="demandeur">Demandeur</option>
          <option value="aidant">Aidant</option>
        </SelectField>
        {error ? (
          <p className="ds-form-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" block disabled={isSubmitting}>
          {isSubmitting ? 'Inscription…' : 'Créer mon compte'}
        </Button>
      </form>
      <p className="ds-page-footer">
        Déjà inscrit ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}
