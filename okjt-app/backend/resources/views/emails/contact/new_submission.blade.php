@component('mail::message')
# New Contact Submission

You have received a new contact submission from **{{ $submission->name }}**.

@component('mail::panel')
**Name:** {{ $submission->name }}  
**Email:** {{ $submission->email }}  
@if($submission->phone_number)
**Phone:** {{ $submission->country_code }} {{ $submission->phone_number }}  
@endif
**Preferred Contact:** {{ ucfirst($submission->contact_method) }}

**Message:**  
{{ $submission->message }}
@endcomponent

@if($submission->online_consultation && $submission->consultation_date && $submission->consultation_time)
**Requested Consultation:**  
{{ \Carbon\Carbon::parse($submission->consultation_date)->toFormattedDateString() }} at {{ $submission->consultation_time }}
@endif

@component('mail::button', ['url' => config('app.url') . '/admin/submissions'])
View in Admin
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent


