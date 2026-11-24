import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import EmptyState from './EmptyState.js';
import { AdminInput, AdminTextarea } from './AdminInput.js';

/**
 * AdminFaqs: a list of questions and answers, lifted from Naoa's admin FAQ
 * page, on laravel-kit's FaqController. Add a question, edit one in place,
 * delete (asks first), and move one up or down (saved straight away).
 * `group` edits one page's list (Tena-host's pricing FAQs).
 *
 *   <AdminFaqs />
 *   <AdminFaqs group="pricing" />
 *
 * @param {string} [group]
 * @param {string} [path='/faqs']
 */
function FaqForm({ initial = { question: '', answer: '' }, onSave, onCancel, saving, saveLabel }) {
  const [question, setQuestion] = useState(initial.question);
  const [answer, setAnswer] = useState(initial.answer);
  const ready = question.trim() && answer.trim();
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (ready) onSave({ question: question.trim(), answer: answer.trim() }); }}>
      <AdminInput label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={255} required autoFocus />
      <AdminTextarea label="Answer" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} required className="!resize-y" />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-full px-4 py-2 text-sm text-soft hover:text-ink">Cancel</button>
        <button type="submit" disabled={!ready || saving} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{saveLabel}</button>
      </div>
    </form>
  );
}

export default function AdminFaqs({ group, path = '/faqs' }) {
  const { api } = useDashboard();
  const [faqs, setFaqs] = useState(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(null); // id, or 'new'

  const load = useCallback(async () => {
    try {
      const res = await api.get(path, { params: group ? { group } : {} });
      setFaqs(res.data?.data ?? []);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path, group]);
  useEffect(() => { load(); }, [load]);

  const add = useAdminAction((body) => api.post(path, { ...body, ...(group ? { group } : {}) }), {
    key: () => 'new', success: 'Question added', error: "Couldn't add the question",
    onSuccess: () => { setEditing(null); load(); },
  });
  const save = useAdminAction((faq, body) => api.put(`${path}/${faq.id}`, { ...body, group: faq.group ?? group ?? null }), {
    key: (faq) => faq.id, success: 'Saved', error: "Couldn't save the question",
    onSuccess: () => { setEditing(null); load(); },
  });
  const remove = useAdminAction((faq) => api.delete(`${path}/${faq.id}`), {
    key: (faq) => faq.id,
    confirm: (faq) => ({ title: `Delete "${faq.question}"?`, confirmLabel: 'Delete', tone: 'danger' }),
    success: 'Question deleted', error: "Couldn't delete the question",
    onSuccess: () => load(),
  });
  const reorder = useAdminAction((ids) => api.put(`${path}/reorder`, { ids }), {
    key: () => 'order', error: "Couldn't save the order", onError: () => load(),
  });

  const move = (index, by) => {
    const next = [...faqs];
    const [faq] = next.splice(index, 1);
    next.splice(index + by, 0, faq);
    setFaqs(next);
    reorder.run(next.map((f) => f.id));
  };

  if (failed) return <EmptyState message="The questions couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />;
  if (faqs === null) return <EmptyState loading rows={3} />;

  const icon = 'rounded-lg p-1.5 text-tone-400 hover:bg-tone-100 hover:text-ink disabled:opacity-30';
  return (
    <div className="space-y-4">
      {faqs.length === 0 && editing !== 'new' && (
        <EmptyState message="No questions yet." action={{ label: 'Add a question', onClick: () => setEditing('new') }} />
      )}
      {faqs.length > 0 && (
        <ol className="space-y-3">
          {faqs.map((faq, i) => (
            <li key={faq.id} className="rounded-2xl border border-tone-100 bg-surface p-4">
              {editing === faq.id ? (
                <FaqForm initial={faq} saveLabel="Save" saving={save.isPending(faq.id)} onCancel={() => setEditing(null)} onSave={(body) => save.run(faq, body)} />
              ) : (
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{faq.question}</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-soft">{faq.answer}</p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || !reorder.allowed} aria-label={`Move "${faq.question}" up`} className={icon}><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === faqs.length - 1 || !reorder.allowed} aria-label={`Move "${faq.question}" down`} className={icon}><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setEditing(faq.id)} disabled={!save.allowed} className="rounded-lg px-2 py-1 text-xs text-soft hover:text-ink">Edit</button>
                    <button type="button" onClick={() => remove.run(faq)} disabled={remove.isPending(faq.id) || !remove.allowed} aria-label={`Delete "${faq.question}"`} className="rounded-lg px-2 py-1 text-xs text-soft hover:text-red-600">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
      {editing === 'new' ? (
        <div className="rounded-2xl border border-accent/30 bg-surface p-4">
          <FaqForm saveLabel="Add" saving={add.pending} onCancel={() => setEditing(null)} onSave={(body) => add.run(body)} />
        </div>
      ) : faqs.length > 0 && (
        <button type="button" onClick={() => setEditing('new')} disabled={!add.allowed} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-strong disabled:opacity-50">
          <Plus className="h-4 w-4" /> Add a question
        </button>
      )}
    </div>
  );
}
