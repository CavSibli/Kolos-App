import type { InputHTMLAttributes, ReactNode } from 'react';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  trailing?: ReactNode;
};

export function TextField({
  id,
  label,
  hint,
  error,
  trailing,
  className = '',
  ...rest
}: TextFieldProps) {
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ]
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
      <input
        id={id}
        className="ds-field__control"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {trailing}
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
