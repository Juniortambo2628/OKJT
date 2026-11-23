@extends('emails.layout')

@section('content')
    <div class="badge">New brief</div>
    <h1>{{ trim($requestData->first_name.' '.$requestData->last_name) }} sent a brief</h1>
    <p>From the contact form on okjtech.co.ke. Reply to this email to answer them directly.</p>

    <div class="panel">
        <table role="presentation" class="details">
            <tr><td class="label">Name</td><td>{{ trim($requestData->first_name.' '.$requestData->last_name) }}</td></tr>
            <tr><td class="label">Email</td><td><a href="mailto:{{ $requestData->email }}">{{ $requestData->email }}</a></td></tr>
            @if (! empty($requestData->subject))
                <tr><td class="label">Subject</td><td>{{ $requestData->subject }}</td></tr>
            @endif
            @if (! empty($requestData->budget))
                <tr><td class="label">Budget</td><td>{{ $requestData->budget }}</td></tr>
            @endif
            @if (! empty($requestData->timeline))
                <tr><td class="label">Timeline</td><td>{{ $requestData->timeline }}</td></tr>
            @endif
            <tr><td class="label">Message</td><td style="white-space: pre-line;">{{ $requestData->message }}</td></tr>
        </table>
    </div>

    <a href="{{ $dashboardUrl }}" class="button">Open Enquiries</a>
@endsection
