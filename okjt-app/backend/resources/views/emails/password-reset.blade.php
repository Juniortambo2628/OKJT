@extends('emails.layout')

@section('content')
    <div class="badge" style="background-color: #ef4444; color: #ffffff;">Security Alert</div>
    <h1>Password Reset Request</h1>
    <p>You are receiving this email because we received a password reset request for your OKJTech account.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $resetUrl }}" class="button" style="background-color: #ef4444;">Reset Password</a>
    </div>

    <p style="font-size: 14px;">This password reset link will expire in {{ $expireCount }} minutes.</p>

    <p style="font-size: 14px; color: #64748b; margin-top: 20px;">If you did not request a password reset, no further action is required. Your account remains secure.</p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
        <p>If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:</p>
        <p style="word-break: break-all; color: #3b82f6;">{{ $resetUrl }}</p>
    </div>
@endsection
