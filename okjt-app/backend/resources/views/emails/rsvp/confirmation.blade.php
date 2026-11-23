@extends('emails.layout')

@section('content')
    @if ($rsvp->type === 'early_access')
        <div class="badge">Early access</div>
        <h1>You’re on the early-access list</h1>
        <p>Hi {{ $rsvp->name }}, thanks for your interest. OKJTechnologies will email you as soon as access opens.</p>
    @elseif ($rsvp->attendance === 'declined')
        <div class="badge">RSVP</div>
        <h1>Thanks for letting us know</h1>
        <p>Hi {{ $rsvp->name }}, your reply is recorded: you can’t make it this time.</p>
    @else
        <div class="badge">RSVP</div>
        <h1>Your place is confirmed</h1>
        <p>Hi {{ $rsvp->name }}, your reply is recorded. The details follow by email closer to the date.</p>
    @endif

    <div class="panel">
        <table role="presentation" class="details">
            <tr><td class="label">Email</td><td>{{ $rsvp->email }}</td></tr>
            @if ($rsvp->company)
                <tr><td class="label">Organisation</td><td>{{ $rsvp->company }}</td></tr>
            @endif
            @if ($rsvp->job_title)
                <tr><td class="label">Role</td><td>{{ $rsvp->job_title }}</td></tr>
            @endif
        </table>
    </div>

    <p>Questions? Reply to this email.</p>
    <p style="margin-top: 28px; margin-bottom: 0;">OKJTechnologies</p>
@endsection
