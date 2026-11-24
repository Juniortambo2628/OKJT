{{--
    The frame of every email the site sends, in the site's colours: a dark
    page with the logo, a cream card for the message, and the studio's real
    details underneath ($brand: App\Support\EmailBrand, via a view composer).
    Tables and inline styles, so Gmail, Outlook and Apple Mail agree.

    Classes a message can use: .badge (the small gold label), h1, h2, h3,
    .button, .panel (a boxed note), .fine (small print), .details (a table
    of labels and values).
--}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $brand['name'] }}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #0b0906; -webkit-text-size-adjust: 100%; }
        .content { font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.65; color: #3b2f1f; }
        .content p { margin: 0 0 16px; }
        .content ul, .content ol { margin: 0 0 16px; padding-left: 22px; }
        .content li { margin-bottom: 6px; }
        .content a { color: #8a6526; text-decoration: underline; }
        .content h1 { margin: 0 0 18px; font-size: 30px; line-height: 1.2; font-weight: 300; letter-spacing: -0.02em; color: #1d160d; }
        .content h2 { margin: 28px 0 12px; font-size: 22px; line-height: 1.3; font-weight: 400; color: #1d160d; }
        .content h3 { margin: 24px 0 8px; font-size: 16px; line-height: 1.4; font-weight: 600; color: #1d160d; }
        .content strong { color: #1d160d; }
        .badge { display: inline-block; margin: 0 0 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #8a6526; }
        .content a.button, a.button { display: inline-block; margin: 6px 0 18px; padding: 14px 26px; border-radius: 999px; background-color: #1d160d; color: #f3d9a0 !important; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
        .panel { margin: 4px 0 20px; padding: 18px 20px; border: 1px solid #e3d6b9; border-radius: 16px; background-color: #f3ead5; }
        .panel p:last-child { margin-bottom: 0; }
        .fine { font-size: 13px; line-height: 1.6; color: #75654a; }
        .details { width: 100%; border-collapse: collapse; font-size: 15px; }
        .details td { padding: 8px 0; border-bottom: 1px solid #e3d6b9; vertical-align: top; }
        .details td.label { width: 120px; padding-right: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #75654a; }
        .details tr:last-child td { border-bottom: 0; }
        @media (max-width: 620px) {
            .card { padding: 28px 22px !important; border-radius: 20px !important; }
            .content h1 { font-size: 26px; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0906;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b0906;">
        <tr>
            <td align="center" style="padding: 28px 12px 36px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
                    <tr>
                        <td style="padding: 0 6px 20px;">
                            <a href="{{ $brand['website'] }}" style="text-decoration: none;">
                                <img src="{{ $brand['logo'] }}" width="40" height="40" alt="" style="display: inline-block; width: 40px; height: 40px; vertical-align: middle; border: 0;">
                                <span style="display: inline-block; margin-left: 10px; vertical-align: middle; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 600; letter-spacing: 0.01em; color: #faf5e8;">{{ $brand['name'] }}</span>
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td class="card content" style="padding: 40px 36px; border: 1px solid #e3d6b9; border-radius: 24px; background-color: #faf5e8; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.65; color: #3b2f1f;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 26px 12px 0; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.7; color: #978561;">
                            <p style="margin: 0;"><strong style="color: #dcc89a;">{{ $brand['name'] }}</strong> &middot; {{ $brand['line'] }} &middot; {{ $brand['place'] }}</p>
                            @if ($brand['email'] || $brand['phone'])
                                <p style="margin: 4px 0 0;">
                                    @if ($brand['email'])<a href="mailto:{{ $brand['email'] }}" style="color: #ebc882; text-decoration: none;">{{ $brand['email'] }}</a>@endif
                                    @if ($brand['email'] && $brand['phone']) &middot; @endif
                                    @if ($brand['phone'])<a href="tel:{{ preg_replace('/[^0-9+]/', '', $brand['phone']) }}" style="color: #ebc882; text-decoration: none;">{{ $brand['phone'] }}</a>@endif
                                </p>
                            @endif
                            <p style="margin: 12px 0 0;">
                                <a href="{{ $brand['website'] }}" style="color: #ebc882; text-decoration: none;">Website</a> &nbsp;&middot;&nbsp;
                                <a href="{{ $brand['howWeWork'] }}" style="color: #ebc882; text-decoration: none;">How we work</a> &nbsp;&middot;&nbsp;
                                <a href="{{ $brand['privacy'] }}" style="color: #ebc882; text-decoration: none;">Privacy policy</a>
                            </p>
                            <p style="margin: 12px 0 0; color: #75654a;">&copy; {{ date('Y') }} {{ $brand['name'] }}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
