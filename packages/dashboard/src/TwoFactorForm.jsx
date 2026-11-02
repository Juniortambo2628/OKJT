import { AuthField, AuthSubmit } from './AuthLayout.js';

/** The second step of signing in: the 6-digit code, or (`recovery`) one of the recovery codes. */
export default function TwoFactorForm({ id, code, onCode, loading, onSubmit, recovery = false }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {recovery ? (
        <AuthField
          key="recovery"
          id={id}
          label="Recovery code"
          value={code}
          onChange={(e) => onCode(e.target.value.trim())}
          autoComplete="off"
          placeholder="xxxxxxxxxx-xxxxxxxxxx"
          required
          autoFocus
          inputClassName="text-center font-mono"
        />
      ) : (
        <AuthField
          key="code"
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
      )}
      <AuthSubmit loading={loading}>{loading ? 'Verifying…' : 'Verify & sign in'}</AuthSubmit>
    </form>
  );
}
