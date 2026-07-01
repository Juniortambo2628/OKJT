export interface NavSection {
    id: string
    label: string
}

export const HOME_NAV_SECTIONS: NavSection[] = [
    { id: 'hero', label: 'Intro' },
    { id: 'value-proposition', label: 'Core Values' },
    { id: 'stats', label: 'Impact Metrics' },
    { id: 'services', label: 'Our Services' },
    { id: 'insights', label: 'Advisory Notes' },
    { id: 'cta', label: 'Get Started' },
]

export const ABOUT_NAV_SECTIONS: NavSection[] = [
    { id: 'hero', label: 'Intro' },
    { id: 'about-mission', label: 'Mission' },
    { id: 'about-values', label: 'Values' },
    { id: 'about-team', label: 'Team' },
    { id: 'about-cta', label: 'Contact' },
]

export const CONTACT_NAV_SECTIONS: NavSection[] = [
    { id: 'contact-hero', label: 'Intro' },
    { id: 'contact-form', label: 'Get in Touch' },
    { id: 'contact-info', label: 'Details' },
]

export const CLIENT_IMPACT_NAV_SECTIONS: NavSection[] = [
    { id: 'impact-hero', label: 'Intro' },
    { id: 'impact-projects', label: 'Projects' },
    { id: 'impact-testimonials', label: 'Testimonials' },
    { id: 'impact-clients', label: 'Clients' },
    { id: 'cta', label: 'Contact' },
]

export const INSIGHTS_NAV_SECTIONS: NavSection[] = [
    { id: 'hero', label: 'Intro' },
    { id: 'insights-grid', label: 'Research Notes' },
]

export const INSIGHT_DETAIL_NAV_SECTIONS: NavSection[] = [
    { id: 'insight-hero', label: 'Intro' },
    { id: 'insight-content', label: 'Article' },
]

export const SERVICE_DETAIL_NAV_SECTIONS: NavSection[] = [
    { id: 'hero', label: 'Intro' },
    { id: 'service-details', label: 'Overview' },
    { id: 'service-benefits', label: 'Benefits' },
    { id: 'service-cta', label: 'Contact' },
]
