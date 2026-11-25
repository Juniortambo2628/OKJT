<?php

namespace Okjt\Kit\Privacy;

/**
 * What a confirmed link does (Route::confirmedLink), from Tena-host's
 * unsubscribe page: the link in an email only opens a page that asks; the
 * change happens when the person presses the button. Email security
 * scanners open every link, so a link that acted straight away unsubscribed
 * people who never asked.
 */
interface ConfirmedAction
{
    /**
     * What the page asks for this token: ['title' => 'Unsubscribe?',
     * 'message' => "You won't get offers from X by email any more.",
     * 'button' => 'Unsubscribe'], or null when the token is no good (404).
     */
    public function prompt(string $token): ?array;

    /** Do it. What the page then says: ['title' => ..., 'message' => ...]. */
    public function act(string $token): array;
}
