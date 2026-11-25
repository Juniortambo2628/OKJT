# Upgrading

## 0.22.0 → 0.22.1 (laravel-kit 0.22.1)

The kit schedules `okjt:mpesa-reconcile` only in projects that declare the
M-Pesa switch (`okjt.mpesa.switch`, default `mpesa`, in `okjt.switches`).
In 0.21 and 0.22.0 it was scheduled everywhere, so a project not using
M-Pesa started a PHP process every minute that did nothing. Nothing to do;
`composer update okjt/laravel-kit`.

## 0.21 → 0.22 (laravel-kit 0.22.0, create-okjt-app 0.1.21)

The parser for pasted M-Pesa and bank messages (R5), lifted from Naoa with its
tests. `composer require okjt/laravel-kit:^0.22.0`; no migration. The npm
packages are unchanged.

- `app(Okjt\Kit\Payments\MessageParser::class)->parse($pasted)` splits
  pasted text into messages and returns one record each: `kind`, `amount`,
  `payee`, `phone`, `paybill`/`till`/`account`, `bank`/`bank_account`,
  `mpesa_ref`/`bank_ref`, `at` (`Y-m-d H:i`, or `Y-m-d` without a time),
  `cost`, `raw`. `parseOne($message)` reads one. Kinds: Safaricom's own
  (`mpesa_send`, `mpesa_till`, `mpesa_paybill`, `mpesa_to_bank`), banks'
  (`bank_debit`, `bank_to_mpesa`, `bank_to_paybill`, `bank_to_till`,
  `pesalink`), `transfer_slip`, `reversal` (with `reverses`), `info`
  (Fuliza) and `unknown` (left for a person). No AI and no network.
- Matching the records to what was owed stays the project's (Naoa's
  `MessageReconciler` is about a wedding budget).
- Naoa: delete `Services/Payments/MessageParser.php` and use the kit's.
  Najenga's `Receipts/PaymentMessages` reads OCR text from photos (several
  readings, labels between messages) and stays Najenga's for now; it is a
  kit candidate for a later release.

## 0.20 → 0.21 (dashboard 0.21.0, laravel-kit 0.21.0, create-okjt-app 0.1.20)

M-Pesa prompts (R5), from Naoa, naoa-dt and Tena-host. Nothing changes and
nothing is sent until you switch it on. `npm i @okjt/dashboard@^0.21.0` and
`composer require okjt/laravel-kit:^0.21.0`, then publish and run the
migrations (new `okjt_mpesa_accounts` and `okjt_mpesa_payments` tables).
`@okjt/ui` and `@okjt/site` are unchanged.

- **Switch it on**: declare the switch in `okjt.switches`
  (`'mpesa' => ['label' => 'M-Pesa payments', 'default' => false]`) and turn
  it on in `<AdminSwitches />`. `Mpesa::start()` refuses while it is off;
  answers to prompts already sent are still recorded.
- **Keys and paybill**: `<AdminMpesaSettings />` (saved encrypted, never
  returned) or `.env`: `OKJT_MPESA_ENV`, `OKJT_MPESA_CONSUMER_KEY`,
  `OKJT_MPESA_CONSUMER_SECRET`, `OKJT_MPESA_SHORTCODE`, `OKJT_MPESA_TYPE`
  (`paybill`/`till`), `OKJT_MPESA_TILL_NUMBER`, `OKJT_MPESA_PASSKEY`. What is
  saved in the admin wins.
- **Routes**: `POST /mpesa/callback/{token}` → `MpesaController@callback`
  (outside auth and CSRF; must match `okjt.mpesa.callback_path`, default
  `api/mpesa/callback`; set `OKJT_MPESA_CALLBACK_BASE` if the API isn't at
  `APP_URL`); signed in, `GET /mpesa/payments/{id}` → `@show`; behind your
  superadmin middleware `GET`/`PUT /admin/mpesa` →
  `MpesaSettingsController@show`/`@update`.
- **Starting a prompt** is your endpoint, since it knows what is paid for:
  `app(Mpesa::class)->start($phone, $amount, 'ORDER42', 'Extras', $order, [], $user->id)`
  returns the `MpesaPayment` (`present()` for the page). An `MpesaException`
  answers with its own message and status (422, 429, 502, 503).
- **Applying a payment**: listen for `MpesaPaymentSettled` and check
  `$e->payment->isPaid()` and `$e->payment->payable`. It is sent once per
  payment, except that a timeout the kit inferred can later be followed by
  `paid` (the money moved).
- **What is checked**: each prompt has its own callback address; an answer
  counts only if its CheckoutRequestID matches, and a paid answer only if
  its amount equals the prompt's (otherwise it is recorded as `failed`,
  "Amount mismatch"). Logs hold the payment id, never the body.
- **Lost answers**: the kit schedules `okjt:mpesa-reconcile` every minute
  (your scheduler must run; `okjt.mpesa.reconcile = false` to stop it). It
  asks M-Pesa about prompts pending for over a minute and times out those
  left unanswered after `pending_timeout` (300 s).
- **Each workspace's own paybill**: `okjt.mpesa.per_workspace = true` (off
  by default). A workspace's owners save theirs (`GET`/`PUT /mpesa/shortcode`
  → `@workspaceShow`/`@workspaceUpdate`); staff approve it (`POST
  /admin/mpesa/workspaces/{workspace}/approve`, `/revoke`). Prompts go only
  to an approved paybill of the workspace's own, never the app's.
- **Page**: `<StkPrompt send={...} amount={...} payee="..." onPaid={...} />`
  from `@okjt/dashboard`.
- **Tests**: `$this->app->instance(MpesaGateway::class, $fake = new FakeMpesaGateway)`;
  `$fake->callbackBody()` builds M-Pesa's answer to the last prompt.
- Naoa: `StkPushService` → the kit with `per_workspace` (vendors'
  storefronts become workspace rows; `stk_status` live → approved);
  `BudgetPayment` from `MpesaPaymentSettled`. naoa-dt: stays as it is
  (live wedding). Tena-host: subscriptions, events and extras through
  `start()` and `MpesaPaymentSettled`; it doesn't use laravel-kit yet
  (Needs Kevin).

## 0.19 → 0.20 (site 0.5.0, dashboard 0.20.0, laravel-kit 0.20.0, create-okjt-app 0.1.19)

Privacy (S7, the last of R4), from Naoa and Tena-host: requests from people
to delete their data, how long data is kept, and links in emails that ask
before they change anything. Nothing changes until you use it, and nothing
is erased without a person unless you choose that.
`npm i @okjt/site@^0.5.0 @okjt/dashboard@^0.20.0` and
`composer require okjt/laravel-kit:^0.20.0`, then publish and run the
migrations (a new `okjt_erasure_requests` table). `@okjt/ui` stays at 0.8.

- **Routes**: `POST /erasure-requests` → `PrivacyController@request` with a
  throttle (`->middleware('throttle:5,60')`), outside any auth group;
  behind your admin middleware `GET /admin/privacy` → `@index`, `POST
  /admin/privacy/erasure-requests` → `@store`, `POST
  /admin/privacy/erasure-requests/{id}/complete` → `@complete`.
- **What erasing removes**: each `Okjt\Kit\Privacy\Eraser` in
  `okjt.privacy.erasers`. The kit's own deletes contact messages from the
  person's email. Add one class per place your app keeps people's data:
  `erase($request)` gets the name, email, phone and `subject_id` (your own
  record's id, which the admin can give when erasing) and returns a short
  line for the outcome, or null. They run in one transaction, so one that
  fails erases nothing and leaves the request open. Anonymise rows other
  records count on, and write with `DB::table` where a model records
  versions, or the history keeps a copy.
- **How long data is kept**: each `RetentionRule` in
  `okjt.privacy.retention` (label, period in words, how many are due,
  purge). The kit's follows `okjt.contact.keep_days`. Schedule
  `Schedule::command('okjt:retention')->daily();` (`--dry-run` to see).
- **Overdue requests**: by default the daily run lists them and leaves them
  to a person. `okjt.privacy.auto_complete = true` erases them at the
  deadline, as Naoa does today.
- **Who hears of a request**: `OKJT_PRIVACY_EMAIL`, else the
  `contact_email` site setting (`okjt.privacy.received_notification` to
  send your own). `erasure_days` (14) sets the due date.
- **Public form**: `<ErasureRequestForm />` from `@okjt/site` (posts to
  `/api/erasure-requests`; `phone={false}` for email only, `submit`,
  `labels`), for the privacy page.
- **Admin**: `<AdminPrivacy />` from `@okjt/dashboard`. Erasing and declining
  go in the audit log by request number only.
- **Confirmed links**: `Route::confirmedLink('/u/{token}', Unsubscribe::class,
  'unsubscribe')` with a class implementing `ConfirmedAction` (`prompt`
  says what the page asks, or null for a bad token; `act` does it). The GET
  asks and the button POSTs to the same signed address; mail it with
  `URL::signedRoute('unsubscribe', ['token' => ...])`. The page is
  self-contained (`okjt.confirmed_link.view` for your own).
- Naoa: `ErasureRequest` and the request half of `PrivacyController` → the
  kit's (`per_workspace` for weddings, `auto_complete` on); `GuestEraser`
  becomes an `Eraser`, and the guest and financial dates become
  `RetentionRule`s (warning owners first stays Naoa's). Its open requests
  need a one-off copy. Tena-host: the campaign and review unsubscribe
  pages can move onto `confirmedLink`, but it doesn't use laravel-kit yet,
  so that waits on adding it (Needs Kevin).

## 0.18 → 0.19 (site 0.4.0, dashboard 0.19.0, laravel-kit 0.19.0, create-okjt-app 0.1.18)

The contact form (S6, step 5, the last), from Naoa and Tena-host. Nothing
changes until you use it. `npm i @okjt/site@^0.4.0 @okjt/dashboard@^0.19.0`
and `composer require okjt/laravel-kit:^0.19.0`, then publish and run the
migrations (a new `okjt_contact_messages` table). `@okjt/ui` stays at 0.8.

- **Routes**: `POST /contact` → `ContactMessageController@store` with a
  throttle (`->middleware('throttle:5,5')`), outside any auth group; behind
  your admin middleware `GET /admin/contact-messages` → `@index`,
  `GET /admin/contact-messages/{id}` → `@show`, `POST
  /admin/contact-messages/{id}/reply` → `@reply`, `PATCH
  /admin/contact-messages/{id}` → `@update`, `DELETE
  /admin/contact-messages/{id}` → `@destroy`.
- **Who hears of a message**: `OKJT_CONTACT_EMAIL` (or
  `okjt.contact.notify_email`), else the `contact_email` site setting. A
  failed email never loses the message. The two emails are notifications
  you can replace (`okjt.contact.received_notification`,
  `reply_notification`); replies need working mail.
- **Personal data**: no IP address is kept. Set `okjt.contact.keep_days`
  (e.g. 365) and schedule `php artisan model:prune` to delete old messages.
- **Public form**: `<ContactForm />` from `@okjt/site` (posts to
  `/api/contact`; `topics`, `subject`, `submit`, `labels`). Set
  `okjt.contact.topics` to the same values to refuse others.
- **Inbox**: `<AdminContactMessages />` from `@okjt/dashboard`.
- Tena-host: `ContactController` (email only, nothing kept) → the kit's,
  which keeps the message too. Naoa: `Enquiry` → the kit's
  (`okjt.contact.per_workspace` for its weddings); its old enquiries need
  a one-off copy. TFE: `ContactMessage` (`contact_submissions`) likewise.

## 0.17 → 0.18 (dashboard 0.18.0, laravel-kit 0.18.0, create-okjt-app 0.1.17)

FAQs (S6, step 4), from Naoa. Nothing changes until you use them.
`npm i @okjt/dashboard@^0.18.0` and `composer require
okjt/laravel-kit:^0.18.0`, then publish and run the migrations (a `faqs`
table; if you have one, only a `group` column is added). `@okjt/ui` stays
at 0.8.

- **Server**: `Okjt\Kit\Content\Faq` (question, answer, order, group; in
  the version history as module `faqs`). Routes: `GET /faqs` →
  `FaqController@index` (public, `?group=pricing` for one page's list);
  behind your admin middleware `POST /faqs` → `@store`, `PUT
  /faqs/reorder` → `@reorder` (`ids` first to last), `PUT /faqs/{id}` →
  `@update`, `DELETE /faqs/{id}` → `@destroy`. Register `reorder` before
  `{id}`.
- **Screen**: `<AdminFaqs />`, or `<AdminFaqs group="pricing" />`.
- **Per workspace**: `okjt.faqs.per_workspace => true` (Naoa's weddings;
  set `okjt.faqs.table` if yours isn't `faqs`).
- Naoa: `App\Models\Faq` / `FaqController` → the kit's, same table; its
  reorder sends `ids` in order instead of id/order pairs.

## 0.16 → 0.17 (dashboard 0.17.0, laravel-kit 0.17.0, create-okjt-app 0.1.16)

Page photos (S6, step 3), from Naoa. Nothing changes until you use them.
`npm i @okjt/dashboard@^0.17.0` and `composer require
okjt/laravel-kit:^0.17.0`, then publish and run the migrations (a new
`okjt_page_photos` table). `@okjt/ui` stays at 0.8.

- **How it works**: each place on your site ("homeHero") keeps its default
  picture in your frontend. The admin swaps in others, several cross-fading
  in order (at most `okjt.page_photos.max`, 8). A picture is a ref:
  `media-{id}` from the media library, or a built-in photo key your
  frontend knows.
- **Routes**: `GET /page-photos` → `PagePhotoController@index` (public;
  `{ placements: { key: [refs] }, media: { 'media-9': { url, … } } }`);
  behind your admin middleware `PUT /admin/page-photos/{key}` → `@update`
  (`images: [refs]`) and `DELETE /admin/page-photos/{key}` → `@reset`. Each
  change goes in the console audit log, before and after.
- **Screen**: `<AdminPagePhotos places={[{ key, label, hint, defaults }]}
  builtIn={{ key: url }} />`.
- **Media library**: deleting a file a place still shows is now refused,
  naming the places.
- Naoa: `SitePhotosController` / `SitePhotoPlacement` → the kit's, with
  `per_workspace` off (Naoa's own site) and your built-in photo keys as
  they are. Its uploads (`site_media`, refs `upload-{id}`) need a one-off
  move into the media library and their refs rewritten to `media-{id}`.

## 0.15 → 0.16 (dashboard 0.16.0, laravel-kit 0.16.0, create-okjt-app 0.1.15)

Page copy (S6, step 2), from TFE and Naoa. Nothing changes until you use it.
`npm i @okjt/dashboard@^0.16.0` and `composer require
okjt/laravel-kit:^0.16.0`, then publish and run the migrations (a new
`okjt_page_copy` table). `@okjt/ui` stays at 0.8.

- **Defaults stay in your code**: point `okjt.page_copy.config` at the
  config file holding your pages' words (TFE: `'landing_v2'`), each
  top-level key a section. `Okjt\Kit\Content\PageCopy::all()` /
  `::section('hero')` give them back with the admin's edits applied and
  hidden sections left out; render pages from that.
- **Only wording can change**: values under `okjt.page_copy.structural`
  keys (ids, icons, actions, links, images) are never editable, and an
  empty edit means the default. Add your own wiring keys to that list.
- **Routes**: `GET /page-copy` → `PageCopyController@publicIndex`; behind
  your admin middleware `GET /admin/page-copy` → `@index`,
  `PUT /admin/page-copy/{section}` → `@update` (`fields: { path: text }`,
  `visible`), `DELETE /admin/page-copy/{section}` → `@reset`. Each save and
  reset goes in the console audit log by section.
- **Screen**: `<AdminPageCopy />` (`sectionLabel` for your own names).
- **Per workspace**: `okjt.page_copy.per_workspace => true` gives each
  workspace its own copy (Naoa's weddings, instead of `PageContent`).
- TFE: `LandingContent` → `PageCopy` with `config => 'landing_v2'`. Its
  overrides live in `site_settings` as `landing_v2_*` rows today; moving
  them into `okjt_page_copy` is a one-off migration in TFE.

## 0.14 → 0.15 (dashboard 0.15.0, laravel-kit 0.15.0, create-okjt-app 0.1.14)

Site settings (S6, step 1), from okjt-app. Nothing changes until you use
them. `npm i @okjt/dashboard@^0.15.0` and `composer require
okjt/laravel-kit:^0.15.0`, then `php artisan vendor:publish
--tag=okjt-migrations` and `php artisan migrate` (a `site_settings` table,
skipped if you have one; okjt-app's and TFE's are already this shape).
`@okjt/ui` stays at 0.8.

- **Server**: `Okjt\Kit\Content\SiteSettings::get('contact_email',
  $default)`, `::bool()`, `::group('contact')`, `::put([...])`. Routes:
  `GET /admin/site-settings` → `SiteSettingController@index` and
  `PUT /admin/site-settings` → `@update` (`settings: [{ key, value, type?,
  group? }]`) behind your admin middleware; each save goes in the console
  audit log with its keys. `GET /site-settings` → `@publicIndex` gives
  signed-out pages the groups in `okjt.site_settings.public_groups` only.
- **Screen**: `<AdminSiteSettings catalogue={CATALOGUE} />`, where the
  catalogue lists groups → sections → fields (`{ key, store, label, hint,
  type }`); see the component's comment. Settings the catalogue doesn't
  list show under "Other". `SettingField` is the single field editor, with
  `type: 'custom'` and `render` for your own.
- okjt-app: point the admin Settings page at the kit (its catalogue moves
  over as it is; rich text and FAQ fields become `custom`), and narrow its
  public `GET /settings`, which returns every group to anyone, to the kit's
  `publicIndex`. TFE: its `SiteSetting` rows are already in this table.

## 0.13 → 0.14 (ui 0.8.0, dashboard 0.14.0, laravel-kit 0.14.0, create-okjt-app 0.1.13)

The media library (S5), from TFE. Nothing changes until you use it. Raise
ui and dashboard together: `npm i @okjt/ui@^0.8.0 @okjt/dashboard@^0.14.0`
and `composer require okjt/laravel-kit:^0.14.0` (which brings
`intervention/image` ^3; the server needs PHP's GD extension). Then
`php artisan vendor:publish --tag=okjt-migrations` and `php artisan
migrate` (a `media_assets` table, skipped if you have one).

- **Server**: `Okjt\Kit\Media\MediaLibrary::store($file)` scales an image
  down to `okjt.media.max_edge` (1920) and re-encodes it at `quality` (82),
  stores it on `disk` under `folder`, and records it as a `MediaAsset`.
  Animated GIF and video are kept as they are; SVG is never accepted. Use
  `MediaLibrary::imageRules()` / `mediaRules()` in your own uploaders
  instead of a hand-written `mimes:` list. Routes, behind your admin
  middleware: `GET /media` → `MediaController@index` (`?kind=image`),
  `POST /media` → `@store` (`files[]`), `DELETE /media/{id}` → `@destroy`.
- **Screens**: `<AdminMediaLibrary />` (upload, list, delete) and
  `<MediaPicker open onClose onPick={(asset) => …} />` for any image field
  (`kind="image"` by default, `null` for everything). Both take `path`.
- **File inputs**: `MEDIA_ACCEPT.image` / `.media` (and `IMAGE_MIMES`,
  `VIDEO_MIMES`) from `@okjt/ui` or `@okjt/ui/helpers`.
- TFE: `MediaLibraryService` → `MediaLibrary`, `App\Models\MediaAsset` →
  the kit's (same table), `lib/media.js` → `@okjt/ui/helpers`; delete
  yours and their tests. Your Inertia `Admin/Media` page and `MediaPicker`
  can stay until the admin moves to the kit shell.

## 0.12 → 0.13 (ui 0.7.0, dashboard 0.13.0, laravel-kit 0.13.0, create-okjt-app 0.1.12)

The browser error log (S4), from TFE. Nothing changes until you use it.
Raise ui and dashboard together (dashboard 0.13 needs ui 0.7; with ui alone
npm nests a second copy): `npm i @okjt/ui@^0.7.0 @okjt/dashboard@^0.13.0`
and `composer require okjt/laravel-kit:^0.13.0`.

- **Browser half**: `import { installErrorReporter } from '@okjt/ui/helpers'`
  and call it once at start-up. Options: `endpoint` (default
  `/client-errors`), `skipPages` (RegExps on the path whose errors must
  never leave the browser), `maxPerPage` (10).
- **Server half**: `Route::post('/client-errors',
  [Okjt\Kit\Http\Controllers\ClientErrorController::class, 'store'])
  ->middleware('throttle:30,1');` outside any auth group (signed-out pages
  report too). Pages and sources are kept as paths only, the user as an id.
  `okjt.client_errors.skip_paths` lists pages whose reports are dropped
  (`'fan/bank-savings'`); reports go to the `okjt_client` log channel, a
  7-day daily file `storage/logs/client-errors.log` the kit adds unless you
  define the channel yourself. Read that file before asking a tester for
  their console.
- TFE: delete `lib/errorReporter.js`, `ClientErrorController`, its
  `client` log channel and their tests; call the kit's with
  `skipPages: [/^\/fan\/bank-savings/, /^\/sandbox-bank/]` and set
  `okjt.client_errors.skip_paths`.

## 0.11 → 0.12 (dashboard 0.12.0, laravel-kit 0.12.0, create-okjt-app 0.1.11)

Start of R4 (platform services). Nothing changes until you use the new
pieces. `npm i @okjt/dashboard@^0.12.0` and `composer require
okjt/laravel-kit:^0.12.0`; then `php artisan vendor:publish
--tag=okjt-migrations` and `php artisan migrate` (a new `okjt_switches`
table).

- **On/off switches (S2).** Declare a project's switches in
  `config/okjt.php`:
  ```php
  'switches' => [
      'mpesa_extras' => [
          'label' => 'Sell extras with M-Pesa',
          'description' => 'Guests can pay for extras on the splash page.',
          'default' => env('OKJT_SWITCH_MPESA_EXTRAS', false),
          'public' => true,   // signed-out pages may ask (optional)
      ],
  ],
  ```
  Read one with `Okjt\Kit\Switches\Switches::on('mpesa_extras')`; guard a
  feature's routes with `RequireSwitch::class.':mpesa_extras'` (404 while
  off). Admin routes, superadmins only:
  `GET /switches` → `SwitchController@index`, `PUT /switches/{key}` →
  `@update` (each flip goes in the console audit log), and optionally a
  signed-out `GET /public-switches` → `@publicIndex`. The screen is
  `<AdminSwitches />` from `@okjt/dashboard` (`path`, `translate`,
  `confirm` options). Only declared switches can be flipped; an undeclared
  key reads as off.
- **Stale cookies (S3), from TFE.** Add
  `Okjt\Kit\Http\Middleware\ForgetShadowedCookies` to the `web` group
  (`$middleware->web(append: [...])`). When a cookie's name arrives twice
  (an old copy under another domain after `SESSION_DOMAIN` changed), the
  stale copies are expired, so sign-in stops answering 419. It watches the
  session cookie and `XSRF-TOKEN`; `okjt.cookies.shadowed` names others.
  TFE: delete `App\Http\Middleware\ForgetShadowedCookies` and its test.

## 0.11.0 → 0.11.1 (dashboard 0.11.1)

`npm i @okjt/dashboard@^0.11.1`; nothing to change. A fix, from TFE.

- **The sidebar marks one current item.** With nested paths in `shell.nav`
  (Tickets at `/app/tickets`, Sales at `/app/tickets/sales`), a nested page
  marked both, because each item matched on its own prefix. Now the longest
  match alone is current. Which items can match is unchanged (the page, or a
  path it starts with; the home item only on its own page), so a sidebar
  without nested paths is exactly as before; Naoa's and Najenga's have none.
  The tab bar already did this (`activeNavItem`).
- New export: `sidebarActivePath(nav, pathname, homePath)`, the rule above.

## 0.10 → 0.11 (ui 0.6.0, dashboard 0.11.0, inertia 0.1.0 (new), create-okjt-app 0.1.10)

Raise your ranges together (dashboard 0.11 needs ui 0.6): `npm i
@okjt/ui@^0.6.0 @okjt/dashboard@^0.11.0`. `@okjt/site` stays at 0.3, and
`okjt/laravel-kit`'s v0.11.0 tag is the same code as v0.10.0. Nothing
changes on screen unless you use the new options.

- **`Modal`: tabs, a footer per tab, a fixed height and a phone sheet**
  (F2, from TFE's `TfeModal`). All off by default.
  - `tabs={[{ id, label, icon?, badge?, disabled?, content? }]}` (or
    `['Overview', 'Details']`) draws a row of tabs under the title and turns
    on the card chrome. The body is the open tab's `content`, else
    `children(activeId)` when children is a function. Arrow keys, Home and
    End move between tabs. `defaultTab`, or `activeTab` + `onTabChange` to
    control it. A tab list that changes while the dialog is open (a form
    that adds a step) falls back to a tab that exists, never an empty body.
    `icon` is a lucide component or an element.
  - `footer={(activeId) => …}`: the actions follow the open tab. A Save
    button for a form that isn't on screen does nothing, so show it only on
    that form's tab, and point it at the form with `form="the-form-id"`.
  - `fixedHeight`: the card keeps one height, `min(40rem, 88dvh)`, whatever
    the open tab holds; only the body scrolls. Override with `className`
    (`h-[32rem]`).
  - `sheet`: below `sm` the card sits at the bottom of the screen, full
    width, with a handle; swipe the header down to close (a long pull or a
    quick flick). Not swipeable when `closeable={false}`. The footer clears
    the iPhone home bar.
- **A tab bar on phones** (F5, from TFE's `TabBar`): `shell.tabBar = { tabs:
  ['/app', { path: '/app/plan', primary: true, label: 'Plan' }, '/app/inbox'] }`
  in `DashboardProvider`. Off by default. Below `lg` a floating bar at the
  bottom shows those sidebar items (picked from `shell.nav` by path, so a
  tab's label and icon come from the sidebar; a path not in the nav is left
  out), the current one behind a lens, `primary` with an outline, a dot when
  others changed that page, and a Menu tab that opens the sidebar (`menu:
  false` to drop it). Labels fold away while scrolling down. The floating
  toolbar (plain and bold) moves above it, and the page ends clear of it.
  If your project has its own phone tab bar or bottom nav, delete it when
  you turn this on.
- **A skeleton while a page loads** (F9, from TFE's `PageTransition`):
  `shell.pageSkeleton: true` (or `{ patterns, fallback, grace }`). Off by
  default. The page gets its own Suspense boundary inside the shell, so a
  lazy route that is still loading shows a placeholder shaped like it after
  220 ms while the sidebar and header stay, instead of falling through to
  your app's own boundary above the shell (which replaces the whole
  dashboard). Shapes: `dashboard`, `cards`, `table`, `split`, matched on the
  path; add your pages' patterns in front of `DEFAULT_SKELETON_PATTERNS`.
  If your routes have a `<Suspense>` around each page only to keep the
  shell up, you can drop it.
- **Undo instead of "are you sure?"** (F7, from TFE): `undoable(message,
  commit, { onUndo, onError })` shows an Undo toast and runs `commit` only
  when the 5 s window closes, so Undo never has to reverse anything.
  `useUndoableRemoval()` does it for a list: `remove(id, { message, commit
  })` hides the row at once, puts it back on Undo or on a failed commit, and
  commits what is pending when the page is left. `notifyUndo` (runs first,
  reverses on Undo) is unchanged. Keep `confirmAction()` for what can't
  safely be taken back (something that tells someone else or moves money).
- **`StepFlow`** (F8, from TFE): `<StepFlow variant="inline" steps={['Details',
  'Party', 'Confirm']} cursor={2} />` in a wizard, or `variant="docked"` for
  a "how it works" pill at the bottom of a page. Without `cursor` or per-step
  `state` it explains a flow and marks nothing done. Below `sm` it shows the
  current step and "Step 2 of 4". If your project has its own step indicator
  or "Step X of Y" caption, it can switch. For sections a person may move
  between freely, use `Modal`'s `tabs` instead.
- **Format helpers** (F11, from TFE): `formatNumber(n, digits?, locale?)`
  ("1,234,567"; junk reads "0"), `formatDateTime(value, intlOptions?,
  locale?)` ("Jun 14, 2027, 7:00 PM"; '' when missing or invalid),
  `statusLabel('pending_payment')` ("Pending payment"), `titleCase(slug)`.
  The locale is pinned (en-US unless passed) so a number reads the same on
  every machine; the time zone stays the viewer's. From `@okjt/ui` or
  `@okjt/ui/helpers`. Replace bare `toLocaleString()` calls with them.
- **The kit in an Inertia app: `@okjt/inertia`** (R3, new package,
  generalised from Tena-host's bridge). `npm i @okjt/inertia
  react-router-dom`, then wrap the kit in `<InertiaRouter>` inside your
  Inertia layout: every kit `Link`, `NavLink` and `useNavigate` makes an
  Inertia visit, a `#section` on the same page stays on the page, and links
  to other sites stay plain links. See its README. **Tena-host**: replace the
  `<Router location navigator>` in `V2Site.jsx` with `<InertiaRouter>` and
  delete `useInertiaLocation` and `navigate` there (your `v2Link` stays).
- **React 18: sign-in fields** (dashboard, a fix). `AuthField` didn't
  forward its ref, so on React 18 the kit's `SignInPage` never registered
  its email and password fields and Sign in did nothing. Nothing to do; the
  kit's tests now run on React 18 as well as 19.
- **Projects with their own tabbed dialog**: TFE `TfeModal`, Tena-host
  `TabbedModal`, Naoa `TwoPaneDialog` (keeps its two panes; use `tabs` where
  it only switches sections), Najenga's own `Modal`. Each moves to `Modal`
  in its own consumer PR, with screenshots.

## 0.9 → 0.10 (dashboard 0.10.0, laravel-kit 0.10.0, create-okjt-app 0.1.9)

Raise your ranges: `npm i @okjt/dashboard@^0.10.0` and `composer require
okjt/laravel-kit:^0.10.0`. `@okjt/ui` and `@okjt/site` stay at 0.5 and 0.3.

- **Reset links (laravel-kit), check this one.** The emailed reset link
  used to go to `{app.frontend_url}{path}/{token}` always, and Laravel's
  `frontend_url` defaults to `http://localhost:3000`. Now, by default, it
  goes there only when your app has no `password.reset` route; with one,
  Laravel's own link to it is used. Set
  `okjt.auth.password_reset.link_to_app` to `true` to always link to the
  app (an app on another origin), or `false` to always leave it to Laravel.
  Naoa (no `password.reset` route): unchanged. Najenga (its own route at the
  same path): the link now comes from its route on its own host instead of
  `FRONTEND_URL`. TFE and Tena-host: links stop pointing at localhost.
- **`AdminDataTable`** (`import AdminDataTable from '@okjt/dashboard/table'`,
  needs `npm i @tanstack/react-table`), from Tena-host: a table from `lg`
  and one card per row below it, with search, sorting, client or server
  paging (`serverPagination` + `onPageChange`), selection (`selectedIds` to
  control it), `rowActions` and "View details" (`detailTitle`; columns with
  `meta.detailOnly` show only there; `meta.label` names a column on the
  cards). `translate` passes labels through a project's own wording.

## 0.8 → 0.9 (ui 0.5.0, site 0.3.0, dashboard 0.9.0, create-okjt-app 0.1.8)

More of R2. Nothing changes on screen unless you use the new options. Raise
your ranges together (dashboard 0.9 needs ui 0.5; with ui left at 0.4 npm
nests a second copy): `npm i @okjt/ui@^0.5.0 @okjt/site@^0.3.0
@okjt/dashboard@^0.9.0`. `okjt/laravel-kit`'s v0.9.0 tag is the same code as
v0.8.0.

- **A floor for small text**: `theme: { type: { minText: '12px' } }` in
  `okjt.config.js`, then `npm run theme`. The kit's 9 to 11 px labels (36 of
  them, in all three packages) never draw smaller. Tena-host: set it to
  `'12px'` and delete the `.v2-site .text-\[11px\]` rule in `V2Site.css`.
- **A contrast check**: `okjt-theme --check-contrast` checks every
  text/background pair the kit draws (body on the page, links on cards,
  white on accent buttons, filled controls, ...) against WCAG AA, for the
  public pages and, with `theme.dashboard`, the dashboard. It exits 1 if a
  pair is too faint. Add your own pairs in `theme.contrastPairs` (and
  `theme.dashboard.contrastPairs`): `[what, text, background, minimum]`,
  where a colour is a token (`'body'`, `'tone-500'`), a token over the
  background (`'accent/15'`) or a colour (`'#ffffff'`). In your own tests:
  `import { checkContrast, contrastRatio } from '@okjt/ui/contrast'`.
  Add `"check:contrast": "okjt-theme --check-contrast"` to your scripts
  (new projects have it). Today it reports pairs below AA in Naoa (public
  pages), Najenga (dashboard) and okjt-app; see the plan.
- **`useAdminAction` without a Query client**: on a page or in a test with
  no `QueryClientProvider`, the action runs and nothing is refetched.
  `refreshHistory: false` skips refetching the kit's version history; set it
  for every action with `componentDefaults: { AdminAction: { refreshHistory:
  false } }` in `DashboardProvider` (Najenga, whose history is its own).

## 0.7 → 0.8 (dashboard 0.8.0, laravel-kit 0.8.0, create-okjt-app 0.1.7)

More of R2. Nothing changes on screen unless you use the new pieces. Raise
your ranges: `npm i @okjt/dashboard@^0.8.0` and `composer require
okjt/laravel-kit:^0.8.0`. `@okjt/ui` stays at 0.4.

- **`useFilteredItems(items, { searchQuery, searchFields, where, sortFn, filterFn })`**:
  search chosen fields, keep items whose fields equal values (`where:
  { project_id }`, compared as text, empty values ignored), and sort. The
  positional form `(items, searchQuery, filterFn)` works as before.
- **`TwoPaneForm`** and **`TwoPaneDialog`** (and `FieldError`), from Naoa: long
  forms in two panes, with a check as each field is left, a draft for new
  entries and a final "Check details". Naoa: delete your copies and import
  them from `@okjt/dashboard`; the markup is the same.
- **The glass toolbar on phones**, from Naoa:
  `import '@okjt/dashboard/toolbar-glass.css'` and call
  `useGlassToolbar({ storageKey })` in the dashboard. Colours are
  `--okjt-toolbar-glass-bg`, `--okjt-toolbar-solid-bg`,
  `--okjt-toolbar-glass-border` and `--okjt-toolbar-glass-shadow` (defaults:
  Naoa's warm white). Naoa: delete `useMobileToolbar` and the phone-toolbar
  rules in `index.css`, and pass `storageKey: 'naoa-toolbar-solid'`.
- **laravel-kit `Messages`**: a message missing from your published
  `config/okjt.php` now falls back to the kit's wording, so new messages
  reach projects with their own list. Yours still wins where you have one.

## 0.6 → 0.7 (dashboard 0.7.0, create-okjt-app 0.1.6)

Room in the bell and the tour for a project to draw its own (R2, option B,
step two). Raise your range: `npm i @okjt/dashboard@^0.7.0`. `@okjt/ui`
stays at 0.4; `okjt/laravel-kit`'s v0.7.0 tag is the same code as v0.5.0.

Two small behaviour changes, no change in how anything looks:

- **The bell closes on a click outside it and on Escape.** It never did.
- **→ in the tour stops at the last step.** It used to finish the tour,
  which a stray key press could do; finishing is the card's own button.

New, all optional:

- **`useNotifications({ listPath, markAllPath, markOnePath, map })`**: the
  bell's behaviour on its own (fetched on mount and every 30 seconds;
  `markRead(id)`, `markAllRead()`, `refresh()`, `notifications`,
  `unreadCount`).
- **`NotificationsBell`**: `markOnePath` (`'/notifications/:id/read'`, or a
  function of the id), and `renderButton` / `renderPanel` to draw your own
  bell on the kit's behaviour (`{ open, toggle, close, unreadCount,
  notifications, markRead, markAllRead, refresh }`).
- **`AdminTutorial`**: `render` draws the whole tour yourself (overlay,
  spotlight, card) from `{ step, index, count, rect, next, back, finish }`,
  rendered into `document.body`; `scrollIntoView={false}` leaves the page
  where it is.

## 0.5 → 0.6 (ui 0.4.0, dashboard 0.6.0, create-okjt-app 0.1.5)

Style options, so a project whose dialogs and fields look different from the
kit's can use the kit's anyway (R2, option B). Nothing changes on screen
unless you use them. Raise your ranges: `npm i @okjt/ui@^0.4.0
@okjt/dashboard@^0.6.0`. `okjt/laravel-kit` has no changes (its v0.6.0 tag is
the same code as v0.5.0).

- **Fields' base classes**: `AdminInput`, `AdminSelect` and `AdminTextarea`
  take your project's classes in place of the kit's, set once in
  DashboardProvider:
  ```js
  componentDefaults: { Field: { classNames: { input: '…', select: '…', textarea: '…' } } }
  ```
  or per field with `baseClassName`. `className` and the error border still
  apply after them.
- **`Modal`**: `overlayClassName` (how the dialog sits on the page),
  `backdropClassName`, and `classNames: { panel, body }`, each replacing the
  kit's classes. For dialogs that draw their own header, close button and
  footer as the content (`showClose={false}`), while the kit keeps the
  backdrop, Escape, focus and scroll lock.
- **`@okjt/ui/helpers`**: `installChunkReload` and its helpers, importable
  without React or toasts (`import { installChunkReload } from
  '@okjt/ui/helpers'`). For apps without `react-hot-toast`, such as Inertia
  apps.

## 0.4 → 0.5 (ui 0.3.0, dashboard 0.5.0, laravel-kit 0.5.0, create-okjt-app 0.1.4)

Release R1 of the consolidation plan (`CONSOLIDATION_PLAN.md`). Nothing
changes on screen or in a response unless you use the new options. You have to
raise your version ranges yourself, because in 0.x `^0.4.0` does not install 0.5:

1. `npm i @okjt/ui@^0.3.0 @okjt/dashboard@^0.5.0` and
   `composer require okjt/laravel-kit:^0.5.0`, then regenerate the theme
   (`npx okjt-theme`): it gains four colours at their defaults, and nothing
   on screen changes. **`@okjt/site` 0.2.0 isn't on npm yet** (it has no
   Trusted Publisher); stay on `^0.1` until it is, then see "site 0.1.0 →
   0.2.0" below.

New, all optional:

- **`installChunkReload()`** (`@okjt/ui`): call it once in `main.jsx`, before
  rendering. A tab left open across a deploy then reloads once into the new
  build instead of failing to open lazy pages. It replaces Naoa's
  `vite:preloadError` handler and naoa-dt's `utils/chunkReload.js`.
- **`Modal`**: `maxWidth` `6xl`, `7xl` and `full`; `showClose={false}` for
  content with its own close button; `closeable={false}` for a step that must
  be finished; `title`, `description` and `footer` make the panel a card (a
  header with the close button, a body that scrolls, a footer that stays put);
  `className` for the panel. Keyboard focus now moves into an open modal (its
  autofocus field, else its first control), stays inside on Tab, and goes back
  to what had it when it closes.
- **`NotificationsBell`**: `listPath`, `markAllPath` and `map` (turns one of
  your API's items into `{ id, title, message, link, icon, read_at,
  created_at }`), for an app with its own notifications API, such as Laravel
  database notifications.
- **`AdminTutorial`**: `open` (the app decides when it shows and remembers who
  has finished; nothing goes in localStorage), `skipMissing` (leaves out steps
  whose element isn't on screen), a step's `selector` instead of an element
  id, and ←, → and Escape. Its card is a dialog named by the step's title.
- **`ContextMenu`**: items may say `onClick` as well as `onSelect`. In
  development an item with neither logs a warning. Focus goes back to whatever
  opened the menu when it closes, so adapters that did this themselves (Najenga's)
  can stop.
- **`AdminInput`, `AdminSelect`, `AdminTextarea`**: take a `ref`; `bare`
  renders the control alone; background and text colour come from
  `--okjt-field-bg` and `--okjt-field-text` (default: transparent and
  inherit). A dark dashboard using `@tailwindcss/forms` sets them, e.g.
  `.admin-theme { --okjt-field-bg: #1c1c1c; --okjt-field-text: #f2f2f2; }`.
- **Unsaved changes**: every `useUnsavedChangesGuard` reports to one page-wide
  record. `<UnsavedChangesStatus />` without `dirty` shows its chip whenever
  anything is unsaved (passing `dirty` works as before). For navigation the
  guard can't see: `useGuardedNavigate()` (asks before a `navigate()` call)
  and `confirmLeave()` (for another router's visits, e.g. an Inertia-style
  router's `before` event). After saving, call `allowNextNavigation()` before
  redirecting. Also exported: `useHasUnsavedChanges()`, `hasUnsavedChanges()`.
  The browser's Back button is still not caught (react-router needs a data
  router for that).
- **`Okjt\Kit\Http\Middleware\SecurityHeaders`**: append it in
  `bootstrap/app.php` and delete your own. The defaults are Naoa's headers
  exactly. Add sources with `okjt.security_headers.csp_extra`
  (naoa-dt: `['connect-src' => ['data:', 'blob:']]`).
- **Passkeys**: an unexpected failure (a stored key that no longer decrypts,
  a database error) now answers 422 with `okjt.messages.passkey_failed`, and
  the cause is logged. If your published `config/okjt.php` has its own
  `messages`, add `passkey_failed` to change the wording; otherwise the kit's
  wording is used.

## site 0.1.0 → 0.2.0 (with @okjt/ui 0.2.2): dark public pages

Also `@okjt/dashboard` 0.4.1 (nothing to change): presence isn't asked for
without the kit's `api`; the sign-in card's border and the floating
toolbar's glass, border and shadow can be set in CSS (`--okjt-toolbar-bg`,
`--okjt-toolbar-border`, `--okjt-shadow`) for dark dashboards.

1. `npm i @okjt/site@^0.2.0 @okjt/ui@^0.2.2`
2. **Regenerate the theme** (`npx okjt-theme`): the public pages now use two
   new colours, `onInk`, `panel`, `fill` and `fillHover`. Skipping this leaves the dark buttons'
   text and the footer panel without a colour.

Shadows on the public pages are tinted with `--okjt-shadow` (CSS, default
`ink`); dark pages set it to black in their CSS.

Nothing changes on screen unless you set them: `onInk` defaults to white and
`panel` to `ink`, `fill` (dark buttons, the chosen tab or chip) to `ink` and `fillHover` to `body`, and cards, pills and menus that were white are now
`surface` (default white). For dark public pages, swap the light and dark
tokens (`paper`/`tint` dark, `ink`/`body` light), set `surface` to the card
colour, `onInk` to a dark colour and `panel` to a dark one. OKJTech's own
site (`okjt-app/web`) does this.

## 0.3.0 → 0.4.0 (dashboard 0.4.0, ui 0.2.1, laravel-kit 0.4.0, create-okjt-app 0.1.3)

Upgrade both together: the server's two-step sign-in changed.

1. `npm i @okjt/dashboard@^0.4.0 @okjt/ui@^0.2.1` and `composer require okjt/laravel-kit:^0.4.0`
2. `php artisan migrate`: the kit's `login_codes` table (skipped where the
   app already has one).
3. **Breaking: two-step sign-in needs the challenge.** `/login` (and an
   emailed code, a passkey, Google, an email link) now answers a two-step
   person with `{ requires_2fa, email, challenge }`; `/verify-2fa` takes
   `{ challenge, code }`. A code with an email address alone no longer
   signs anyone in. The kit's SignInPage and GoogleCallbackPage pass the
   challenge for you; your own calls use `verify2fa(challenge, code)`.
4. Wrong passwords are now throttled per address (5 a minute,
   `okjt.auth.throttle`); the wording is `okjt.messages.bad_credentials`.

New, all optional:

- **Session mode** (`okjt.auth.mode = 'session'`, and
  `<AuthProvider mode="session">`): sign in with Laravel's session cookie
  instead of a bearer token, for an app on the API's own origin. Put the
  auth routes on the `web` middleware. `initialUser` skips asking `/user`.
- **Sign in with an emailed code**: LoginCodeController (`/login-code`,
  `/login-code/verify`), and `emailCode` on SignInPage. Send your own email
  with `okjt.auth.login_codes.notification`.
- **Forgotten passwords**: PasswordResetController (`/forgot-password`,
  `/reset-password`), ForgotPasswordPage and ResetPasswordPage. The emailed
  link opens `{app.frontend_url}{okjt.auth.password_reset.path}/{token}`.
- **Confirming the password**: ConfirmPasswordController
  (`/confirm-password`, `/confirmed-password-status`), ConfirmPasswordPage.
- **Recovery codes** for two-step sign-in: handed out when it's turned on,
  `GET`/`POST /2fa/recovery-codes`, and accepted at the second step
  ("Use a recovery code instead").
- SignInPage: `remember`, `status`, `passkey` (false, or your own button),
  `labels`, `emailAutoComplete`.
- `okjt.auth.two_factor.secrets_encrypted`: secrets kept as Laravel Fortify
  keeps them (an app moving from Fortify keeps everyone's two-step sign-in).
- `okjt.auth.verified_to_sign_in` (default true): false lets people sign in
  before verifying their address.
- **The bold look** (`componentDefaults` in DashboardProvider, e.g.
  `{ SidePanel: { variant: 'bold' } }`) for EmptyState, the side panel, the
  floating toolbar, summary cards, page layout and hero; **icons by name**
  (`iconFor` in DashboardProvider, DashboardIcon); `shell.menuNewsDot`;
  `countActiveFilterLists`.

Nothing changes on screen unless you ask for it. Naoa's dashboard and its
sign-in page were compared element by element: no differences, except the
new "Use a recovery code instead" link at the two-step step.

## Dashboard 0.2.2 → 0.3.0 (with @okjt/ui 0.1 → 0.2)

Nothing changes on screen unless you ask for it. Naoa's dashboard was compared
element by element (21 pages and the share and history panels): no
differences.

1. `npm i @okjt/dashboard@^0.3.0 @okjt/ui@^0.2.0`
2. **Regenerate the theme** (`npx okjt-theme`, or `npm run theme`): the kit's
   components now use two new colours, `surface` and `contrast`, and the theme
   file must define them. Skipping this leaves cards and menus transparent.
   Apps made by create-okjt-app do it before every `dev` and `build`.

New, all optional:

- **Colours** `surface` (cards, panels, menus, dialogs; default white) and
  `contrast` (what hovers shade toward; default black).
- **`theme.dashboard`**: the colours again, for the dashboard only — e.g. a
  dark dashboard beside light public pages. Any token may be left out;
  `colorScheme: 'dark'` makes native controls (date pickers, scrollbars) dark.
- **Shell options** (`shell` in DashboardProvider): `sidebarWidth`,
  `collapsible` (a rail of icons on wide screens, remembered) with
  `railWidth`; `headerActions` (`'online'`, `'share'`, `'history'`, `'tour'`
  or your own components, in order); `HeaderStart` and `Search` slots;
  your own `HistoryDrawer` and `ShareModal`; `MenuIcon`; and classes for every
  part of the frame (`sidebarClass`, `logoBoxClass`, `navClass`,
  `navItemClass`, `navActiveClass`, `navIdleClass`, `navLabelClass`,
  `navTitleClass`, `headerClass`, `headerStartClass`, `headerEndClass`,
  `menuButtonClass`, `headerButtonClass`, `mainClass`). See
  DashboardProvider.jsx.
- `<main>` has `id="main-content"`, for a skip link.

## 0.2.1 → 0.2.2

`okjt/laravel-kit` v0.2.2, `@okjt/dashboard` 0.2.2, `create-okjt-app` 0.1.1.

**Email verification links are signed.** The link used to prove an address
with the hash of the address alone, which anyone who knew a user's id and
email could compute. It now also carries an expiry and a signature made with
the app key (`Okjt\Kit\Auth\VerificationLink`), and
`EmailVerificationController` refuses a link without a valid one (403; an
expired link answers `reason: expired`). Links last
`okjt.auth.verify_minutes` (a day).

* Send the kit's email from the user model (or extend it):
  ```php
  public function sendEmailVerificationNotification(): void
  {
      $this->notify(new \Okjt\Kit\Auth\VerifyEmail);
  }
  ```
* `@okjt/dashboard`'s `VerifyEmailPage` sends the new parts; update both
  packages together.
* Links emailed before the upgrade stop working: the person signs in and asks
  for a new one.
* Tests that posted `{ id, hash: sha1(email) }` need a real link's parts
  (`VerificationLink::for($user)`).

## 0.2.0 → 0.2.1

`@okjt/dashboard` 0.2.1. The page title, its icon box, summary-card and
toolbar shadows and the bell's dot follow the theme (they had Naoa's colours
written in; the values are the same for Naoa). The sign-in fields' three
copper tones follow the theme too, unless the app sets them in its CSS:

```css
:root {
  --okjt-auth-glow: #D08A5E;        /* where the sign-in button's gradient ends */
  --okjt-auth-focus: #C49274;       /* a focused field's border and ring */
  --okjt-auth-placeholder: #B8A898; /* placeholders */
}
```

`AdminTutorial` with no steps no longer breaks the page.

## 0.1 → 0.2

`@okjt/dashboard` 0.2.0 and `okjt/laravel-kit` v0.2.0. Nothing is removed or
renamed; everything new is opt-in.

**Server (`okjt/laravel-kit`)**

* New: Google sign-in and passkeys, backups, the console and its audit log,
  accounts and teams, and billing. See the README for each.
* Laravel merges a package's config only at the top level. If your
  `config/okjt.php` has its own `messages` or `auth` section, copy the new
  keys from the kit's `config/okjt.php` into it:
  * `messages`: `sign_in_expired`, `account_not_found`, `confirm_address`,
    `team_owners_only`, `no_account`, `plan_limit`, `trial_limit`;
  * `auth`: `new_user_name`, `social`.
  New sections (`backups`, `console`, `accounts`, `billing`) come from the
  kit unless you override them.
* New tables, only if you use those parts:
  `php artisan vendor:publish --tag=okjt-migrations` then `php artisan migrate`
  (console audit log, accounts, billing). Each skips tables you already have.
* `backups:create` and `backups:verify` now come from the kit; delete your own
  commands with those names.
* `AUTO_BACKUPS` is read as `okjt.backups.auto`.

**Client (`@okjt/dashboard`)**

* New: the shell's account menu (`AccountMenu`), the sign-in pages
  (`AuthLayout`, `SignInPage`, `GoogleCallbackPage`, `VerifyEmailPage`,
  `AcceptInvitePage`), the passkey client, and `signedIn(result)` on
  `useAuth()`.
* `SignInPage` needs `react-hook-form` (a new peer dependency).
