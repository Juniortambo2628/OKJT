import { budgetFor } from './brief';

/**
 * The cost estimator's questions and prices. These are starting figures:
 * Settings > Services > Estimator config can replace them with the same
 * shape as JSON, without a deploy. Each option adds `cost` (US dollars) and
 * `weeks`; `scope` is the line it adds to the outline; a question's
 * `short` names its step in the wizard. The range runs from
 * the total to the total × `spread`; a rushed deadline multiplies by `rush`.
 */
export const DEFAULT_ESTIMATOR = {
  spread: 1.4,
  rush: 1.25,
  round: 500,
  questions: [
    { id: 'type', short: 'Type', label: 'What are you building?', options: [
      { id: 'site', label: 'A website', hint: 'Pages, a blog or news, contact forms', cost: 2000, weeks: 3, scope: 'A designed, fast website with content you can edit' },
      { id: 'app', label: 'A web app or portal', hint: 'Accounts, records, workflows', cost: 5000, weeks: 8, scope: 'A web application built around your workflows' },
      { id: 'store', label: 'An online store or marketplace', hint: 'Products, orders, sellers', cost: 6000, weeks: 8, scope: 'A store or marketplace with catalogue, cart and orders' },
      { id: 'booking', label: 'A booking platform', hint: 'Appointments, events, tickets', cost: 4500, weeks: 6, scope: 'Bookings with availability, reminders and confirmations' },
    ] },
    { id: 'accounts', short: 'Sign-in', label: 'Who signs in?', options: [
      { id: 'none', label: 'Nobody, it’s public', cost: 0, weeks: 0 },
      { id: 'one', label: 'One kind of user', hint: 'e.g. customers', cost: 800, weeks: 1, scope: 'Sign-in and accounts for your users' },
      { id: 'roles', label: 'Several roles', hint: 'e.g. customers, staff, partners', cost: 2000, weeks: 2, scope: 'Accounts with separate roles and permissions' },
    ] },
    { id: 'payments', short: 'Payments', label: 'Does it take payments?', options: [
      { id: 'none', label: 'No', cost: 0, weeks: 0 },
      { id: 'basic', label: 'M-Pesa or card', cost: 1000, weeks: 1, scope: 'Payments by M-Pesa or card, with receipts' },
      { id: 'full', label: 'M-Pesa and card, with payouts', hint: 'Paying sellers or partners', cost: 2500, weeks: 2, scope: 'M-Pesa and card payments with payouts and reconciliation' },
    ] },
    { id: 'admin', short: 'Dashboard', label: 'How will you manage it?', options: [
      { id: 'content', label: 'Edit the content', cost: 0, weeks: 0, scope: 'A dashboard to edit pages and content' },
      { id: 'full', label: 'A full management dashboard', hint: 'Records, reports, settings', cost: 2000, weeks: 2, scope: 'A management dashboard with records and reports' },
    ] },
    { id: 'integrations', short: 'Integrations', label: 'Other systems to connect?', options: [
      { id: 'none', label: 'None', cost: 0, weeks: 0 },
      { id: 'few', label: 'One or two', hint: 'e.g. WhatsApp, a CRM, maps', cost: 1000, weeks: 1, scope: 'Connections to one or two outside services' },
      { id: 'many', label: 'Three or more', cost: 2500, weeks: 2, scope: 'Connections to several outside services' },
    ] },
    { id: 'languages', short: 'Languages', label: 'Languages', options: [
      { id: 'one', label: 'One', cost: 0, weeks: 0 },
      { id: 'more', label: 'Two or more', hint: 'e.g. English and Swahili', cost: 800, weeks: 1, scope: 'More than one language' },
    ] },
    { id: 'design', short: 'Design', label: 'Design', options: [
      { id: 'have', label: 'I have designs or a brand guide', cost: 0, weeks: 0 },
      { id: 'need', label: 'Design it for me', cost: 1500, weeks: 2, scope: 'Interface design from scratch, shared for feedback before building' },
    ] },
    { id: 'deadline', short: 'Deadline', label: 'When do you need it?', options: [
      { id: 'asap', label: 'Within six weeks', cost: 0, weeks: 0, rush: true, timeline: 'As soon as possible' },
      { id: '3m', label: 'Within three months', cost: 0, weeks: 0, timeline: 'Within 3 months', default: true },
      { id: '6m', label: 'In three to six months', cost: 0, weeks: 0, timeline: 'In 3 to 6 months' },
      { id: 'exploring', label: 'Just exploring', cost: 0, weeks: 0, timeline: 'Just exploring' },
    ] },
  ],
};

/** The config to use: the setting's JSON when it is valid, else the defaults. */
export function estimatorConfig(fromSetting) {
  return fromSetting && Array.isArray(fromSetting.questions) && fromSetting.questions.length ? { ...DEFAULT_ESTIMATOR, ...fromSetting } : DEFAULT_ESTIMATOR;
}

/** Each question's default option (or its first): a starting state that already shows an estimate. */
export function defaultAnswers(config) {
  return Object.fromEntries(config.questions.map((q) => [q.id, (q.options.find((o) => o.default) ?? q.options[0]).id]));
}

/** Price range, weeks, scope lines and the brief's budget and timeline for a set of answers. */
export function estimate(config, answers) {
  let cost = 0;
  let weeks = 0;
  let rush = false;
  let timeline = '';
  const scope = [];
  const chosen = [];
  for (const q of config.questions) {
    const option = q.options.find((o) => o.id === answers[q.id]) ?? q.options[0];
    cost += Number(option.cost) || 0;
    weeks += Number(option.weeks) || 0;
    if (option.scope) scope.push(option.scope);
    if (option.rush) rush = true;
    if (option.timeline) timeline = option.timeline;
    chosen.push(`${q.label} ${option.label}`);
  }
  if (rush) cost *= config.rush || 1;
  const round = config.round || 500;
  const low = Math.max(round, Math.round(cost / round) * round);
  const high = Math.max(low, Math.round((cost * (config.spread || 1.4)) / round) * round);
  const weeksLow = Math.max(2, weeks);
  const weeksHigh = Math.round(weeksLow * 1.4);
  // A rushed deadline shorter than the work itself means a smaller first version.
  const rushShort = rush && weeksLow > 6;
  return { low, high, weeksLow, weeksHigh, scope, chosen, rush, rushShort, timeline, budget: budgetFor((low + high) / 2) };
}

/** US dollars, whole: 12500 → "$12,500". */
export const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
