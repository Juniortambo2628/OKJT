<?php

namespace App\Support\SiteCheck;

/**
 * A robots.txt file, read the way Google reads it: the group for the most
 * specific user agent that matches (else `*`), and within it the longest
 * matching rule wins, Allow winning a tie. `*` and `$` work in paths.
 */
class RobotsTxt
{
    /** @var array<string, list<array{0: bool, 1: string}>> agent => [[allow, path]] */
    private array $groups = [];

    /** @var list<string> */
    public array $sitemaps = [];

    public function __construct(string $content)
    {
        $agents = [];
        $inRules = false;
        foreach (preg_split('/\r\n|\r|\n/', $content) as $line) {
            $line = trim(preg_replace('/#.*$/', '', $line));
            if (! str_contains($line, ':')) {
                continue;
            }
            [$field, $value] = array_map('trim', explode(':', $line, 2));
            $field = strtolower($field);

            if ($field === 'sitemap') {
                $this->sitemaps[] = $value;
            } elseif ($field === 'user-agent') {
                if ($inRules) {
                    $agents = [];
                    $inRules = false;
                }
                $agents[] = strtolower($value);
                $this->groups[strtolower($value)] ??= [];
            } elseif ($field === 'allow' || $field === 'disallow') {
                $inRules = true;
                if ($value === '') {
                    continue; // "Disallow:" with nothing allows everything.
                }
                foreach ($agents as $agent) {
                    $this->groups[$agent][] = [$field === 'allow', $value];
                }
            }
        }
    }

    /** Whether $agent (e.g. "googlebot") may fetch $path (path and query). */
    public function allows(string $path, string $agent = 'googlebot'): bool
    {
        $rules = $this->rulesFor(strtolower($agent));
        $best = null;
        foreach ($rules as [$allow, $pattern]) {
            if (! $this->matches($pattern, $path)) {
                continue;
            }
            $length = strlen($pattern);
            if ($best === null || $length > $best[1] || ($length === $best[1] && $allow)) {
                $best = [$allow, $length];
            }
        }

        return $best === null || $best[0];
    }

    /** The rules of the group that applies to $agent. */
    private function rulesFor(string $agent): array
    {
        $match = null;
        foreach (array_keys($this->groups) as $name) {
            if ($name !== '*' && str_starts_with($agent, $name) && ($match === null || strlen($name) > strlen($match))) {
                $match = $name;
            }
        }

        return $this->groups[$match ?? '*'] ?? [];
    }

    private function matches(string $pattern, string $path): bool
    {
        $anchored = str_ends_with($pattern, '$');
        $body = $anchored ? substr($pattern, 0, -1) : $pattern;
        $regex = '#^'.str_replace('\*', '.*', preg_quote($body, '#')).($anchored ? '$' : '').'#';

        return (bool) preg_match($regex, $path);
    }
}
