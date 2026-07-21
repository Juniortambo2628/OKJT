<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class AdvancedSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $privacyPolicy = <<<'HTML'
<h2>1. Introduction</h2>
<p>OKJTechnologies ("we", "our", or "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website <strong>okjtech.co.ke</strong> (the "Site") and use our web development, UI/UX design, and digital engineering services (the "Services").</p>
<p>By accessing or using our Site and Services, you agree to the terms of this Privacy Policy. If you do not agree with the practices described herein, please do not use our Site or Services.</p>

<h2>2. Information We Collect</h2>
<h3>2.1 Information You Provide Directly</h3>
<p>We may collect the following categories of personal information when you interact with us:</p>
<ul>
<li><strong>Contact Information:</strong> First name, last name, email address, phone number, and company/organisation name, provided when you submit a consultation request, contact form, or newsletter subscription.</li>
<li><strong>Professional Information:</strong> Job title, sector of interest, organisation name, and preferred engagement timeframe, provided during consultation requests.</li>
<li><strong>Communication Content:</strong> The subject and body of messages you send to us through our forms or email.</li>
<li><strong>Account Information:</strong> Login credentials if you register for an account on our platform.</li>
</ul>

<h3>2.2 Information Collected Automatically</h3>
<p>When you visit our Site, we may automatically collect certain technical information, including:</p>
<ul>
<li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution.</li>
<li><strong>Usage Data:</strong> Pages visited, time spent on pages, referring URLs, click patterns, and navigation paths.</li>
<li><strong>Network Information:</strong> IP address, approximate geographic location (city/country level), and internet service provider.</li>
<li><strong>Cookies and Tracking Technologies:</strong> Information collected via cookies, web beacons, and similar technologies as described in our <a href="/cookies">Cookie Policy</a>.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use your personal information for the following purposes:</p>
<ul>
<li><strong>Service Delivery:</strong> To respond to your consultation requests, provide advisory services, and deliver market intelligence reports.</li>
<li><strong>Communication:</strong> To send you confirmation emails, respond to enquiries, provide updates on your requests, and send relevant industry insights you have opted into.</li>
<li><strong>Site Improvement:</strong> To analyse usage patterns and improve our Site's performance, content, and user experience.</li>
<li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, or security threats.</li>
<li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
<li><strong>Marketing:</strong> With your consent, to send newsletters and information about our services, events, and publications that may be of interest to you.</li>
</ul>

<h2>4. Legal Basis for Processing (GDPR)</h2>
<p>If you are located in the United Kingdom or European Economic Area, we process your personal data under the following legal bases:</p>
<ul>
<li><strong>Consent:</strong> Where you have given explicit consent (e.g., subscribing to our newsletter).</li>
<li><strong>Contractual Necessity:</strong> Where processing is necessary to perform a contract or respond to a pre-contractual request (e.g., consultation submissions).</li>
<li><strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate business interests (e.g., analytics, site security, service improvement), provided these do not override your rights.</li>
<li><strong>Legal Obligation:</strong> Where processing is required to comply with applicable law.</li>
</ul>

<h2>5. Data Sharing and Disclosure</h2>
<p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:</p>
<ul>
<li><strong>Service Providers:</strong> We may engage trusted third-party service providers who assist us in operating our Site, conducting our business, or servicing you (e.g., email delivery services, hosting providers, analytics platforms). These providers are contractually obligated to protect your data.</li>
<li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, safety, or property.</li>
<li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
</ul>

<h2>6. Data Retention</h2>
<p>We retain your personal information only for as long as necessary to fulfil the purposes for which it was collected, including satisfying legal, accounting, or reporting requirements. Consultation request data is typically retained for <strong>24 months</strong> from the date of submission unless a longer retention period is required by law or an ongoing business relationship.</p>

<h2>7. Your Rights</h2>
<p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
<ul>
<li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
<li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
<li><strong>Right to Erasure:</strong> Request deletion of your personal data where there is no compelling reason for continued processing.</li>
<li><strong>Right to Restrict Processing:</strong> Request that we limit the processing of your data in certain circumstances.</li>
<li><strong>Right to Data Portability:</strong> Request a machine-readable copy of your data for transfer to another service.</li>
<li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing.</li>
<li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, withdraw your consent at any time.</li>
</ul>
<p>To exercise any of these rights, please contact us at <strong>legal@okjtech.co.ke</strong>. We will respond within 30 days of receiving your request.</p>

<h2>8. International Data Transfers</h2>
<p>Your information may be transferred to and processed in countries outside of your country of residence, including countries that may not provide the same level of data protection. Where such transfers occur, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the relevant regulatory authorities.</p>

<h2>9. Data Security</h2>
<p>We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These measures include encryption of data in transit (TLS/SSL), secure server infrastructure, access controls, and regular security assessments. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

<h2>10. Children's Privacy</h2>
<p>Our Site and Services are not directed at individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected personal data from a child, we will take steps to delete such information promptly.</p>

<h2>11. Third-Party Links</h2>
<p>Our Site may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.</p>

<h2>12. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. The updated policy will be posted on this page with a revised "Last Updated" date. We encourage you to review this policy periodically. Material changes will be communicated via email or a prominent notice on our Site.</p>

<h2>13. Contact Us</h2>
<p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
<ul>
<li><strong>Email:</strong> legal@okjtech.co.ke</li>
<li><strong>Address:</strong> OKJTechnologies, Nairobi, Kenya</li>
</ul>
<p>If you are not satisfied with our response, you have the right to lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong> at <a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a>.</p>
HTML;

        $termsOfService = <<<'HTML'
<h2>1. Acceptance of Terms</h2>
<p>These Terms of Service ("Terms") govern your access to and use of the OKJTechnologies website at <strong>okjtech.co.ke</strong> (the "Site") and all related services, content, and functionality offered by OKJTechnologies ("we", "our", or "us"). By accessing or using our Site, you agree to be bound by these Terms. If you do not agree, you must not use our Site or Services.</p>

<h2>2. Description of Services</h2>
<p>OKJTechnologies provides professional advisory, strategic consulting, and market intelligence services focused on the technology space, e-commerce, and digital platforms, and related industries (the "Services"). Our Services include but are not limited to:</p>
<ul>
<li>Strategic advisory and consultation sessions</li>
<li>Market intelligence reports and analysis</li>
<li>Industry insights, articles, and publications</li>
<li>Case study documentation and best-practice frameworks</li>
</ul>
<p>The specific scope, deliverables, and terms of any engagement will be defined in a separate service agreement or statement of work between you and OKJTechnologies.</p>

<h2>3. User Eligibility</h2>
<p>You must be at least 18 years of age and have the legal capacity to enter into a binding agreement to use our Site and Services. By using our Site, you represent and warrant that you meet these requirements.</p>

<h2>4. User Accounts</h2>
<p>Certain features of our Site may require you to create an account. You are responsible for:</p>
<ul>
<li>Maintaining the confidentiality of your account credentials.</li>
<li>All activities that occur under your account.</li>
<li>Notifying us immediately of any unauthorised access or use of your account.</li>
</ul>
<p>We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably believe are being used for fraudulent or unauthorised purposes.</p>

<h2>5. Intellectual Property</h2>
<h3>5.1 Our Content</h3>
<p>All content on our Site, including but not limited to text, graphics, logos, images, data compilations, reports, case studies, software, and the overall design and layout (collectively, "Our Content"), is the property of OKJTechnologies or its licensors and is protected by United Kingdom and international copyright, trademark, and intellectual property laws.</p>

<h3>5.2 Limited Licence</h3>
<p>We grant you a limited, non-exclusive, non-transferable, revocable licence to access and use our Site and Our Content for your personal, non-commercial use, subject to these Terms. You may not:</p>
<ul>
<li>Reproduce, distribute, modify, create derivative works of, publicly display, or publicly perform Our Content without prior written consent.</li>
<li>Use Our Content for commercial purposes, including resale, redistribution, or incorporation into competing products or services.</li>
<li>Remove, alter, or obscure any copyright, trademark, or proprietary notices.</li>
<li>Use data mining, scraping, or similar automated methods to extract content from our Site.</li>
</ul>

<h3>5.3 Your Content</h3>
<p>By submitting content to us (e.g., through consultation forms, feedback, or communications), you grant us a non-exclusive, worldwide, royalty-free licence to use, process, and store such content as reasonably necessary to provide our Services and operate our business.</p>

<h2>6. Consultation Requests and Submissions</h2>
<p>When you submit a consultation request or contact form through our Site:</p>
<ul>
<li>You agree to provide accurate and complete information.</li>
<li>Submission of a request does not create a binding contract for services; it constitutes an expression of interest.</li>
<li>We will endeavour to respond to your request within 24–48 business hours, but response times may vary.</li>
<li>Any subsequent engagement will be formalised through a separate written agreement.</li>
</ul>

<h2>7. Newsletter and Communications</h2>
<p>By subscribing to our newsletter, you consent to receive periodic emails containing industry insights, company updates, and promotional content. You may unsubscribe at any time by clicking the "unsubscribe" link in any email or by contacting us directly. We process newsletter subscriptions in accordance with our <a href="/privacy">Privacy Policy</a>.</p>

<h2>8. Disclaimers</h2>
<h3>8.1 General Advisory Disclaimer</h3>
<p>The information, insights, and content published on our Site are provided for general informational purposes only. They do not constitute professional advice (financial, legal, investment, or otherwise). You should not act upon any information provided on this Site without seeking independent professional advice tailored to your specific circumstances.</p>

<h3>8.2 No Warranty</h3>
<p>Our Site and Services are provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement. We do not warrant that:</p>
<ul>
<li>The Site will be uninterrupted, error-free, or secure.</li>
<li>Any information or content is accurate, complete, or current.</li>
<li>Any defects will be corrected in a timely manner.</li>
</ul>

<h2>9. Limitation of Liability</h2>
<p>To the maximum extent permitted by applicable law, OKJTechnologies, its directors, officers, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunities, or goodwill, arising out of or in connection with your use of the Site or Services, whether based on warranty, contract, tort, negligence, or any other legal theory.</p>
<p>Our total aggregate liability for any claims arising from or related to these Terms or our Site shall not exceed the amount you have paid to us (if any) in the twelve (12) months preceding the event giving rise to the claim.</p>

<h2>10. Indemnification</h2>
<p>You agree to indemnify, defend, and hold harmless OKJTechnologies and its directors, officers, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to your use of the Site, violation of these Terms, or infringement of any third-party rights.</p>

<h2>11. Third-Party Links and Services</h2>
<p>Our Site may contain links to third-party websites, applications, or services that are not owned or controlled by us. We assume no responsibility for the content, privacy policies, or practices of any third-party sites. You access such sites at your own risk.</p>

<h2>12. Termination</h2>
<p>We reserve the right to suspend or terminate your access to our Site at any time, with or without notice, for any reason, including but not limited to violation of these Terms. Upon termination, your right to use the Site ceases immediately. Provisions of these Terms that by their nature should survive termination shall remain in effect.</p>

<h2>13. Governing Law and Jurisdiction</h2>
<p>These Terms shall be governed by and construed in accordance with the laws of <strong>England and Wales</strong>. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales. Nothing in these Terms affects your statutory rights as a consumer.</p>

<h2>14. Severability</h2>
<p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.</p>

<h2>15. Entire Agreement</h2>
<p>These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and OKJTechnologies regarding the use of our Site and supersede all prior agreements, understandings, and communications, whether written or oral.</p>

<h2>16. Changes to These Terms</h2>
<p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of the Site following any changes constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically.</p>

<h2>17. Contact Us</h2>
<p>If you have any questions about these Terms of Service, please contact us:</p>
<ul>
<li><strong>Email:</strong> legal@okjtech.co.ke</li>
<li><strong>Address:</strong> OKJTechnologies, Nairobi, Kenya</li>
</ul>
HTML;

        $cookiePolicy = <<<'HTML'
<h2>1. What Are Cookies?</h2>
<p>Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and supply information to site owners. Cookies can be "persistent" (remaining on your device until they expire or you delete them) or "session" cookies (deleted when you close your browser).</p>

<h2>2. How We Use Cookies</h2>
<p>OKJTechnologies uses cookies and similar tracking technologies on <strong>okjtech.co.ke</strong> (the "Site") for the following purposes:</p>

<h3>2.1 Strictly Necessary Cookies</h3>
<p>These cookies are essential for the operation of our Site. They enable core functionality such as security, authentication, and session management. Without these cookies, the Site cannot function properly.</p>
<table>
<thead>
<tr><th>Cookie Name</th><th>Purpose</th><th>Duration</th></tr>
</thead>
<tbody>
<tr><td>XSRF-TOKEN</td><td>Prevents cross-site request forgery attacks</td><td>Session</td></tr>
<tr><td>laravel_session</td><td>Maintains user authentication state</td><td>2 hours</td></tr>
<tr><td>cookie_consent</td><td>Stores your cookie consent preferences</td><td>12 months</td></tr>
</tbody>
</table>

<h3>2.2 Analytics and Performance Cookies</h3>
<p>These cookies help us understand how visitors interact with our Site by collecting and reporting information anonymously. This data allows us to improve our Site's layout, content, and performance.</p>
<table>
<thead>
<tr><th>Cookie Name</th><th>Purpose</th><th>Duration</th></tr>
</thead>
<tbody>
<tr><td>_ga</td><td>Google Analytics — Distinguishes unique visitors</td><td>2 years</td></tr>
<tr><td>_ga_*</td><td>Google Analytics — Maintains session state</td><td>2 years</td></tr>
<tr><td>_gid</td><td>Google Analytics — Distinguishes visitors within 24h</td><td>24 hours</td></tr>
<tr><td>_gat</td><td>Google Analytics — Throttles request rate</td><td>1 minute</td></tr>
</tbody>
</table>

<h3>2.3 Functional Cookies</h3>
<p>These cookies allow the Site to remember choices you make (such as your preferred language, region, or display settings) and provide enhanced, personalised features.</p>
<table>
<thead>
<tr><th>Cookie Name</th><th>Purpose</th><th>Duration</th></tr>
</thead>
<tbody>
<tr><td>theme_preference</td><td>Stores your light/dark mode preference</td><td>12 months</td></tr>
<tr><td>locale</td><td>Stores your language/region preference</td><td>12 months</td></tr>
</tbody>
</table>

<h3>2.4 Marketing and Targeting Cookies</h3>
<p>We may use these cookies to deliver advertisements more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and to measure the effectiveness of advertising campaigns. These cookies are typically placed by third-party advertising networks with our permission.</p>
<p>At present, OKJTechnologies does not deploy third-party marketing cookies. Should this change, this policy will be updated and your consent will be requested.</p>

<h2>3. Third-Party Cookies</h2>
<p>Some cookies on our Site are placed by third-party services that appear on our pages. We do not control the setting of these cookies. The third parties include:</p>
<ul>
<li><strong>Google Analytics:</strong> For website usage analysis. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
<li><strong>Google Fonts:</strong> For typography delivery. May set cookies related to font caching.</li>
</ul>

<h2>4. Managing Your Cookie Preferences</h2>
<p>You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in the following ways:</p>

<h3>4.1 Browser Settings</h3>
<p>Most web browsers allow you to control cookies through their settings. You can typically find these settings in the "Options", "Settings", or "Preferences" menu of your browser. The following links provide instructions for common browsers:</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471" target="_blank" rel="noopener">Apple Safari</a></li>
<li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener">Microsoft Edge</a></li>
</ul>

<h3>4.2 Opt-Out Tools</h3>
<p>You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-Out Browser Add-On</a>.</p>

<h3>4.3 Impact of Disabling Cookies</h3>
<p>Please be aware that disabling or blocking certain cookies may affect the functionality of our Site. Strictly necessary cookies cannot be disabled as they are essential for the Site to operate. If you disable other cookies, some features and services may not function as intended.</p>

<h2>5. Do Not Track Signals</h2>
<p>Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activity tracked. There is currently no universally accepted standard for how companies should respond to DNT signals. At this time, our Site does not respond to DNT signals, but we respect your privacy choices through the cookie management options described above.</p>

<h2>6. Updates to This Cookie Policy</h2>
<p>We may update this Cookie Policy from time to time to reflect changes in the cookies we use, changes in technology, or changes in applicable law. Any updates will be posted on this page with a revised "Last Updated" date. We encourage you to check this page periodically to stay informed about our use of cookies.</p>

<h2>7. Contact Us</h2>
<p>If you have any questions about our use of cookies or this Cookie Policy, please contact us:</p>
<ul>
<li><strong>Email:</strong> legal@okjtech.co.ke</li>
<li><strong>Address:</strong> OKJTechnologies, Nairobi, Kenya</li>
</ul>
HTML;

        // Default Email Templates (Blade source)
        $emailTemplateAdmin = <<<'HTML'
<div class="badge" style="background-color: #3b82f6; color: #ffffff;">New Action Required</div>
<h1>New Consultation Request</h1>
<p>A new consultation request has been submitted through the OKJTechnologies website.</p>

<div style="background-color: #050a1b; padding: 25px; border-radius: 8px; border: 1px solid #1e293b; margin: 20px 0;">
    <h3 style="color: #3b82f6; margin-top: 0;">Request Details:</h3>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px;">Name:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">{{ $requestData->first_name }} {{ $requestData->last_name }}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; color: #64748b;">Email:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #3b82f6;">{{ $requestData->email }}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; color: #64748b;">Subject:</td>
            <td style="padding: 8px 0; color: #ffffff;">{{ $requestData->subject ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0; color: #cbd5e1; line-height: 1.5;">{{ $requestData->message }}</td>
        </tr>
    </table>
</div>

<a href="{{ config('app.frontend_url') }}/admin/requests" class="button">View in Dashboard</a>

<p style="margin-top: 30px; font-size: 12px; color: #64748b;">This is an automated notification from the OKJTechnologies CMS.</p>
HTML;

        $emailTemplateUser = <<<'HTML'
<div class="badge">Request Received</div>
<h1>Hello, {{ $requestData->first_name }}!</h1>
<p>Thank you for reaching out to OKJTechnologies. We have successfully received your request for a consultation regarding <strong>&ldquo;{{ $requestData->subject ?? 'General Inquiry' }}&rdquo;</strong>.</p>

<p>Our advisory team is currently reviewing your details and will get back to you within 24-48 business hours to discuss your requirements and schedule a session.</p>

<div style="background-color: #050a1b; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-bottom: 10px; color: #3b82f6;">Your Message Summary:</h3>
    <p style="font-style: italic; margin: 0;">&ldquo;{{ $requestData->message }}&rdquo;</p>
</div>

<p>In the meantime, feel free to explore our latest market intelligence and insights:</p>

<a href="{{ config('app.frontend_url') }}/insights" class="button">View Latest Insights</a>

<p style="margin-top: 30px; font-size: 14px;">Best regards,<br>The OKJTechnologies Team</p>
HTML;

        $settings = [
            [
                'key' => 'privacy_policy',
                'value' => $privacyPolicy,
                'group' => 'legal',
                'type' => 'rich-text',
            ],
            [
                'key' => 'terms_of_service',
                'value' => $termsOfService,
                'group' => 'legal',
                'type' => 'rich-text',
            ],
            [
                'key' => 'cookie_policy',
                'value' => $cookiePolicy,
                'group' => 'legal',
                'type' => 'rich-text',
            ],
            [
                'key' => 'email_template_admin',
                'value' => $emailTemplateAdmin,
                'group' => 'email',
                'type' => 'code',
            ],
            [
                'key' => 'email_template_user',
                'value' => $emailTemplateUser,
                'group' => 'email',
                'type' => 'code',
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
