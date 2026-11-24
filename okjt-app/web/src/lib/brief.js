/**
 * The brief's budget ranges (US dollars) and timelines, shared by the Contact
 * form and the cost estimator. They match the Intro call's booking questions
 * on Cal.com, so every lead is sorted the same way.
 */
export const BUDGETS = ['Under $2,500', '$2,500 – $7,500', '$7,500 – $10,000', '$10,000 – $15,000', 'Over $15,000'];
export const TIMELINES = ['As soon as possible', 'Within 3 months', 'In 3 to 6 months', 'Just exploring'];

/** The budget range a dollar figure falls in. */
export function budgetFor(amount) {
  if (amount < 2500) return BUDGETS[0];
  if (amount < 7500) return BUDGETS[1];
  if (amount < 10000) return BUDGETS[2];
  if (amount < 15000) return BUDGETS[3];
  return BUDGETS[4];
}
