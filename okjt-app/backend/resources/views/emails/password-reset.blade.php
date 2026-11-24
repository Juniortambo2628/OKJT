@extends('emails.layout')

@section('content')
    <div class="badge">Dashboard sign-in</div>
    <h1>Choose a new password</h1>
    <p>Someone asked to reset the password for your OKJTechnologies dashboard account. If it was you, choose a new one here:</p>

    <a href="{{ $resetUrl }}" class="button">Choose a New Password</a>

    <p>The link works for {{ $expireCount }} minutes.</p>
    <p class="fine">Didn’t ask for this? Ignore this email; your password stays as it is.</p>

    <div class="panel">
        <p class="fine" style="margin: 0 0 6px;">If the button doesn’t open, copy this address into your browser:</p>
        <p class="fine" style="margin: 0; word-break: break-all;"><a href="{{ $resetUrl }}">{{ $resetUrl }}</a></p>
    </div>
@endsection
