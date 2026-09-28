import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  body?: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="ds-state" role="status">
      <h3 className="ds-state__title">{title}</h3>
      {body ? <p className="ds-state__body">{body}</p> : null}
      {action}
    </div>
  );
}
