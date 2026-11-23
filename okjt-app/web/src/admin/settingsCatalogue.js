/**
 * Every setting the website reads, as the dashboard's Settings page shows it:
 * grouped by where it appears, each with a plain label, a hint saying what
 * it changes, and the right kind of field. `store` is the group it is saved
 * under (the API's own grouping, unchanged). Settings not listed here still
 * show, under "Other", so nothing becomes uneditable.
 *
 * Field types beyond the usual ones (fields.jsx): `lines` (a list of short
 * texts, one per row; `format: 'comma'` or `'json'` says how it is saved)
 * and `faq` (the FAQ assistant's answers).
 */
export const CATALOGUE = [
  {
    id: 'home',
    title: 'Home page',
    description: 'The headline at the top of the home page and the titles of its sections.',
    sections: [
      {
        title: 'Top of the page',
        fields: [
          { key: 'hero_tagline', store: 'homepage', label: 'Small line above the headline', placeholder: 'Design-led web engineering from Nairobi' },
          { key: 'hero_title_line1', store: 'homepage', label: 'Headline, first line', placeholder: 'Full-stack web' },
          { key: 'hero_title_line2', store: 'homepage', label: 'Headline, second line', placeholder: 'Built end to end.' },
          { key: 'hero_rotating_words', store: 'homepage', label: 'Words that take turns in the headline', type: 'lines', format: 'comma', item: 'word', hint: 'Shown one after another, in this order. Leave empty to show the first line only.' },
          { key: 'hero_home_video_1', store: 'general', label: 'Background clip or picture', type: 'media' },
          { key: 'hero_home_video_2', store: 'general', label: 'Spare background', type: 'media', hint: 'Used only when the one above is empty.' },
        ],
      },
      {
        title: '“About OKJTech” panel under the headline',
        fields: [
          { key: 'about_title', store: 'about', label: 'Title', type: 'textarea', rows: 2, hint: 'Each line here starts a new line on the page.' },
          { key: 'about_story', store: 'about', label: 'Text', type: 'textarea', rows: 3, hint: 'The first two sentences are shown.' },
        ],
      },
      {
        title: 'Approach section',
        fields: [
          { key: 'vp_section_tagline', store: 'homepage', label: 'Small label', placeholder: 'The Approach' },
          { key: 'vp_section_title', store: 'homepage', label: 'Title', placeholder: 'One continuous build, concept to production' },
          { key: 'vp_section_subtitle', store: 'homepage', label: 'Text under the title', type: 'textarea', rows: 3 },
          { key: 'bg_home_value_proposition', store: 'section_backgrounds', label: 'Background', type: 'media' },
        ],
      },
      {
        title: 'Other sections',
        fields: [
          { key: 'bg_home_stats', store: 'section_backgrounds', label: 'Figures section background', type: 'media' },
          { key: 'bg_home_services', store: 'section_backgrounds', label: 'Services section background', type: 'media' },
          { key: 'insights_tagline', store: 'homepage', label: 'Insights section: small label', placeholder: 'Insights' },
          { key: 'insights_title', store: 'homepage', label: 'Insights title', placeholder: 'Notes from the work', hint: 'Also the title at the top of the Insights page.' },
        ],
      },
    ],
  },
  {
    id: 'every-page',
    title: 'Every page',
    description: 'The invitation at the foot of every page, the footer and the logos.',
    sections: [
      {
        title: 'Invitation above the footer',
        fields: [
          { key: 'cta_badge', store: 'homepage', label: 'Small label', placeholder: 'Get in touch' },
          { key: 'cta_title', store: 'homepage', label: 'Title', placeholder: 'Have a platform in mind?' },
          { key: 'cta_subtitle', store: 'homepage', label: 'Text', type: 'textarea', rows: 3 },
          { key: 'bg_home_cta', store: 'section_backgrounds', label: 'Background behind it and the footer', type: 'media' },
        ],
      },
      {
        title: 'Footer and logos',
        fields: [
          { key: 'company_tagline', store: 'general', label: 'Footer description', type: 'textarea', rows: 3, hint: 'The short description of OKJTechnologies in the footer.' },
          { key: 'logo_dark', store: 'branding', label: 'Logo on dark backgrounds', type: 'image', hint: 'A light (white or cream) logo with a transparent background.' },
          { key: 'logo_light', store: 'branding', label: 'Logo on light backgrounds', type: 'image', hint: 'A dark logo with a transparent background.' },
        ],
      },
    ],
  },
  {
    id: 'pictures',
    title: 'Page pictures',
    description: 'The photo or clip at the top of each page, and behind some of their sections.',
    sections: [
      {
        title: 'Top of each page',
        fields: [
          { key: 'hero_about_media', store: 'hero-media', label: 'About', type: 'media' },
          { key: 'hero_products_media', store: 'hero-media', label: 'Our approach', type: 'media' },
          { key: 'hero_projects_media', store: 'hero-media', label: 'Projects', type: 'media' },
          { key: 'hero_services_media', store: 'hero-media', label: 'Services, the cost estimator and the launch checklist', type: 'media' },
          { key: 'hero_insights_media', store: 'hero-media', label: 'Insights and each article', type: 'media' },
          { key: 'hero_client_impact_media', store: 'hero-media', label: 'Client impact', type: 'media' },
          { key: 'hero_contact_media', store: 'hero-media', label: 'Contact, Book a call, How we work and the site check', type: 'media' },
        ],
      },
      {
        title: 'Behind sections',
        fields: [
          { key: 'bg_about_mission', store: 'hero-media', label: 'About: mission', type: 'media' },
          { key: 'bg_about_values', store: 'hero-media', label: 'About: values', type: 'media' },
          { key: 'bg_about_team', store: 'hero-media', label: 'About: team', type: 'media' },
          { key: 'bg_client_impact_testimonials', store: 'hero-media', label: 'Client impact: testimonials', type: 'media' },
          { key: 'bg_contact_form', store: 'hero-media', label: 'Contact: the form', type: 'media' },
        ],
      },
      {
        title: 'Service categories',
        description: 'Shown for a category on the Services page and in the menu when none of its services has a picture.',
        fields: [
          { key: 'bg_services_web_development', store: 'hero-media', label: 'Web Development', type: 'media' },
          { key: 'bg_services_ui_ux_design', store: 'hero-media', label: 'UI/UX Design', type: 'media' },
          { key: 'bg_services_digital_strategy', store: 'hero-media', label: 'Digital Strategy', type: 'media' },
        ],
      },
    ],
  },
  {
    id: 'services',
    title: 'Services and Insights',
    description: 'The introductions of the Services and Insights pages, and the starting price. The cost estimator’s prices have their own page: Setup › Cost estimator.',
    sections: [
      {
        fields: [
          { key: 'services_title', store: 'homepage', label: 'Services page title', placeholder: 'Web applications, designed and built end to end.' },
          { key: 'services_subtitle', store: 'services', label: 'Services page introduction', type: 'textarea', rows: 3 },
          { key: 'starting_price', store: 'services', label: 'Projects start from', placeholder: '$2,000', hint: 'Shown on Services, How we work and the cost estimator. Leave empty to hide it.' },
          { key: 'insights_subtitle', store: 'insights', label: 'Insights page introduction', type: 'textarea', rows: 3 },
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact details',
    description: 'How people reach OKJTechnologies: shown on the Contact page, in the footer and in every email.',
    sections: [
      {
        fields: [
          { key: 'contact_email', store: 'contact', label: 'Email address', type: 'email' },
          { key: 'contact_phone', store: 'contact', label: 'Phone number', placeholder: '+254 705 883227' },
          { key: 'contact_address', store: 'contact', label: 'Where you are', type: 'textarea', rows: 2, placeholder: 'Nairobi, Kenya' },
          { key: 'booking_url', store: 'contact', label: 'Booking page', type: 'url', placeholder: 'https://cal.com/…', hint: 'Your Cal.com (or other) booking link, used by the /book page and the “Book a Call” buttons.' },
        ],
      },
      {
        title: 'Social profiles',
        description: 'Full addresses. Leave any empty to hide its icon.',
        fields: [
          { key: 'social_linkedin', store: 'contact', label: 'LinkedIn', type: 'url' },
          { key: 'social_github', store: 'contact', label: 'GitHub', type: 'url' },
          { key: 'social_twitter', store: 'contact', label: 'X (Twitter)', type: 'url' },
          { key: 'social_facebook', store: 'contact', label: 'Facebook', type: 'url' },
        ],
      },
    ],
  },
  {
    id: 'widgets',
    title: 'WhatsApp and FAQ',
    description: 'The WhatsApp button and the FAQ assistant in the corner of every page.',
    sections: [
      {
        title: 'WhatsApp button',
        fields: [
          { key: 'whatsapp_enabled', store: 'widgets', label: 'Show the WhatsApp button', type: 'switch' },
          { key: 'whatsapp_number', store: 'widgets', label: 'WhatsApp number', placeholder: '+254705883227', hint: 'With the country code.' },
          { key: 'whatsapp_message', store: 'widgets', label: 'Message it starts with', type: 'textarea', rows: 2 },
        ],
      },
      {
        title: 'FAQ assistant',
        description: 'Visitors type a question; the assistant shows the answer whose words match it best.',
        fields: [
          { key: 'chatbot_quick_replies', store: 'widgets', label: 'Suggested questions', type: 'lines', format: 'json', item: 'question', hint: 'Shown as buttons when the assistant opens.' },
          { key: 'chatbot_faq_data', store: 'widgets', label: 'Answers', type: 'faq' },
        ],
      },
      {
        title: 'Site check tool',
        fields: [
          { key: 'pagespeed_api_key', store: 'widgets', label: 'Google PageSpeed API key', hint: 'From Google Cloud, restricted to the PageSpeed Insights API and okjtech.co.ke. Without it the speed scores often fail.' },
        ],
      },
    ],
  },
  {
    id: 'emails',
    title: 'Emails',
    description: 'The reply a visitor receives after sending a brief. The design and the rest of the email are fixed; contact details come from Contact details.',
    sections: [
      {
        fields: [
          { key: 'enquiry_reply_subject', store: 'email', label: 'Subject line', placeholder: 'Your brief reached OKJTechnologies', hint: 'Write {first name} or {subject} where the visitor’s details should go.' },
          { key: 'enquiry_reply_message', store: 'email', label: 'Opening message', type: 'rich', hint: 'Comes after “Hello <their first name>,” and before a copy of their message and the Book a Call button. {first name} and {subject} work here too.' },
        ],
      },
    ],
  },
  {
    id: 'legal',
    title: 'Legal documents',
    description: 'Privacy policy, terms of service and cookie policy. Headings become the document’s sections.',
    sections: [
      {
        fields: [
          { key: 'privacy_policy', store: 'legal', label: 'Privacy policy', type: 'rich', tall: true },
          { key: 'terms_of_service', store: 'legal', label: 'Terms of service', type: 'rich', tall: true },
          { key: 'cookie_policy', store: 'legal', label: 'Cookie policy', type: 'rich', tall: true },
        ],
      },
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance mode',
    description: 'Show a maintenance page to visitors while you work. You still see the site while signed in.',
    sections: [
      {
        fields: [
          { key: 'maintenance_active', store: 'maintenance', label: 'Show the maintenance page', type: 'switch' },
          { key: 'maintenance_title', store: 'maintenance', label: 'Title', placeholder: 'Back shortly' },
          { key: 'maintenance_description', store: 'maintenance', label: 'Text', type: 'textarea', rows: 2 },
          { key: 'maintenance_estimated_back', store: 'maintenance', label: 'Back when', placeholder: 'around 3 pm EAT', hint: 'Shown as “Back around 3 pm EAT”. Leave empty to say nothing.' },
        ],
      },
    ],
  },
];

/** Settings with a page of their own, not shown in Settings. */
export const OWN_PAGE = ['estimator_config'];

/** key → its catalogue entry. */
export const FIELDS = Object.fromEntries(CATALOGUE.flatMap((g) => g.sections.flatMap((s) => s.fields.map((f) => [f.key, f]))));
