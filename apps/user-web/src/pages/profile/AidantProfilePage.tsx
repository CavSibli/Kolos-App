import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { Button, TextArea, TextField } from '../../ui';

export function AidantProfilePage() {
  const { upsertAidantProfile } = useMarketplace();
  const [form, setForm] = useState({ bio: '', rayonIntervention: 10 });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const result = await upsertAidantProfile(form);
      setMessage(`Profil enregistré (rayon : ${result.rayonIntervention} km)`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Enregistrement impossible',
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
      <PageMeta
        title="Profil aidant"
        description="Complétez votre bio et votre rayon d’intervention."
        path="/app/profile/aidant"
        noIndex
      />
      <h1>Mon profil aidant</h1>
      <p className="ds-page-lead">
        Présentez-vous aux demandeurs pour candidater en confiance.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <TextArea
          id="aidant-bio"
          label="Bio"
          value={form.bio}
          onChange={(event) =>
            setForm((current) => ({ ...current, bio: event.target.value }))
          }
          rows={4}
          hint="Quelques lignes sur votre expérience"
        />
        <TextField
          id="aidant-rayon"
          label="Rayon d'intervention (km)"
          type="number"
          min={1}
          value={form.rayonIntervention}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              rayonIntervention: Number(event.target.value),
            }))
          }
          required
        />
        {error ? (
          <p className="ds-form-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="ds-form-success" role="status">
            {message}
          </p>
        ) : null}
        <Button type="submit" block disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
      <p className="ds-page-footer">
        <Link to="/app">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
