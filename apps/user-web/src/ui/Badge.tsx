import type { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

type BadgeProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={['ds-badge', `ds-badge--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
