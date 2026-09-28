type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Chargement…' }: LoadingStateProps) {
  return (
    <div className="ds-state ds-state--loading" role="status" aria-live="polite">
      <p className="ds-state__body">{label}</p>
    </div>
  );
}
