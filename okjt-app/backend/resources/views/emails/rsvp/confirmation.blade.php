<x-mail::message>
# <div style="text-align: center;"><img src="{{ $logoUrl }}" alt="OKJTech Logo" style="height: 60px; margin-bottom: 20px;"></div>

@if($rsvp->type === 'early_access')
# Access Requested Successfully
@elseif($rsvp->type === 'rsvp')
    @if($rsvp->attendance === 'accepted')
# Dinner RSVP Confirmed
    @else
# Dinner RSVP Declined
    @endif
@endif

Hi {{ $rsvp->name }},

@if($rsvp->type === 'early_access')
Thank you for your interest in the OKJTech platform. You have successfully been added to our exclusive early access list! Our team is currently preparing a revolutionary market intelligence platform designed around your needs. 
@elseif($rsvp->type === 'rsvp')
    @if($rsvp->attendance === 'accepted')
We are delighted to confirm your attendance for the OKJTech Launch Event dinner! We look forward to seeing you.
    @else
We have received your decline for the dinner event. We're sorry you can't make it, but we appreciate you letting us know.
    @endif
@endif

@if($rsvp->type === 'early_access' || ($rsvp->type === 'rsvp' && $rsvp->attendance === 'accepted'))
We will notify you the moment the platform goes live so you can begin exploring our data and insights.
@endif

<x-mail::panel>
**Your Information Logged:**
- **Email:** {{ $rsvp->email }}
@if($rsvp->company)
- **Organization:** {{ $rsvp->company }}
@endif
@if($rsvp->job_title)
- **Position:** {{ $rsvp->job_title }}
@endif
</x-mail::panel>

@if($rsvp->type === 'rsvp' && $rsvp->attendance === 'accepted')
<x-mail::panel>
**Event Details:**
- **Venue:** The Sage Delicacy, Gigiri
- **Date:** March 20th, 2026
- **Time:** 7:00 P.M. - 9:00 P.M.
</x-mail::panel>
@endif

If you have any immediate questions, feel free to reply directly to this email.

Best regards,<br>
The OKJTech Team
</x-mail::message>
