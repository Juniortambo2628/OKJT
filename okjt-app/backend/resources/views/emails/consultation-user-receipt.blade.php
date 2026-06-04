@extends('emails.layout')

@section('content')
    <div class="badge">Request Received</div>
    <h1>Hello, {{ $requestData->first_name }}!</h1>
    <p>Thank you for reaching out to OKJTech. We have successfully received your request for a consultation regarding <strong>&ldquo;{{ $requestData->subject ?? 'General Inquiry' }}&rdquo;</strong>.</p>
    
    <p>Our advisory team is currently reviewing your details and will get back to you within 24-48 business hours to discuss your requirements and schedule a session.</p>

    <div style="background-color: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0;">
        <h3 style="margin-bottom: 10px; color: #3b82f6;">Your Message Summary:</h3>
        <p style="font-style: italic; margin: 0; color: #475569;">&ldquo;{{ $requestData->message }}&rdquo;</p>
    </div>

    <p>In the meantime, feel free to explore our latest market intelligence and insights:</p>
    
    <a href="{{ config('app.frontend_url') }}/insights" class="button">View Latest Insights</a>

    <p style="margin-top: 30px; font-size: 14px;">Best regards,<br>The OKJTech Team</p>
@endsection
