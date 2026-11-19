import { Navigate } from 'react-router-dom';
import JourneyPage from '../components/Journey';
import BookingEmbed from '../components/BookingEmbed';
import { useContact, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

/** /book: a short call, booked on the studio's calendar. Without a booking link set, the Contact page. */
export default function Book() {
  const { setting, isLoading } = useSettings();
  const contact = useContact();
  if (!isLoading && !contact.booking) return <Navigate to="/contact" replace />;
  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: setting('hero_contact_media') || DEFAULT_HERO,
        eyebrow: 'Book a Call',
        title: 'Talk it <br />through first.',
        text: 'Twenty minutes on video about what needs building, at a time that suits you. The calendar shows times in your own time zone.',
        breadcrumbs: [{ to: '/', label: 'Home' }, { to: '/contact', label: 'Contact' }, { label: 'Book a call' }],
        secondary: { to: '/contact', label: 'Send a Brief Instead' },
      }}
      label="Booking a call"
      chapters={[
        {
          id: 'call',
          navLabel: 'Pick a time',
          when: 'Twenty minutes',
          title: 'Pick a time',
          intro: 'The studio works from Nairobi (UTC+3): the whole European working day, and mornings on the US East Coast.',
          aside: contact.booking ? <BookingEmbed url={contact.booking} /> : null,
          steps: [
            { title: 'The project', text: 'Who it is for, what it should do, and where it stands today.' },
            { title: 'Budget and timeline', text: 'A realistic range, and the date that matters.' },
            { title: 'Next steps', text: 'What a proposal would cover, and when you would receive it.' },
          ],
          tip: 'A few lines about the project in the booking form make the call more useful.',
        },
      ]}
    />
  );
}
