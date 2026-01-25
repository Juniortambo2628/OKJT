import { useState, useEffect, useRef } from 'react';
import { trustedClientsApi } from '../../api/client';
import type { TrustedClient } from '../../types';

export default function TrustedClientsCarousel() {
  const [clients, setClients] = useState<TrustedClient[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await trustedClientsApi.getPublic();
        setClients(data);
      } catch {
        // Silently fail
      }
    };
    loadClients();
  }, []);

  // Don't render if no clients
  if (clients.length === 0) return null;

  // Duplicate clients for seamless loop
  const displayClients = [...clients, ...clients];

  return (
    <div 
      className="trusted-clients-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        ref={scrollRef}
        className={`trusted-clients-track ${isPaused ? 'paused' : ''}`}
      >
        {displayClients.map((client, index) => (
          <div key={`${client.id}-${index}`} className="trusted-client-item">
            {client.logo_url ? (
              <img 
                src={client.logo_url} 
                alt={client.name}
                className="trusted-client-logo"
              />
            ) : (
              <span className="trusted-client-name">{client.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
