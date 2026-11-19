<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\SiteCheckReport;
use App\Models\SiteCheck;
use App\Models\Subscriber;
use App\Support\SiteCheck\SiteChecker;
use App\Support\SiteCheck\SiteCheckException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/** The website health check: run one, read a report, add its speed scores, email it. */
class SiteCheckController extends Controller
{
    public function store(Request $request, SiteChecker $checker): JsonResponse
    {
        $data = $request->validate(['url' => 'required|string|max:2048']);

        try {
            $report = $checker->check($data['url']);
        } catch (SiteCheckException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $check = SiteCheck::create([
            'url' => $report['final_url'],
            'host' => (string) parse_url($report['final_url'], PHP_URL_HOST),
            'report' => $report,
        ]);

        return response()->json(['data' => $this->present($check)], 201);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => $this->present(SiteCheck::current()->findOrFail($id))]);
    }

    /**
     * The speed scores from Google PageSpeed Insights, which the visitor's
     * browser asks for (it can take half a minute). Set once per report.
     */
    public function speed(Request $request, string $id): JsonResponse
    {
        $check = SiteCheck::current()->findOrFail($id);
        if ($check->speed !== null) {
            return response()->json(['data' => $this->present($check)]);
        }
        $scores = $request->validate([
            'performance' => 'nullable|integer|between:0,100',
            'accessibility' => 'nullable|integer|between:0,100',
            'best_practices' => 'nullable|integer|between:0,100',
            'seo' => 'nullable|integer|between:0,100',
            'lcp_ms' => 'nullable|integer|between:0,120000',
            'cls' => 'nullable|numeric|between:0,10',
        ]);
        $check->update(['speed' => $scores]);

        return response()->json(['data' => $this->present($check)]);
    }

    /** Emails the report's link, and adds the address to Subscribers when asked. */
    public function email(Request $request, string $id): JsonResponse
    {
        $check = SiteCheck::current()->findOrFail($id);
        $data = $request->validate(['email' => 'required|email|max:255', 'subscribe' => 'boolean']);

        if ($data['subscribe'] ?? false) {
            $subscriber = Subscriber::withTrashed()->firstOrNew(['email' => strtolower($data['email'])]);
            $subscriber->fill(['source' => $subscriber->source ?: 'site-check', 'is_active' => true]);
            $subscriber->deleted_at = null;
            $subscriber->save();
        }

        try {
            Mail::to($data['email'])->send(new SiteCheckReport($check));
        } catch (\Throwable $e) {
            Log::error('Failed to send a site check report: '.$e->getMessage());

            return response()->json(['message' => 'The email could not be sent. Copy the report’s address instead.'], 502);
        }

        return response()->json(['message' => 'Sent.']);
    }

    private function present(SiteCheck $check): array
    {
        return [
            'id' => $check->id,
            'url' => $check->url,
            'report' => $check->report,
            'speed' => $check->speed,
            'created_at' => $check->created_at,
            'expires_at' => $check->created_at->copy()->addDays(SiteCheck::KEEP_DAYS),
        ];
    }
}
