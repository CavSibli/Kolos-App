import { FormEvent, useState } from 'react';
import { ApiClientError } from '@kolos/http-client';
import type { ReportMotifCode } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { Button, SelectField, TextArea } from '../../ui';

const MOTIF_OPTIONS: { value: ReportMotifCode; label: string }[] = [
  { value: 'NO_SHOW', label: 'Absence' },
  { value: 'DELAY', label: 'Retard' },
  { value: 'NOT_PERFORMED', label: 'Prestation non réalisée' },
  { value: 'BEHAVIOUR', label: 'Comportement' },
  { value: 'PAYMENT', label: 'Paiement' },
  { value: 'OTHER', label: 'Autre' },
];

type ReportMissionFormProps = {
  missionId: number;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

export function ReportMissionForm({
  missionId,
  onSuccess,
  onError,
}: ReportMissionFormProps) {
  const { createReport } = useMarketplace();
  const [motif, setMotif] = useState<ReportMotifCode>('OTHER');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createReport(missionId, {
        motif,
        description: description.trim(),
      });
      setDescription('');
      setMotif('OTHER');
      onSuccess?.(
        `Signalement enregistré (#${result.id}) — statut ${result.status}`,
      );
    } catch (err) {
      if (err instanceof ApiClientError) {
        onError?.(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Signalement impossible',
        );
      } else {
        onError?.('Signalement impossible');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="ds-form" onSubmit={(event) => void handleSubmit(event)}>
      <SelectField
        id={`report-motif-${missionId}`}
        label="Motif"
        value={motif}
        onChange={(event) => setMotif(event.target.value as ReportMotifCode)}
        required
      >
        {MOTIF_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <TextArea
        id={`report-description-${missionId}`}
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        required
      />
      <div className="ds-actions">
        <Button type="submit" disabled={isSubmitting || !description.trim()}>
          {isSubmitting ? 'Envoi…' : 'Signaler'}
        </Button>
      </div>
    </form>
  );
}
