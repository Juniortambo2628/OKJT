import { AuthField, AuthSubmit } from './AuthLayout.js';

/** The 6-digit code step of signing in. */
export default function TwoFactorForm({ id, code, onCode, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AuthField
        id={id}
        label="Verification code"
        value={code}
        onChange={(e) => onCode(e.target.value.replace(/\D/g, ''))}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        maxLength={6}
        required
        autoFocus
        inputClassName="text-center text-xl tracking-[0.6em] font-semibold"
      />
      <AuthSubmit loading={loading}>{loading ? 'Verifying…' : 'Verify & sign in'}</AuthSubmit>
    </form>
  );
}
