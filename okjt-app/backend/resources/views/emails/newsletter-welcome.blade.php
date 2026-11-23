@extends('emails.layout')

@section('content')
    <div class="badge">Newsletter</div>
    <h1>You’re on the list</h1>
    <p>Thanks for signing up. About once a month, OKJTechnologies sends one email: new insights on building software for African markets (payments, data protection, phones and slow networks) and any new free tools. Nothing else, and the address is never shared.</p>

    <a href="{{ $insightsUrl }}" class="button">Read the Latest Insights</a>

    <p>Meanwhile, the <a href="{{ $toolsUrl }}">free website health check</a> looks over any site for search and speed problems in about a minute.</p>

    <p style="margin-top: 30px; font-size: 14px;">OKJTechnologies, Nairobi</p>
    <p style="font-size: 12px; color: #64748b;">Didn’t sign up, or changed your mind? <a href="{{ $unsubscribeUrl }}">Unsubscribe</a> in one click. See the <a href="{{ $privacyUrl }}">privacy policy</a>.</p>
@endsection
