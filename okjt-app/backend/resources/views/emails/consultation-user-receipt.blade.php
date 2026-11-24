@extends('emails.layout')

@section('content')
    <div class="badge">Brief received</div>
    <h1>Hello {{ $requestData->first_name ?: 'there' }},</h1>

    {!! $opening !!}

    <div class="panel">
        <p class="fine" style="margin: 0 0 6px;"><strong>Your message</strong></p>
        <p style="margin: 0; white-space: pre-line;">{{ $requestData->message }}</p>
    </div>

    @if (! empty($bookingUrl))
        <p>Prefer to talk it through? Pick a time for a short video call; the booking page shows times in your own time zone.</p>
        <a href="{{ $bookingUrl }}" class="button">Book a Call</a>
    @endif

    <p>Meanwhile, <a href="{{ $howWeWorkUrl }}">how projects are run and paid</a> explains the stages, the fixed-price proposal and the four payment milestones.</p>

    <p style="margin-top: 28px; margin-bottom: 0;">OKJTechnologies</p>
@endsection
