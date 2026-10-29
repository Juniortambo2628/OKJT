<?php

namespace Okjt\Kit\Support;

/** The kit's messages (okjt.messages), with ":workspace" filled in from okjt.label. */
final class Messages
{
    public static function get(string $key): string
    {
        return str_replace(':workspace', (string) config('okjt.label'), (string) config("okjt.messages.$key"));
    }
}
