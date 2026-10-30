<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #222; line-height: 1.5;">
    <h2 style="margin-top: 0;">New backup</h2>
    <p>A scheduled backup of the {{ config('app.name') }} database was created.</p>

    <p>
        <strong>File:</strong> {{ $backup['name'] }}<br>
        <strong>Created:</strong> {{ $backup['created_at'] }}<br>
        <strong>Size:</strong> {{ $sizeMb }} MB<br>
        <strong>Contents:</strong> {{ $backup['tables'] }} tables, {{ $backup['rows'] }} records
    </p>

    @if ($attached)
        <p>The backup is attached. Keep it somewhere safe; to restore it, put it in <code>storage/app/backups</code> and use Backups in the dashboard.</p>
    @else
        <p><strong>The backup was not attached</strong> because it is larger than the {{ rtrim(rtrim(number_format($maxMegabytes, 2, '.', ''), '0'), '.') }} MB email limit (BACKUP_OFFSITE_EMAIL_MAX_MB). Download it from Backups in the dashboard, or from the off-site disk.</p>
    @endif

    <p style="font-size: 13px; color: #777;">Sent automatically by the nightly backup job.</p>
</body>
</html>
