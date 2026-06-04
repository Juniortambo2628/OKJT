<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            color: #334155;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            padding: 40px 20px;
            text-align: center;
            background-color: #ffffff;
            border-bottom: 1px solid #f1f5f9;
        }
        .logo {
            max-height: 75px;
            width: auto;
            margin: 0 auto;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
            color: #475569;
        }
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            background-color: #f8fafc;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 20px;
        }
        h1, h2, h3 {
            color: #0f172a;
            margin-top: 0;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            background-color: #f1f5f9;
            color: #3b82f6;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 4px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ config('app.url') }}/storage/uploads/6dziGBZaJ8qXkTGW5dXGu5gtb6NVmyQQbXtbpryA.png" alt="OKJTech Logo" class="logo">
        </div>
        <div class="content">
            @yield('content')
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} OKJTech. All rights reserved.</p>
            <p>One Canary Wharf, London, E14 5AB</p>
            <div style="margin-top: 15px;">
                <a href="{{ config('app.frontend_url') }}" style="color: #64748b; margin: 0 10px; text-decoration: none;">Website</a> |
                <a href="{{ config('app.frontend_url') }}/privacy" style="color: #64748b; margin: 0 10px; text-decoration: none;">Privacy Policy</a>
            </div>
        </div>
    </div>
</body>
</html>
