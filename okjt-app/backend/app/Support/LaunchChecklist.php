<?php

namespace App\Support;

/**
 * The African-market launch checklist (/tools/launch-checklist): one list,
 * served to the page, written into its HTML for search engines, and sent by
 * email. The data protection points follow the Lawyers Hub / ADPI training
 * on Kenya's Data Protection Act (documentation/PROFESSIONAL_RECORD.md, §3);
 * nothing here is legal advice, and the page says so.
 */
class LaunchChecklist
{
    /** @return list<array{id: string, title: string, intro: string, items: list<array{id: string, title: string, text: string}>}> */
    public static function sections(): array
    {
        return [
            [
                'id' => 'data-protection',
                'title' => 'Data protection',
                'intro' => 'Kenya’s Data Protection Act, 2019 applies to anyone collecting personal data from people in Kenya, wherever the company is based.',
                'items' => [
                    ['id' => 'odpc-registration', 'title' => 'Register with the Data Protection Commissioner', 'text' => 'Most organisations that collect or process personal data must register with the Office of the Data Protection Commissioner (ODPC) as a data controller or processor. Check the ODPC’s registration thresholds; certificates are valid for 24 months.'],
                    ['id' => 'consent', 'title' => 'Ask for consent the way the Act defines it', 'text' => 'Consent must be express, unequivocal, free, specific and informed, and you should be able to show when and how each person gave it.'],
                    ['id' => 'sensitive-data', 'title' => 'Treat sensitive data with extra care', 'text' => 'Health status and other sensitive personal data come with stricter conditions. Collect only what the service needs, and limit who on your team can see it.'],
                    ['id' => 'privacy-notice', 'title' => 'Publish a plain-language privacy notice', 'text' => 'Say what you collect, why, how long you keep it, who you share it with, and how people can see, correct or delete their data.'],
                    ['id' => 'dpo', 'title' => 'Name a data protection officer if you need one', 'text' => 'The Act provides for data protection officers. Even where one isn’t required, name the person who answers data questions and requests.'],
                    ['id' => 'transfers', 'title' => 'Check transfers outside Kenya', 'text' => 'Hosting, email and analytics often store data abroad. The Act sets conditions for transfers outside Kenya, so know where each service keeps your data.'],
                    ['id' => 'enforcement', 'title' => 'Know what is at stake', 'text' => 'The Commissioner can issue enforcement and penalty notices, with administrative fines of up to KSh 5 million or 1% of turnover. Complaints are to be concluded within 90 days.'],
                ],
            ],
            [
                'id' => 'payments',
                'title' => 'Payments',
                'intro' => 'Most customers in Kenya pay by M-Pesa first and card second, and they expect a confirmation they can keep.',
                'items' => [
                    ['id' => 'mpesa', 'title' => 'Take M-Pesa through your own Paybill or Till', 'text' => 'Safaricom’s Daraja API lets your platform start an M-Pesa payment on the customer’s phone (STK Push) and receive the result. Use a Paybill or Till number registered to the business.'],
                    ['id' => 'confirm-by-callback', 'title' => 'Confirm payments from the provider, not the customer', 'text' => 'Mark an order paid only when the payment provider’s confirmation arrives, and keep the M-Pesa receipt code with the order.'],
                    ['id' => 'cards', 'title' => 'Offer cards through a provider that works in Kenya', 'text' => 'International visitors and businesses often pay by card. Choose a provider that settles to Kenyan accounts, such as Paystack.'],
                    ['id' => 'hold-no-money', 'title' => 'Avoid holding customers’ money', 'text' => 'If your platform collects money on behalf of others, pay it straight to the seller or use your provider’s split payouts. Holding funds for others can bring Central Bank of Kenya licensing into play.'],
                    ['id' => 'reconcile', 'title' => 'Reconcile automatically', 'text' => 'Match every payment to its order without anyone copying codes by hand, and send the customer a receipt by email, SMS or WhatsApp.'],
                ],
            ],
            [
                'id' => 'phones-and-networks',
                'title' => 'Phones and networks',
                'intro' => 'Many people will meet your product on a mid-range Android phone, on mobile data they pay for by the megabyte.',
                'items' => [
                    ['id' => 'test-real-phone', 'title' => 'Test on a mid-range phone over a slow connection', 'text' => 'Aim for the main content to appear within 2.5 seconds on a mid-range phone. The free site check reports this from Google’s own test.'],
                    ['id' => 'light-pages', 'title' => 'Keep pages light', 'text' => 'Compress images (WebP), load them only when they come into view, and avoid video that plays on its own.'],
                    ['id' => 'survive-drops', 'title' => 'Survive a dropped connection', 'text' => 'Save long forms as people go, retry quietly when the network comes back, and never charge twice if a payment page is reloaded.'],
                    ['id' => 'phone-numbers', 'title' => 'Accept phone numbers the way people write them', 'text' => 'Accept 07…, 01… and +254 formats and store one consistent format. A phone number is often a person’s main identity online.'],
                ],
            ],
            [
                'id' => 'reaching-people',
                'title' => 'Reaching people',
                'intro' => 'Messages people already read work better than a new app they must remember to open.',
                'items' => [
                    ['id' => 'whatsapp', 'title' => 'Meet people on WhatsApp', 'text' => 'A click-to-chat link costs nothing. Notifications through the WhatsApp Business Platform need the person’s opt-in and approved message templates.'],
                    ['id' => 'sms', 'title' => 'Keep SMS for what must arrive', 'text' => 'Sign-in codes, payment receipts and reminders reach people without data. Send them by SMS as well as, or instead of, email.'],
                    ['id' => 'languages', 'title' => 'Speak your users’ languages', 'text' => 'English and Swahili cover most users in Kenya. Translate the parts people act on first: sign-up, payment and help.'],
                ],
            ],
            [
                'id' => 'going-live',
                'title' => 'Going live',
                'intro' => 'A few checks before launch decide whether people can find the platform and trust it.',
                'items' => [
                    ['id' => 'domain', 'title' => 'Use a domain your users recognise', 'text' => 'A .co.ke or .ke domain (managed by KENIC, through an accredited registrar) signals a Kenyan business; a .com may suit an international audience better.'],
                    ['id' => 'search', 'title' => 'Make sure Google can read it', 'text' => 'Submit a sitemap in Google Search Console and run the free site check on your main pages before you announce the launch.'],
                    ['id' => 'backups', 'title' => 'Back up, and test a restore', 'text' => 'Daily backups stored away from the server, and one restore tried before launch, so a bad day stays a bad day.'],
                    ['id' => 'support-channel', 'title' => 'Decide who answers', 'text' => 'Name the person or channel that answers users in the first weeks, with an expected reply time.'],
                ],
            ],
        ];
    }

    public static function count(): int
    {
        return array_sum(array_map(fn ($s) => count($s['items']), self::sections()));
    }
}
