@extends('emails.layout')

@section('content')
    <div class="badge">Site check</div>
    <h1>Your results for {{ $check->host }}</h1>
    <p>{{ $summary['pass'] }} checks passed, {{ $summary['warn'] }} need attention and {{ $summary['fail'] }} failed.</p>

    @if ($problems->isNotEmpty())
        <h3>What to fix first</h3>
        <ul>
            @foreach ($problems as $problem)
                <li><strong>{{ $problem['title'] }}:</strong> {{ $problem['detail'] }}</li>
            @endforeach
        </ul>
    @endif

    <a href="{{ $reportUrl }}" class="button">Open the Full Report</a>

    <p>The report stays at that address for 30 days. Run the check again any time after you make changes.</p>
    <p>Want these fixed for you? <a href="{{ $bookUrl }}">Book a short call</a> or reply to this email.</p>

    <p style="margin-top: 28px; margin-bottom: 0;">OKJTechnologies</p>
@endsection
