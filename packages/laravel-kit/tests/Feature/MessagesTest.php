<?php

namespace Okjt\Kit\Tests\Feature;

use Okjt\Kit\Support\Messages;
use Okjt\Kit\Tests\TestCase;

class MessagesTest extends TestCase
{
    public function test_the_projects_wording_wins(): void
    {
        config(['okjt.messages.no_access' => 'Not yours, sorry.']);

        $this->assertSame('Not yours, sorry.', Messages::get('no_access'));
    }

    public function test_a_message_missing_from_a_published_list_falls_back_to_the_kits(): void
    {
        // A project's published config/okjt.php, written before passkey_failed existed.
        config(['okjt.messages' => ['bad_credentials' => 'Wrong password.'], 'okjt.label' => 'wedding']);

        $this->assertSame('Wrong password.', Messages::get('bad_credentials'));
        $this->assertStringStartsWith('This passkey couldn’t be used.', Messages::get('passkey_failed'));
        $this->assertSame('This wedding could not be found.', Messages::get('not_found'));
    }

    public function test_an_unknown_key_is_empty(): void
    {
        $this->assertSame('', Messages::get('no_such_message'));
    }
}
