import JourneyPage from '../components/Journey';
import { useContact, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

/**
 * /how-we-work: the process, what it costs and when it is paid, for a client
 * anywhere. The starting price is a setting (Services > Starting price).
 */
export default function HowWeWork() {
  const { setting } = useSettings();
  const contact = useContact();
  const price = setting('starting_price');
  const talk = contact.booking
    ? { title: 'Book a call', text: 'Twenty minutes on video about what needs building, at a time that suits you.', to: '/book' }
    : { title: 'Send a brief', text: 'A few lines about the people the platform serves and what it should do.', to: '/contact' };

  return (
    <JourneyPage
      hero={{
        media: setting('hero_contact_media') || DEFAULT_HERO,
        eyebrow: 'How We Work',
        title: 'Clear stages, <br />a fixed price.',
        text: 'What happens from the first conversation to launch and after, what it costs, and when it is paid. The studio works from Nairobi with clients anywhere.',
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'How we work' }],
        cta: contact.booking ? { to: '/book', label: 'Book a Call' } : { to: '/contact', label: 'Start a Project' },
        secondary: { to: '/projects', label: 'See the Work' },
      }}
      glance={[
        ...(price ? [[price, 'projects start from']] : []),
        ['2 days', 'to a proposal'],
        ['4', 'payment milestones'],
        ['UTC+3', 'Nairobi time'],
      ]}
      label="How a project runs"
      chapters={[
        {
          id: 'start',
          navLabel: 'The first conversation',
          when: 'Week one',
          title: 'The first conversation',
          intro: 'Every project starts with the people it will serve. A short conversation maps them, then the work is written up as a proposal you can say yes or no to.',
          steps: [
            talk,
            { title: 'A fixed-price proposal', text: 'Within two business days: the scope, the stages, the timeline and one price in US dollars.' },
            { title: 'A contract, and an NDA if you need one', text: 'Signed before work starts, and before you share anything you would rather keep private.' },
          ],
          tip: 'The studio works on Nairobi time (UTC+3): the whole European working day, and mornings on the US East Coast.',
        },
        {
          id: 'payments',
          navLabel: 'Payments',
          when: 'Through the project',
          title: 'Paid in four milestones',
          intro: 'Each payment follows something you can see working, so you never pay far ahead of the work.',
          steps: [
            { title: '40% to start', text: 'Once the proposal and contract are signed.' },
            { title: '20% at the first deployment', text: 'When the first working version is live for you to try.' },
            { title: '20% when the scope is complete', text: 'Every feature in the proposal built and working.' },
            { title: '20% at handover', text: 'With the code, accounts and documentation in your hands.' },
          ],
          details: ['Prices in US dollars', 'Pay by Wise or PayPal', 'An invoice at each milestone'],
          detailsLabel: 'Paying from abroad',
        },
        {
          id: 'build',
          navLabel: 'The build',
          when: 'Weeks two onwards',
          title: 'While it is built',
          intro: 'Design and engineering run as one piece of work, with one point of contact from start to finish.',
          steps: [
            { title: 'A working link early', text: 'A staging version you can open and share from the first deployment.' },
            { title: 'Regular updates', text: 'What was done, what is next, and anything that needs a decision from you.' },
            { title: 'Changes agreed in writing', text: 'A new idea mid-way gets its cost and time agreed before it is built.' },
          ],
        },
        {
          id: 'after',
          navLabel: 'Launch and after',
          when: 'Launch',
          title: 'Launch, and after',
          intro: 'A platform is only useful once people rely on it, so the work continues past launch.',
          steps: [
            { title: 'Handover', text: 'The code, hosting accounts and documentation are yours.' },
            { title: 'Support after launch', text: 'Fixes, hosting care and new features as the platform grows.' },
          ],
        },
      ]}
      faqs={[
        { q: 'Do you work with clients outside Kenya?', a: 'Yes. Calls are on video, payments are in US dollars by Wise or PayPal, and Nairobi time overlaps the whole European working day and mornings on the US East Coast.' },
        { q: 'What does a project cost?', a: price ? `Projects start from ${price}. Every project gets one fixed price in its proposal, after the first conversation.` : 'Every project gets one fixed price in its proposal, after the first conversation.' },
        { q: 'Who owns the code?', a: 'You do. At handover you receive the code, the hosting accounts and the documentation.' },
      ]}
    />
  );
}
