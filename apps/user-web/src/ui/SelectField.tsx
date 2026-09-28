import type { ReactNode, SelectHTMLAttributes } from 'react';

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
};

export function SelectField({
  id,
  label,
  hint,
  error,
  className = '',
  children,
  ...rest
}: SelectFieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      className={['ds-field', error ? 'ds-field--invalid' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <label className="ds-field__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="ds-field__control"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {children}
      </select>
      {hint && !error ? (
        <p id={`${id}-hint`} className="ds-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="ds-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
