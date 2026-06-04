@extends('emails.layout')

@section('content')
    <div class="badge" style="background-color: #3b82f6; color: #ffffff;">New Action Required</div>
    <h1>New Consultation Request</h1>
    <p>A new consultation request has been submitted through the OKJTech website.</p>

    <div style="background-color: #050a1b; padding: 25px; border-radius: 8px; border: 1px solid #1e293b; margin: 20px 0;">
        <h3 style="color: #3b82f6; margin-top: 0;">Request Details:</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;">Name:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">{{ $requestData->first_name }} {{ $requestData->last_name }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b;">Email:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #3b82f6;">{{ $requestData->email }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b;">Subject:</td>
                <td style="padding: 8px 0; color: #ffffff;">{{ $requestData->subject ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Message:</td>
                <td style="padding: 8px 0; color: #cbd5e1; line-height: 1.5;">{{ $requestData->message }}</td>
            </tr>
        </table>
    </div>

    <a href="{{ config('app.frontend_url') }}/admin/requests" class="button">View in Dashboard</a>

    <p style="margin-top: 30px; font-size: 12px; color: #64748b;">This is an automated notification from the OKJTech CMS.</p>
@endsection
