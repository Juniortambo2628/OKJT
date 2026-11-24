<?php

namespace App\Support\SiteCheck;

use Closure;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Fetches a page on the public web for the site check, and nothing else:
 * http(s) on the usual ports only, every address the name resolves to must
 * be public (no private, loopback, link-local or reserved ranges), the
 * connection is pinned to the address that was checked (so a second DNS
 * answer can't point it elsewhere), redirects are followed by hand and each
 * hop is checked again, and the body is capped.
 */
class SafeFetcher
{
    public const MAX_BYTES = 2_000_000;

    public const MAX_REDIRECTS = 5;

    public const USER_AGENT = 'OKJTech-SiteCheck/1.0 (+https://okjtech.co.ke/tools/site-check)';

    /** @var Closure(string): list<string> host => its IP addresses */
    private Closure $resolve;

    public function __construct(?Closure $resolve = null)
    {
        $this->resolve = $resolve ?? fn (string $host) => self::dns($host);
    }

    /**
     * GET $url, following up to MAX_REDIRECTS redirects.
     *
     * @return array{url: string, status: int, headers: array<string, string>, body: string, redirects: list<array{from: string, to: string, status: int}>}
     *
     * @throws SiteCheckException for an address that may not be fetched or can't be reached
     */
    public function get(string $url): array
    {
        $redirects = [];
        for ($hop = 0; $hop <= self::MAX_REDIRECTS; $hop++) {
            $response = $this->once($url);
            $location = $response['headers']['location'] ?? null;
            if ($response['status'] >= 300 && $response['status'] < 400 && $location) {
                $next = self::absolute($location, $url);
                $redirects[] = ['from' => $url, 'to' => $next, 'status' => $response['status']];
                $url = $next;

                continue;
            }

            return $response + ['url' => $url, 'redirects' => $redirects];
        }

        throw new SiteCheckException('The address redirects more than '.self::MAX_REDIRECTS.' times.');
    }

    /** One request, no redirects. */
    private function once(string $url): array
    {
        [$host, $port] = $this->target($url);
        $ip = $this->publicAddress($host);
        $resolve = ($ip !== $host) ? [CURLOPT_RESOLVE => ["{$host}:{$port}:".(str_contains($ip, ':') ? "[{$ip}]" : $ip)]] : [];

        try {
            $response = Http::withHeaders(['User-Agent' => self::USER_AGENT, 'Accept' => 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5'])
                ->withOptions([
                    'allow_redirects' => false,
                    'curl' => $resolve + [CURLOPT_MAXFILESIZE => self::MAX_BYTES, CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS],
                    'progress' => function ($total, $downloaded) {
                        if ($downloaded > self::MAX_BYTES) {
                            throw new RuntimeException('too large');
                        }
                    },
                ])
                ->connectTimeout(5)
                ->timeout(12)
                ->get($url);
        } catch (\Throwable $e) {
            throw new SiteCheckException('The site could not be reached ('.self::reason($e).').');
        }

        $headers = [];
        foreach ($response->headers() as $name => $values) {
            $headers[strtolower($name)] = implode(', ', (array) $values);
        }

        return ['status' => $response->status(), 'headers' => $headers, 'body' => substr($response->body(), 0, self::MAX_BYTES)];
    }

    /** [host, port] of an address the check may fetch. */
    private function target(string $url): array
    {
        $parts = parse_url($url);
        $scheme = strtolower($parts['scheme'] ?? '');
        $host = strtolower(trim($parts['host'] ?? '', '[]'));
        if (! in_array($scheme, ['http', 'https'], true) || $host === '') {
            throw new SiteCheckException('Only http and https addresses can be checked.');
        }
        if (isset($parts['user']) || isset($parts['pass'])) {
            throw new SiteCheckException('Addresses with a user name or password can’t be checked.');
        }
        $port = (int) ($parts['port'] ?? ($scheme === 'https' ? 443 : 80));
        if (! in_array($port, [80, 443], true)) {
            throw new SiteCheckException('Only sites on the usual ports (80 and 443) can be checked.');
        }

        return [$host, $port];
    }

    /** One public address for $host, or an exception if any address it has is not public. */
    private function publicAddress(string $host): string
    {
        $addresses = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : ($this->resolve)($host);
        if ($addresses === []) {
            throw new SiteCheckException('That domain name doesn’t exist.');
        }
        foreach ($addresses as $address) {
            if (! self::isPublic($address)) {
                throw new SiteCheckException('Only sites on the public internet can be checked.');
            }
        }

        return $addresses[0];
    }

    public static function isPublic(string $ip): bool
    {
        // An IPv4 address written as IPv6 (::ffff:10.0.0.1) is judged as IPv4.
        if (preg_match('/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i', $ip, $m)) {
            $ip = $m[1];
        }
        if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return false;
        }
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $long = ip2long($ip);
            foreach ([['100.64.0.0', 10], ['192.0.0.0', 24], ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4]] as [$net, $bits]) {
                $mask = -1 << (32 - $bits);
                if (($long & $mask) === (ip2long($net) & $mask)) {
                    return false;
                }
            }

            return true;
        }
        $lower = strtolower($ip);

        // IPv6: unique local (fc00::/7), link-local (fe80::/10), multicast (ff00::/8), NAT64 and documentation ranges.
        return ! preg_match('/^(f[cd]|fe[89ab]|ff|64:ff9b:|2001:db8:|::)/', $lower);
    }

    /** @return list<string> */
    private static function dns(string $host): array
    {
        $records = @dns_get_record($host, DNS_A | DNS_AAAA) ?: [];
        $ips = [];
        foreach ($records as $record) {
            $ips[] = $record['ip'] ?? $record['ipv6'] ?? null;
        }

        return array_values(array_unique(array_filter($ips)));
    }

    public static function absolute(string $location, string $base): string
    {
        if (preg_match('#^https?://#i', $location)) {
            return $location;
        }
        $parts = parse_url($base);
        $origin = $parts['scheme'].'://'.$parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : '');
        if (str_starts_with($location, '//')) {
            return $parts['scheme'].':'.$location;
        }
        if (str_starts_with($location, '/')) {
            return $origin.$location;
        }
        $dir = preg_replace('#/[^/]*$#', '/', $parts['path'] ?? '/');

        return $origin.$dir.$location;
    }

    private static function reason(\Throwable $e): string
    {
        $message = $e->getMessage();

        return match (true) {
            str_contains($message, 'timed out') || str_contains($message, 'Timeout') => 'it took too long to answer',
            str_contains($message, 'too large') || str_contains($message, 'maximum file size') => 'the page is larger than 2 MB',
            str_contains($message, 'SSL') || str_contains($message, 'certificate') => 'its HTTPS certificate was refused',
            default => 'the connection failed',
        };
    }
}
