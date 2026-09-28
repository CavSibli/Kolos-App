import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { Button, TextArea, TextField } from '../../ui';

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
      <PageMeta
        title="Publier une demande"
        description="Publiez une mission pour trouver un aidant Kolos."
        path="/app/requests/new"
        noIndex
      />
      <h1>Publier une demande</h1>
      <p className="ds-page-lead">
        Décrivez la mission : les aidants pourront candidater ensuite.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="publish-titre"
          label="Titre"
          value={form.titre}
          onChange={(event) =>
            setForm((current) => ({ ...current, titre: event.target.value }))
          }
          required
        />
        <TextArea
          id="publish-description"
          label="Description"
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          required
          rows={4}
        />
        <TextField
          id="publish-adresse"
          label="Adresse"
          value={form.adresse}
          onChange={(event) =>
            setForm((current) => ({ ...current, adresse: event.target.value }))
          }
          required
          autoComplete="street-address"
        />
        <TextField
          id="publish-date"
          label="Date de mission"
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
        <TextField
          id="publish-duree"
          label="Durée estimée (minutes)"
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
        <TextField
          id="publish-nb-aidants"
          label="Nombre d'aidants requis"
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
        <TextField
          id="publish-budget"
          label="Budget estimé (€, optionnel)"
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
          {isSubmitting ? 'Publication…' : 'Publier'}
        </Button>
      </form>
      <p className="ds-page-footer">
        <Link to="/app">Retour à l&apos;accueil</Link>
        {' · '}
        <Link to="/app/requests/mine">Mes demandes</Link>
      </p>
    </div>
  );
}
