import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  muted?: boolean;
  children: ReactNode;
  as?: 'div' | 'article' | 'section';
};

export function Card({
  title,
  muted = false,
  children,
  as: Tag = 'div',
  className = '',
  ...rest
}: CardProps) {
  return (
    <Tag
      className={['ds-card', muted ? 'ds-card--muted' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {title ? <h3 className="ds-card__title">{title}</h3> : null}
      {children}
    </Tag>
  );
}
