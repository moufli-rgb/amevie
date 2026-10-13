import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Champs de formulaire : 48 px de haut, libellé au-dessus. */
const base =
  'w-full rounded-xl border border-ligne bg-fond px-4 text-[15px] text-ink placeholder:text-ink/40 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/12';

interface Wrap { label: string; hint?: ReactNode; icon?: ReactNode; className?: string }

export function Field({ label, hint, icon, className = '', type, ...rest }: Wrap & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPwd = type === 'password';
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40">{icon}</span>}
        <input
          id={id}
          type={isPwd && visible ? 'text' : type}
          {...rest}
          className={`${base} h-12 ${icon ? 'pl-11' : ''} ${isPwd ? 'pr-12' : ''}`}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink/50 hover:bg-surface hover:text-ink"
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </span>
      {hint && <span className="mt-1.5 block text-mini text-ink/55">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, hint, className = '', children, ...rest }: Wrap & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">{label}</span>
      <select id={id} {...rest} className={`${base} h-12 appearance-none bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10`}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
        {children}
      </select>
      {hint && <span className="mt-1.5 block text-mini text-ink/55">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, className = '', ...rest }: Wrap & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">{label}</span>
      <textarea id={id} rows={4} {...rest} className={`${base} min-h-24 resize-y py-3`} />
      {hint && <span className="mt-1.5 block text-mini text-ink/55">{hint}</span>}
    </label>
  );
}
