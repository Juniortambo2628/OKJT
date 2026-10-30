import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Three colours of the sign-in fields can be set in the app's CSS, and
 * otherwise follow the theme: --okjt-auth-glow (where the button's gradient
 * ends; accent-soft), --okjt-auth-focus (a focused field's border and ring;
 * accent) and --okjt-auth-placeholder (faint).
 *
 * The sign-in pages' frame: a light card with the form, and on desktop a
 * panel beside it (`aside`, e.g. a showcase of the app). Phones get the form
 * alone, full width. `brand` is the logo linking home; `backLabel` the
 * link back to the public site.
 */
export default function AuthLayout({ title, subtitle, children, footer, brand, backLabel = 'Back to the website', aside }) {
  return (
    <div className="auth-page min-h-dvh flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-tint">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`w-full ${aside ? 'max-w-6xl grid lg:grid-cols-2' : 'max-w-xl grid'} gap-3 p-3 rounded-[2rem] bg-paper border border-white shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--color-body)_35%,transparent)]`}
      >
        <section className="flex flex-col px-5 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="flex items-center justify-between gap-4">
            {brand && (
              <Link to="/" className="flex items-center gap-2.5" aria-label="Back to the home page">
                {brand}
              </Link>
            )}
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-soft hover:border-accent hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {backLabel}
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto lg:mx-0 py-10">
            <h1 className="!text-3xl !font-semibold tracking-tight !text-ink">{title}</h1>
            {subtitle && <div className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</div>}
            <div className="mt-8">{children}</div>
          </div>

          {footer && <div className="w-full max-w-sm mx-auto lg:mx-0 text-sm text-muted">{footer}</div>}
        </section>

        {aside}
      </motion.div>
    </div>
  );
}

const fieldClass = 'w-full h-12 px-5 rounded-full bg-white border border-line text-sm text-ink placeholder:text-[var(--okjt-auth-placeholder,var(--color-faint))] shadow-[0_1px_2px_color-mix(in_srgb,var(--color-body)_4%,transparent)] outline-none transition focus:border-[var(--okjt-auth-focus,var(--color-accent))] focus:ring-4 focus:ring-[var(--okjt-auth-focus,var(--color-accent))]/15 read-only:bg-tint read-only:text-muted';

/** A labelled pill input; `type="password"` gets a show/hide toggle. */
export function AuthField({ id, label, type = 'text', error, className = '', inputClassName = '', ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold text-body mb-2">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${fieldClass} ${isPassword ? 'pr-12' : ''} ${error ? '!border-red-300' : ''} ${inputClassName}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-faint hover:text-body hover:bg-tint"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <div id={`${id}-error`} className="mt-1.5 pl-5 text-xs text-red-600">{error}</div>}
    </div>
  );
}

/** The copper gradient pill button of the sign-in pages. */
export function AuthSubmit({ loading, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-accent-dark via-accent-strong to-[var(--okjt-auth-glow,var(--color-accent-soft))] shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--color-accent-strong)_80%,transparent)] transition hover:brightness-105 active:brightness-95 disabled:opacity-70 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--okjt-auth-focus,var(--color-accent))]/30"
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
