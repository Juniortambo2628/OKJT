@component('mail::message')
# Thank you for reaching out, {{ $submission->name }}!

We’ve received your message and will get back to you as soon as possible.

@component('mail::panel')
**Message:**  
{{ $submission->message }}
@endcomponent

@if($submission->online_consultation && $submission->consultation_date && $submission->consultation_time)
**Requested Consultation:**  
{{ \Carbon\Carbon::parse($submission->consultation_date)->toFormattedDateString() }} at {{ $submission->consultation_time }}
@endif

If any of the details you provided are incorrect, just reply to this email and let us know.

Thanks,<br>
{{ config('app.name') }}
@endcomponent


