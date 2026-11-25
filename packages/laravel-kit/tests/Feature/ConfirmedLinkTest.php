<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Okjt\Kit\Privacy\ConfirmedAction;
use Okjt\Kit\Tests\TestCase;

/** A link in an email asks before it changes anything (S7), from Tena-host's unsubscribe. */
class ConfirmedLinkTest extends TestCase
{
    public static array $unsubscribed = [];

    protected function defineRoutes($router): void
    {
        Route::confirmedLink('/u/{token}', Unsubscribe::class, 'unsubscribe');
    }

    protected function setUp(): void
    {
        parent::setUp();
        static::$unsubscribed = [];
    }

    public function test_opening_the_link_asks_and_changes_nothing(): void
    {
        $url = URL::signedRoute('unsubscribe', ['token' => 'abc123']);

        $this->get($url)->assertOk()
            ->assertSee('Unsubscribe?')->assertSee('<form method="POST" action="'.e($url).'">', false)
            ->assertHeader('X-Robots-Tag', 'noindex')->assertHeader('Referrer-Policy', 'no-referrer');
        $this->assertSame([], static::$unsubscribed);
    }

    public function test_pressing_the_button_does_it(): void
    {
        $this->post(URL::signedRoute('unsubscribe', ['token' => 'abc123']))->assertOk()->assertSee("You're unsubscribed")->assertDontSee('<form', false);
        $this->assertSame(['abc123'], static::$unsubscribed);
    }

    public function test_an_unsigned_or_unknown_link_does_nothing(): void
    {
        $this->get('/u/abc123')->assertForbidden();
        $this->post('/u/abc123')->assertForbidden();
        $this->get(URL::signedRoute('unsubscribe', ['token' => 'nope']))->assertNotFound();
        $this->post(URL::signedRoute('unsubscribe', ['token' => 'nope']))->assertNotFound();
        $this->assertSame([], static::$unsubscribed);
    }

    public function test_the_page_loads_nothing_from_elsewhere(): void
    {
        $html = $this->get(URL::signedRoute('unsubscribe', ['token' => 'abc123']))->getContent();
        $this->assertDoesNotMatchRegularExpression('/<(script|link)\b/i', $html);
    }
}

class Unsubscribe implements ConfirmedAction
{
    public function prompt(string $token): ?array
    {
        return $token === 'abc123' ? ['title' => 'Unsubscribe?', 'message' => "You won't get offers by email any more.", 'button' => 'Unsubscribe'] : null;
    }

    public function act(string $token): array
    {
        ConfirmedLinkTest::$unsubscribed[] = $token;

        return ['title' => "You're unsubscribed", 'message' => 'Changed your mind? Ask us any time.'];
    }
}
