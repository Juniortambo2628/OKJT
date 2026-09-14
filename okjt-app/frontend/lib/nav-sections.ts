export interface NavSection {
    id: string
    label: string
}

export const HOME_NAV_SECTIONS: NavSection[] = [
    { id: 'hero', label: 'Intro' },
    { id: 'value-proposition', label: 'Approach' },
    { id: 'stats', label: 'Snapshot' },
    { id: 'services', label: 'Services' },
    { id: 'insights', label: 'Insights' },
    { id: 'cta', label: 'Contact' },
]

export const ABOUT_NAV_SECTIONS: NavSection[] = [
    { id: 'hero', label: 'Intro' },
    { id: 'about-mission', label: 'Approach' },
    { id: 'about-experience', label: 'Experience' },
    { id: 'about-values', label: 'Values' },
    { id: 'about-team', label: 'Studio' },
]

export const CONTACT_NAV_SECTIONS: NavSection[] = [
    { id: 'contact-hero', label: 'Intro' },
    { id: 'contact-form', label: 'Message' },
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
    { id: 'insights-grid', label: 'Articles' },
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

export const PROJECTS_INDEX_NAV_SECTIONS: NavSection[] = [
    { id: 'hero', label: 'Intro' },
    { id: 'flagship-projects', label: 'Flagship' },
    { id: 'client-projects', label: 'Client Work' },
]
