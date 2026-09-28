import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import { useMarketplace } from '../../app/hooks/useMarketplace';

function defaultMissionDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 16);
}

export function PublishRequestPage() {
  const { publishRequest } = useMarketplace();
  const [form, setForm] = useState({
    titre: '',
    description: '',
    adresse: '',
    dateMission: defaultMissionDate(),
    dureeEstimee: 60,
    nbAidantsRequis: 1,
    budgetEstime: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const result = await publishRequest({
        titre: form.titre,
        description: form.description,
        adresse: form.adresse,
        dateMission: new Date(form.dateMission).toISOString(),
        dureeEstimee: form.dureeEstimee,
        nbAidantsRequis: form.nbAidantsRequis,
        budgetEstime: form.budgetEstime
          ? Number(form.budgetEstime)
          : undefined,
      });
      setMessage(`Demande publiée : ${result.titre} (#${result.id})`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Publication impossible',
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
      <h1>Publier une demande</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Titre
          <input
            value={form.titre}
            onChange={(event) =>
              setForm((current) => ({ ...current, titre: event.target.value }))
            }
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            required
          />
        </label>
        <label>
          Adresse
          <input
            value={form.adresse}
            onChange={(event) =>
              setForm((current) => ({ ...current, adresse: event.target.value }))
            }
            required
          />
        </label>
        <label>
          Date de mission
          <input
            type="datetime-local"
            value={form.dateMission}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                dateMission: event.target.value,
              }))
            }
            required
          />
        </label>
        <label>
          Durée estimée (minutes)
          <input
            type="number"
            min={1}
            value={form.dureeEstimee}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                dureeEstimee: Number(event.target.value),
              }))
            }
            required
          />
        </label>
        <label>
          Nombre d&apos;aidants requis
          <input
            type="number"
            min={1}
            value={form.nbAidantsRequis}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                nbAidantsRequis: Number(event.target.value),
              }))
            }
            required
          />
        </label>
        <label>
          Budget estimé (€, optionnel)
          <input
            type="number"
            min={0}
            value={form.budgetEstime}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                budgetEstime: event.target.value,
              }))
            }
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publication...' : 'Publier'}
        </button>
      </form>
      <p>
        <Link to="/app">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
