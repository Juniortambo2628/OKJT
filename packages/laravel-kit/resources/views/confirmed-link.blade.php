{{--
    A confirmed link's page (Route::confirmedLink): asks, with one button, or
    says what was done. Self-contained: no scripts, fonts or stylesheets from
    elsewhere.
--}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>{{ $title }}</title>
    <style>
        :root { color-scheme: light dark; --ink: #1c1917; --soft: #57534e; --paper: #f5f5f4; --card: #fff; --button: #1c1917; --on-button: #fff; }
        @media (prefers-color-scheme: dark) { :root { --ink: #f5f5f4; --soft: #d6d3d1; --paper: #0c0a09; --card: #1c1917; --button: #f5f5f4; --on-button: #1c1917; } }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; background: var(--paper); color: var(--ink); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
        main { width: 100%; max-width: 420px; background: var(--card); border-radius: 16px; padding: 32px 24px; text-align: center; box-shadow: 0 1px 3px rgb(0 0 0 / 0.12); }
        h1 { margin: 0 0 8px; font-size: 1.5rem; }
        p { margin: 0; color: var(--soft); }
        button { margin-top: 24px; min-height: 44px; padding: 10px 24px; border: 0; border-radius: 999px; background: var(--button); color: var(--on-button); font: inherit; font-weight: 600; cursor: pointer; }
        button:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
        .brand { margin-top: 24px; font-size: 0.875rem; }
    </style>
</head>
<body>
    <main>
        <h1>{{ $title }}</h1>
        <p>{{ $message }}</p>
        @if ($button && $action)
            <form method="POST" action="{{ $action }}">
                @if (request()->hasSession())
                    <input type="hidden" name="_token" value="{{ csrf_token() }}">
                @endif
                <button type="submit">{{ $button }}</button>
            </form>
        @endif
        @if ($brand)
            <p class="brand">{{ $brand }}</p>
        @endif
    </main>
</body>
</html>
