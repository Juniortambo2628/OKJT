@extends('emails.layout')

@section('content')
    <div class="badge">Launch checklist</div>
    <h1>Launching for African markets</h1>
    <p>The checklist you asked for. Work through it before launch, or with whoever is building the platform. It is a practical guide, not legal advice.</p>

    @foreach ($sections as $section)
        <h3>{{ $section['title'] }}</h3>
        <p style="color: #64748b;">{{ $section['intro'] }}</p>
        <ul>
            @foreach ($section['items'] as $item)
                <li><strong>{{ $item['title'] }}.</strong> {{ $item['text'] }}</li>
            @endforeach
        </ul>
    @endforeach

    <a href="{{ $pageUrl }}" class="button">Open the Checklist Online</a>

    <p>Want a hand with any of it? <a href="{{ $bookUrl }}">Book a short call</a> or reply to this email.</p>
    <p style="margin-top: 30px; font-size: 14px;">OKJTechnologies, Nairobi</p>
@endsection
