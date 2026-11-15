import { forwardRef, useId } from 'react';
import { useComponentDefaults } from './DashboardProvider.js';

// Fields draw their own background and text colour so a forms plugin (which
// paints inputs white) can't override them on a dark dashboard. Both come from
// CSS variables a project sets; by default the field stays transparent and
// takes the text colour around it, as it always has:
//   .admin-theme { --okjt-field-bg: #1a1a1a; --okjt-field-text: #f5f5f5; }
const baseInputClasses = "w-full px-4 py-2 rounded-lg border border-tone-200 bg-[var(--okjt-field-bg,transparent)] text-[color:var(--okjt-field-text,inherit)] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors";

/**
 * One field: a label, the control and its error, or (with `bare`) the control
 * alone, for forms that place their label and error themselves. The control
 * takes a `ref` either way.
 *
 * A project whose fields look different sets their base classes once, in
 * DashboardProvider (`componentDefaults: { Field: { classNames: { input,
 * select, textarea } } }`), or per field with `baseClassName`. Either
 * replaces the kit's classes for that control; `className` is still added
 * after them, and an error still adds `border-red-400`.
 */
function makeField(Tag, extraClasses, displayName) {
  const Field = forwardRef(function Field({ label, error, bare = false, className = '', id, children, baseClassName, ...props }, ref) {
    const { classNames } = useComponentDefaults('Field', {});
    const base = baseClassName ?? classNames?.[Tag] ?? `${baseInputClasses}${extraClasses ? ` ${extraClasses}` : ''}`;
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const control = (
      <Tag
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && !bare ? errorId : undefined}
        className={`${base} ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </Tag>
    );
    if (bare) return control;
    return (
      <div>
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-tone-600 mb-1">{label}</label>}
        {control}
        {error && <p id={errorId} className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  });
  Field.displayName = displayName;
  return Field;
}

export const AdminInput = makeField('input', '', 'AdminInput');
export const AdminTextarea = makeField('textarea', 'resize-none', 'AdminTextarea');
export const AdminSelect = makeField('select', '', 'AdminSelect');
