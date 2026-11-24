/* TenaFi: WiFi that turns guests into regulars, for short-term rentals, local
   businesses and events. Theme from TenaFi's brand: ink #1B1B1B, TenaFi
   yellow #FFD300, Figtree. */
(function () {
  window.PROMO = {
    title: 'TenaFi Promo',
    brand: { logo: 'logo.png', logoH: 1.5 },
    theme: {
      bg: ['#1E1E1E', '#0B0B0B'],
      glow: ['#FFD300', '#8A6A00'], glowAmt: .09,
      pattern: 'waves', patternColor: '#FFD300', patternAmt: .07,
      dust: '#FFD300', dustAmt: .8, dustAdditive: true,
      metal: 0x3a3a3c, rim: '#ffe680',
      screenBg: '#FFFFFF',
      shadow: 'rgba(0,0,0,.6)', vignette: .12,
      tapColor: 'rgba(138,106,0,A)',
      fontsHref: 'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,600;0,700;0,800;1,800&display=swap',
      fontLoads: ['800 40px Figtree', '600 40px Figtree', '400 20px Figtree'],
      css: {
        '--frame': '#000', '--bg': '#141414', '--ink': '#FFFFFF', '--accent': '#FFD300', '--eyebrow': '#FFD300', '--muted': '#A3A3A3',
        '--font-display': "'Figtree', system-ui, sans-serif", '--font-accent': "'Figtree', system-ui, sans-serif", '--font-body': "'Figtree', system-ui, sans-serif",
        '--accent-style': 'normal', '--accent-weight': '800', '--accent-size': '9.4cqw', '--display-weight': '700', '--display-size': '8.4cqw',
        '--chip-bg': 'rgba(255,255,255,.08)', '--chip-line': 'rgba(255,211,0,.35)', '--track': 'rgba(255,255,255,.18)',
      },
    },
    shots: ['wifi_page', 'whatsapp_campaign', 'reviews_dashboard', 'mpesa_extras', 'event_attendees', 'event_wifi_page', 'report', 'first_month',
      'd_home_00', 'd_home_02', 'd_home_05', 'd_home_06', 'd_home_08', 'd_hosts_01'],
    scenes: [
      { id: 'intro', name: 'TenaFi', t0: 0, t1: 2.15, pos: 'bottom', eyebrow: 'Guest WiFi, made to grow you', lines: [['serif', 'Turn your WiFi'], ['script', 'into growth.']] },
      { id: 'hero', device: 'laptop', name: 'TenaFi', t0: 2.5, t1: 5, eyebrow: 'For every place', lines: [['serif', 'Rentals, businesses'], ['script', '& events.']], chips: ['Short-term rentals', 'Local businesses', 'Events'] },
      { id: 'wifi', device: 'phone', name: 'WiFi page', t0: 5, t1: 7.5, eyebrow: 'Your WiFi page', lines: [['serif', 'Guests log in'], ['script', 'to your brand.']] },
      { id: 'campaign', device: 'phone', name: 'Campaigns', t0: 7.5, t1: 10, eyebrow: 'WhatsApp campaigns', lines: [['serif', 'Messages they'], ['script', 'actually read.']] },
      { id: 'reviews', device: 'phone', name: 'Reviews', t0: 10, t1: 12.5, eyebrow: 'Reviews & regulars', lines: [['serif', 'More reviews,'], ['script', 'more regulars.']] },
      { id: 'extras', device: 'phone', name: 'Extras', t0: 12.5, t1: 15, eyebrow: 'Extras', lines: [['serif', 'Sell extras,'], ['script', 'paid by M-Pesa.']] },
      { id: 'events', device: 'phone', name: 'Events', t0: 15, t1: 17.5, eyebrow: 'Events', lines: [['serif', 'Know who came'], ['script', 'to your event.']] },
      { id: 'setup', device: 'laptop', name: 'Set-up', t0: 17.5, t1: 20, eyebrow: 'Done for you', lines: [['serif', 'We install it,'], ['script', 'on your internet.']], chips: ['We install it', 'Guests opt in', 'We follow up'] },
      { id: 'results', device: 'laptop', name: 'Results', t0: 20, t1: 22.5, eyebrow: 'Results', lines: [['serif', 'Fill more'], ['script', 'empty nights.']], chips: ['Direct bookings', 'Repeat guests', 'Fewer OTA fees'] },
      { id: 'report', device: 'phone', name: 'Report', t0: 22.5, t1: 25, eyebrow: 'Every month', lines: [['serif', 'Watch your growth,'], ['script', 'month by month.']] },
      { id: 'pricing', device: 'laptop', name: 'Start free', t0: 25, t1: 27.8, eyebrow: 'Start free', lines: [['serif', 'Free for 3 months,'], ['script', 'the device is yours.']], chips: ['Then from KES 1,500 a month'] },
      { id: 'outro', name: 'TenaFi', t0: 28.2, t1: 29.75, pos: 'bottom', chapter: false, lines: [['serif', 'See TenaFi working'], ['small', 'tena-fi.com']] },
    ],
    screens: {
      hero: (c, u, h) => h.pan(c, 'd_home_02', u, 1.08),
      wifi: (c, u, h) => h.scroll(c, 'wifi_page', h.seg(u, .2, .95)),
      campaign: (c, u, h) => h.scroll(c, 'whatsapp_campaign', h.seg(u, .2, .95)),
      reviews: (c, u, h) => h.scroll(c, 'reviews_dashboard', u),
      extras: (c, u, h) => h.scroll(c, 'mpesa_extras', u),
      events: (c, u, h) => { const k = h.ease(h.seg(u, .4, .52)); if (k <= 0) h.scroll(c, 'event_wifi_page', h.seg(u, 0, .4) * .6); else if (k < 1) h.slideX(c, k, 'event_wifi_page', 'event_attendees'); else h.scroll(c, 'event_attendees', h.seg(u, .55, 1)); },
      setup: (c, u, h) => h.pan(c, 'd_home_05', u, 1.1),
      results: (c, u, h) => h.pan(c, 'd_hosts_01', u, 1.12),
      report: (c, u, h) => { const k = h.ease(h.seg(u, .45, .57)); if (k <= 0) h.scroll(c, 'first_month', u); else if (k < 1) h.slideX(c, k, 'first_month', 'report'); else h.scroll(c, 'report', h.seg(u, .6, 1)); },
      pricing: (c, u, h) => h.pan(c, 'd_home_08', u, 1.1),
    },
  };
})();
