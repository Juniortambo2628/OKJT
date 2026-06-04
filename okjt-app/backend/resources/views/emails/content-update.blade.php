@extends('emails.layout')

@section('content')
    <div class="badge">{{ $categoryLabel }} Update</div>
    <h1>New {{ $typeLabel }} Published</h1>
    <p>We're excited to share our latest {{ strtolower($typeLabel) }} with you on OKJTech.</p>

    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 25px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        @if($imageUrl)
            <img src="{{ $imageUrl }}" alt="{{ $title }}" style="width: 100%; height: auto; display: block;">
        @endif
        <div style="padding: 25px;">
            <h2 style="margin: 0; font-size: 20px; color: #0f172a;">{{ $title }}</h2>
            <p style="color: #64748b; font-size: 14px; margin: 10px 0 20px; line-height: 1.5;">{{ $excerpt }}</p>
            <a href="{{ $url }}" class="button">Read Full {{ $typeLabel }}</a>
        </div>
    </div>

    <p style="font-size: 14px;">Stay informed with our strategic intelligence and market analysis.</p>

    <p style="margin-top: 30px; font-size: 14px;">Best regards,<br>The OKJTech Editorial Team</p>
@endsection
