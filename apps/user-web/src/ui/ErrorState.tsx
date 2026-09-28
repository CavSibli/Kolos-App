import type { ReactNode } from 'react';

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({
  title = 'Une erreur est survenue',
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className="ds-state ds-state--error" role="alert">
      <h3 className="ds-state__title">{title}</h3>
      <p className="ds-state__body">{message}</p>
      {action}
    </div>
  );
}
