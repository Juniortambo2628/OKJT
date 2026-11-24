import { Container, SECTION_OFFSET, SectionHeading } from '@okjt/site';
import { mediaUrl } from '../lib/media';

/** One organisation: its logo in white (own colours on hover), or its name until a logo is uploaded. */
function Tile({ client }) {
  const inner = client.logo
    ? <img src={mediaUrl(client.logo)} alt={client.name} loading="lazy" className="logo-light max-h-12 w-auto max-w-[70%] object-contain" />
    : <span className="px-3 text-center font-display text-lg font-light leading-tight text-white/85">{client.name}</span>;
  const className = 'group grid h-32 place-items-center rounded-3xl border border-white/10 bg-white/[0.03] transition-colors hover:border-accent/40 hover:bg-white/[0.06]';
  return client.website
    ? <a href={client.website} target="_blank" rel="noopener noreferrer" title={client.name} className={className}>{inner}</a>
    : <div title={client.name} className={className}>{inner}</div>;
}

/** The organisations served, as a grid of logos. */
export default function ClientLogos({ id = 'clients', clients, eyebrow = 'Clients', title = 'Organisations served', text }) {
  if (!clients.length) return null;
  return (
    <section id={id} className={`${SECTION_OFFSET} py-20`}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} text={text} />
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {clients.map((c) => <li key={c.id}><Tile client={c} /></li>)}
        </ul>
      </Container>
    </section>
  );
}
