<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Blade;
use App\Models\SiteSetting;

class EmailTemplateController extends Controller
{
    public function preview(Request $request)
    {
        $request->validate([
            'template_key' => 'required|string',
            'content' => 'required|string',
        ]);

        $dummyData = (object)[
            'first_name' => 'Alexander',
            'last_name' => 'Hamilton',
            'email' => 'a.hamilton@treasury.gov',
            'subject' => 'Strategic Advisory Inquiry',
            'message' => 'This is a sample message to demonstrate how your email template will look with actual data. Organisation: The Treasury. Objective: Market Entry.',
            'status' => 'pending'
        ];

        try {
            // We use a temporary blade string to render the content
            // Note: This expects the content to be a complete blade string including @extends if needed,
            // or we wrap it in our layout.
            
            $content = $request->content;
            
            // If the content doesn't start with @extends, we might want to wrap it in the layout for preview
            if (!str_contains($content, '@extends')) {
                $content = "@extends('emails.layout')\n@section('content')\n" . $content . "\n@endsection";
            }

            $rendered = Blade::render($content, ['requestData' => $dummyData]);
            
            return response()->json(['html' => $rendered]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Template Error: ' . $e->getMessage()], 422);
        }
    }
}
