/* Naoa: wedding planning for couples and planners. Theme from Naoa's own
   brand: ink #2B221C, warm ivory paper, cinnamon accent, Cormorant Garamond
   and Great Vibes over Lato. */
(function () {
  const seqN = (p, n) => Array.from({ length: n }, (_, i) => `${p}_${String(i).padStart(2, '0')}`);
  window.PROMO = {
    title: 'Naoa Promo',
    brand: { logo: 'logo.png', logoH: 2.6 },
    theme: {
      bg: ['#FFFDF9', '#F3EADF'],
      glow: ['#FFDDB0', '#9B4621'], glowAmt: .1,
      pattern: 'diamond', patternColor: '#B8936C', patternAmt: .09,
      dust: '#C8A07A',
      metal: 0xc9b59a,
      screenBg: '#FBF8F3',
      shadow: 'rgba(70,50,35,.34)',
      tapColor: 'rgba(155,70,33,A)',
      fontsHref: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Great+Vibes&family=Lato:wght@400;700&display=swap',
      fontLoads: ['500 40px "Cormorant Garamond"', '40px "Great Vibes"', '700 20px Lato'],
      css: {
        '--frame': '#1f1915', '--bg': '#FBF8F3', '--ink': '#2B221C', '--accent': '#9B4621', '--eyebrow': '#B8936C', '--muted': '#8B7B6B',
        '--font-display': "'Cormorant Garamond', Georgia, serif", '--font-accent': "'Great Vibes', cursive", '--font-body': "'Lato', system-ui, sans-serif",
        '--accent-style': 'normal', '--accent-weight': '400', '--accent-size': '11.6cqw', '--display-weight': '500', '--display-size': '8.4cqw',
        '--chip-bg': 'rgba(255,255,255,.75)', '--chip-line': 'rgba(184,147,108,.35)',
      },
    },
    shots: [
      ...seqN('clip_setup', 36), ...seqN('clip_designer', 36), ...seqN('clip_guests', 36), ...seqN('clip_seating', 36), ...seqN('clip_site', 36), ...seqN('clip_rsvp', 30),
      'plan_wizard', 'plan_review', 'budget', 'budget_charts', 'team', 'checkin', 'dashboard', 'invitation_m', 'site_m', 'programme_m', 'gifts_m',
    ],
    scenes: [
      { id: 'intro', name: 'Naoa', t0: 0, t1: 2.15, pos: 'bottom', eyebrow: 'Weddings, planned together', lines: [['serif', 'Plan your wedding'], ['script', 'with Naoa']] },
      { id: 'setup', device: 'laptop', name: 'Set up', t0: 2.5, t1: 5, eyebrow: 'Start in minutes', lines: [['serif', 'Your wedding,'], ['script', 'set up in minutes']], chips: ['Your date', 'Your venue', 'Your team'] },
      { id: 'plan', device: 'laptop', name: 'Plan', t0: 5, t1: 7.5, eyebrow: 'Your traditions', lines: [['serif', 'A plan that knows'], ['script', 'your traditions']], chips: ['Ruracio', 'Ayie', 'Church', 'Civil'] },
      { id: 'guests', device: 'laptop', name: 'Guests', t0: 7.5, t1: 10, eyebrow: 'Guest list', lines: [['serif', 'Every guest,'], ['script', 'in one list']], chips: ['RSVPs', 'Plus-ones', 'Groups'] },
      { id: 'designer', device: 'laptop', name: 'Invitations', t0: 10, t1: 12.5, eyebrow: 'Invitations', lines: [['serif', 'Design invitations'], ['script', 'your way']], chips: ['Cards', 'Save the date', 'Thank-yous'] },
      { id: 'rsvp', device: 'phone', name: 'RSVP', t0: 12.5, t1: 15, eyebrow: 'For your guests', lines: [['serif', 'Guests reply'], ['script', 'from their phone']] },
      { id: 'seating', device: 'laptop', name: 'Seating', t0: 15, t1: 17.5, eyebrow: 'Seating', lines: [['serif', 'Seating plans,'], ['script', 'drag and drop']], chips: ['Tables', 'Families', 'Friends'] },
      { id: 'budget', device: 'laptop', name: 'Budget', t0: 17.5, t1: 20, eyebrow: 'Budget', lines: [['serif', 'Every shilling,'], ['script', 'in its place']], chips: ['Budget', 'Payments', 'Vendors'] },
      { id: 'site', device: 'phone', name: 'Website', t0: 20, t1: 22.5, eyebrow: 'Wedding website', lines: [['serif', 'A website'], ['script', 'for your guests']] },
      { id: 'team', device: 'laptop', name: 'Team', t0: 22.5, t1: 25, eyebrow: 'Planners & family', lines: [['serif', 'Your whole team,'], ['script', 'on one page']], chips: ['Planners', 'Family', 'Vendors'] },
      { id: 'day', device: 'laptop', name: 'On the day', t0: 25, t1: 27.8, eyebrow: 'On the day', lines: [['serif', 'Check guests in'], ['script', 'at the door']], chips: ['QR check-in', 'Live programme'] },
      { id: 'outro', name: 'Naoa', t0: 28.2, t1: 29.75, pos: 'bottom', chapter: false, lines: [['serif', 'Start planning today'], ['small', 'naoa.okjtech.co.ke']] },
    ],
    screens: {
      setup: (c, u, h) => h.seq(c, 'clip_setup', 36, u),
      plan: (c, u, h) => h.pan2(c, 'plan_wizard', 'plan_review', u, .42, .62, 1.08),
      guests: (c, u, h) => h.seq(c, 'clip_guests', 36, u),
      designer: (c, u, h) => h.seq(c, 'clip_designer', 36, h.seg(u, 0, 1) * .9 + .05),
      rsvp: (c, u, h) => { h.cover(c, 'invitation_m'); const k = h.ease(h.seg(u, .22, .36)); if (k > 0 && k < 1) h.slideX(c, k, 'invitation_m', 'clip_rsvp_00'); if (k >= 1) h.seq(c, 'clip_rsvp', 30, h.seg(u, .36, 1)); },
      seating: (c, u, h) => h.seq(c, 'clip_seating', 36, u),
      budget: (c, u, h) => h.pan2(c, 'budget', 'budget_charts', u, .42, .62, 1.08),
      site: (c, u, h) => { const a = h.ease(h.seg(u, .3, .42)), b = h.ease(h.seg(u, .64, .76));
        if (a <= 0) h.cover(c, 'site_m'); else if (a < 1) h.slideX(c, a, 'site_m', 'programme_m'); else if (b <= 0) h.cover(c, 'programme_m'); else if (b < 1) h.slideX(c, b, 'programme_m', 'gifts_m'); else h.cover(c, 'gifts_m'); },
      team: (c, u, h) => h.pan(c, 'team', u, 1.1),
      day: (c, u, h) => h.pan2(c, 'checkin', 'dashboard', u, .42, .62, 1.08),
    },
  };
})();
