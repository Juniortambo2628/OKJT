<?php

namespace Okjt\Kit\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Okjt\Kit\Privacy\ConfirmedAction;

/**
 * The two halves of a confirmed link (Route::confirmedLink): GET asks, POST
 * (the button, to the same signed address) acts. The page is self-contained
 * (no scripts, fonts or stylesheets from elsewhere) and kept out of search
 * engines; a project can use its own view (okjt.confirmed_link.view).
 */
class ConfirmedLinkController extends Controller
{
    public function show(Request $request): Response
    {
        $prompt = $this->action($request)->prompt((string) $request->route('token'));
        abort_if($prompt === null, 404);

        return $this->page($prompt + ['action' => $request->fullUrl()]);
    }

    public function confirm(Request $request): Response
    {
        $action = $this->action($request);
        $token = (string) $request->route('token');
        abort_if($action->prompt($token) === null, 404);

        return $this->page($action->act($token));
    }

    private function action(Request $request): ConfirmedAction
    {
        $action = app($request->route('okjt_action'));
        abort_unless($action instanceof ConfirmedAction, 500, 'A confirmed link needs a ConfirmedAction.');

        return $action;
    }

    private function page(array $data): Response
    {
        return response()->view(config('okjt.confirmed_link.view', 'okjt::confirmed-link'), $data + [
            'brand' => config('okjt.confirmed_link.brand') ?: config('app.name'),
            'button' => null,
            'action' => null,
        ])->header('X-Robots-Tag', 'noindex')->header('Referrer-Policy', 'no-referrer')->header('Cache-Control', 'no-store');
    }
}
