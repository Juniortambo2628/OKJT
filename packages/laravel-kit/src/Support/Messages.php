<?php

namespace Okjt\Kit\Support;

/**
 * The kit's messages (okjt.messages), with ":workspace" filled in from
 * okjt.label.
 *
 * Laravel merges a package's config only at the top level, so a project
 * whose published config/okjt.php has its own `messages` never sees a
 * message the kit adds later (Naoa's and Najenga's don't). A key the
 * project's list lacks falls back to the kit's own wording.
 */
final class Messages
{
    /** @var array<string, string>|null */
    private static ?array $kitMessages = null;

    public static function get(string $key): string
    {
        $message = config("okjt.messages.$key");
        if ($message === null || $message === '') {
            $message = self::kitMessages()[$key] ?? '';
        }

        return str_replace(':workspace', (string) config('okjt.label'), (string) $message);
    }

    /** The messages as the kit ships them (config/okjt.php in the package). */
    private static function kitMessages(): array
    {
        return self::$kitMessages ??= (require __DIR__.'/../../config/okjt.php')['messages'] ?? [];
    }
}
