import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import { useMarketplace } from '../../app/hooks/useMarketplace';

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
      <h1>Mon profil aidant</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Bio
          <textarea
            value={form.bio}
            onChange={(event) =>
              setForm((current) => ({ ...current, bio: event.target.value }))
            }
            rows={4}
          />
        </label>
        <label>
          Rayon d&apos;intervention (km)
          <input
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
        </label>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
      <p>
        <Link to="/">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
