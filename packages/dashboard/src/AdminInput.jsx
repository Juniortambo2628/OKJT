import { forwardRef, useId } from 'react';

// White, as the forms plugin's own, unless the app sets --okjt-input-bg in CSS
// (a dark dashboard, where white fields would glare).
const baseInputClasses = "w-full px-4 py-2 rounded-lg border border-tone-200 bg-[var(--okjt-input-bg,#fff)] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors";

/**
 * One form field: an optional label, the control, and an optional error,
 * tied together for screen readers. The ref reaches the control itself.
 */
function field(Control, name, extraClasses = '') {
  const Field = forwardRef(function Field({ label, error, className = '', id, children, ...props }, ref) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div>
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-tone-600 mb-1">{label}</label>}
        <Control
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${baseInputClasses} ${extraClasses} ${error ? 'border-red-400' : ''} ${className}`}
          {...props}
        >
          {children}
        </Control>
        {error && <p id={errorId} className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  });
  Field.displayName = name;
  return Field;
}

export const AdminInput = field('input', 'AdminInput');
export const AdminTextarea = field('textarea', 'AdminTextarea', 'resize-none');
export const AdminSelect = field('select', 'AdminSelect');
