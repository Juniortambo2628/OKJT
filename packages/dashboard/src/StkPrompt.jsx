import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Smartphone, XCircle } from 'lucide-react';
import { formatNumber } from '@okjt/ui';
import { useDashboard } from './DashboardProvider.js';
import { AdminInput } from './AdminInput.js';

const POLL_MS = 3000;
const GIVE_UP_MS = 150000;

const RESULT = {
  paid: { icon: CheckCircle2, tone: 'border-tone-100 bg-tint text-body', title: 'Paid' },
  cancelled: { icon: XCircle, tone: 'border-amber-200 bg-amber-50 text-amber-900', title: 'Cancelled on the phone' },
  timed_out: { icon: XCircle, tone: 'border-amber-200 bg-amber-50 text-amber-900', title: "The phone didn't answer in time" },
  failed: { icon: XCircle, tone: 'border-amber-200 bg-amber-50 text-amber-900', title: "M-Pesa didn't take the payment" },
};

const kes = (n) => `KES ${formatNumber(n)}`;

/**
 * StkPrompt: sends an M-Pesa prompt to the payer's phone and follows it until
 * M-Pesa answers, lifted from Naoa. For laravel-kit's Mpesa: `send` is the
 * project's own start endpoint (it knows what is paid for), usually a
 * useAdminAction so viewers can't; the prompt is then followed at
 * `{path}/{id}` (MpesaController@show) every 3 seconds, for up to 2½ minutes.
 *
 *   <StkPrompt
 *     amount={order.balance} maxAmount={order.balance} payee="Amani Gardens"
 *     send={(values) => api.post(`/orders/${order.id}/mpesa`, values)}
 *     onPaid={() => refetch()} onDone={close}
 *   />
 *
 * @param {(values: { phone, amount }) => Promise<{ data: { data: payment } }>} send
 * @param {number} [amount]  The amount to start with
 * @param {number} [maxAmount]
 * @param {boolean} [fixedAmount=false]  Don't let the amount be changed
 * @param {string} [payee]  Who the money goes to, in the words around the form
 * @param {string} [path='/mpesa/payments']
 * @param {(n: number) => string} [money]  How an amount is written (default "KES 1,500")
 * @param {(payment) => void} [onPaid]
 * @param {() => void} [onDone]
 * @param {string} [intro]  The line above the form
 */
export default function StkPrompt({ send, amount = '', maxAmount, fixedAmount = false, payee, path = '/mpesa/payments', money = kes, onPaid, onDone, intro }) {
  const { api } = useDashboard();
  const [form, setForm] = useState({ phone: '', amount });
  const [sending, setSending] = useState(false);
  const [payment, setPayment] = useState(null);
  const started = useRef(0);
  const told = useRef(false);

  useEffect(() => {
    if (!payment || payment.status !== 'pending') return undefined;
    const timer = setTimeout(async () => {
      if (Date.now() - started.current > GIVE_UP_MS) {
        setPayment((p) => ({ ...p, status: 'unknown' }));
        return;
      }
      try {
        const res = await api.get(`${path}/${payment.id}`);
        const next = { ...(res.data?.data ?? payment) };
        setPayment(next); // a copy, so the next tick is scheduled even if nothing changed
        if (next.status === 'paid' && !told.current) {
          told.current = true;
          onPaid?.(next);
        }
      } catch {
        setPayment((p) => ({ ...p })); // try again on the next tick
      }
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [payment, api, path, onPaid]);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await send({ phone: form.phone, amount: Number(form.amount) });
      const sent = res?.data?.data;
      if (sent) {
        started.current = Date.now();
        told.current = false;
        setPayment(sent);
      }
    } catch {
      // The action showed the error; keep the form.
    }
    setSending(false);
  };

  const to = payee || 'the payee';

  if (payment) {
    const result = RESULT[payment.status];
    const Icon = result?.icon;
    return (
      <div className="space-y-4">
        {payment.status === 'pending' && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-tone-100 p-3 text-sm text-body">
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-tone-500" aria-hidden="true" />
            <span>Prompt sent to {payment.phone}. Waiting for them to enter their M-Pesa PIN for {money(payment.amount)}…</span>
          </div>
        )}
        {payment.status === 'unknown' && (
          <div role="status" className="rounded-xl border border-tone-100 p-3 text-sm text-body">
            No answer from M-Pesa yet. If the payment went through, it will show here once M-Pesa confirms it.
          </div>
        )}
        {result && (
          <div role="status" className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${result.tone}`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-semibold">{result.title}.</span>{' '}
              {payment.status === 'paid'
                ? `${money(payment.amount)} paid to ${to}${payment.mpesa_receipt ? `, M-Pesa code ${payment.mpesa_receipt}` : ''}.`
                : (payment.result_desc || 'Nothing was paid.')}
            </span>
          </div>
        )}
        <div className="flex gap-2">
          {payment.status !== 'pending' && payment.status !== 'paid' && (
            <button type="button" onClick={() => setPayment(null)} className="rounded-full border border-tone-200 px-4 py-2 text-sm font-medium text-ink hover:bg-tone-50">Try again</button>
          )}
          {onDone && (
            <button type="button" onClick={onDone} className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">{payment.status === 'paid' ? 'Done' : 'Close'}</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-soft">{intro ?? `The payer gets a prompt on their phone to pay ${to}. The payment shows here once M-Pesa confirms it.`}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminInput label="Payer's Safaricom number" type="tel" autoComplete="tel" required placeholder="0712 345 678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <AdminInput label="Amount (KES)" type="number" min="1" max={maxAmount || undefined} step="1" required readOnly={fixedAmount} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      </div>
      <button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Smartphone className="h-4 w-4" aria-hidden="true" />}
        {sending ? 'Sending…' : 'Send the M-Pesa prompt'}
      </button>
    </form>
  );
}
