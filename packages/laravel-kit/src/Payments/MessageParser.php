<?php

namespace Okjt\Kit\Payments;

use Illuminate\Support\Carbon;

/**
 * Reads pasted M-Pesa and bank payment messages without AI, lifted from Naoa
 * with its tests. Each message becomes one record: what kind it is, how
 * much, to whom (name, phone, paybill or till with account, bank account,
 * possibly masked), the reference codes and when. Text that isn't a
 * recognised payment message comes back as "unknown" so a person can see it
 * was skipped; Fuliza notices as "info"; reversals as "reversal" (with the
 * code they reverse).
 *
 * Formats come from real Kenyan messages: Safaricom's own confirmations, and
 * the ones banks send for transfers to M-Pesa, paybills, tills, other banks
 * and PesaLink. It also reads the one-line "Transfer slip (…) ref …: KES …
 * to …" a project writes from a PDF or screenshot (Naoa's slip reader).
 * Dates are day first, as Kenyan messages write them.
 *
 *   app(MessageParser::class)->parse($pasted);   // one record per message
 *
 * Kinds: mpesa_send, mpesa_till, mpesa_paybill, mpesa_to_bank, bank_debit,
 * bank_to_mpesa, bank_to_paybill, bank_to_till, pesalink, transfer_slip,
 * reversal, info, unknown.
 */
class MessageParser
{
    private const AMOUNT = '(?:KES|Ksh|KSh|KSH|Kshs)\.?\s*([\d,]+(?:\.\d{1,2})?)';

    private const CODE = '[A-Z0-9]{10}';

    /** @return list<array<string, mixed>> */
    public function parse(string $text): array
    {
        return array_values(array_map(fn (string $m) => $this->parseOne($m), $this->split($text)));
    }

    /**
     * Pasted text holds several messages. A new one starts at a blank line,
     * at "Transfer slip (", at "<CODE> Confirmed", or at a bank greeting / "Your account …" / an
     * amount at the start of a line.
     *
     * @return list<string>
     */
    public function split(string $text): array
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $starts = '(?=Transfer slip \()|(?=\b'.self::CODE.'\s+Confirmed)|(?=Dear\s)|(?=Your account\s)|(?=^\s*(?:KES|Ksh)\s?[\d,])';
        $parts = preg_split('/\n\s*\n|'.$starts.'/m', $text) ?: [];

        return array_values(array_filter(array_map(fn ($p) => trim(preg_replace('/\s+/', ' ', $p)), $parts), fn ($p) => strlen($p) > 15));
    }

    /** @return array<string, mixed> */
    public function parseOne(string $raw): array
    {
        $m = fn (string $pattern) => preg_match($pattern, $raw, $match) ? $match : null;
        $base = ['raw' => $raw, 'kind' => 'unknown', 'amount' => null, 'payee' => null, 'phone' => null, 'paybill' => null,
            'till' => null, 'account' => null, 'bank' => null, 'bank_account' => null, 'mpesa_ref' => null, 'bank_ref' => null,
            'at' => null, 'channel' => null, 'cost' => null, 'via' => null, 'purpose' => null];

        // 0. A transfer slip read from a PDF or screenshot (TransferSlipReader, or Claude for photos):
        // "Transfer slip (SWIFT) ref FTC260618ZBAV: KES 210,965.00 to TILE CARPET CENTRE LTD, account 0705011133, bank ABSA, on 18/06/2026 at 09:20. For: …"
        if ($x = $m('/^Transfer slip \(([^)]+)\) ref (\S+?):\s*(?:[A-Z]{3}\s*)?([\d,]+(?:\.\d{1,2})?) to (.+?)(?=, (?:account|phone|till|bank|on) )/i')) {
            $field = fn (string $key) => $m('/, '.$key.' (.+?)(?=, (?:account|phone|till|bank|on) |\.\s|\.?$)/i')[1] ?? null;
            $mpesa = stripos($x[1], 'pesa') !== false && stripos($x[1], 'pesalink') === false;
            $ref = strcasecmp($x[2], 'none') === 0 ? null : $x[2];
            $phone = $field('phone');
            $till = $field('till');
            $account = $field('account');

            return ['kind' => 'transfer_slip', 'via' => $x[1], 'channel' => $mpesa ? 'mpesa' : 'bank', 'amount' => $this->money($x[3]),
                'payee' => $this->name($x[4]), 'phone' => $phone, 'till' => $till,
                'account' => $mpesa ? $account : null, 'bank_account' => $mpesa ? null : $account, 'bank' => $field('bank'),
                'mpesa_ref' => $mpesa ? $ref : null, 'bank_ref' => $mpesa ? null : $ref,
                'purpose' => $m('/\bFor: (.+?)\.?$/')[1] ?? null, 'at' => $this->when($raw)] + $base;
        }

        // Reversal of an earlier M-Pesa transaction.
        if ($x = $m('/Transaction\s+('.self::CODE.')\s+has\s+been\s+reversed/i')) {
            return ['kind' => 'reversal', 'reverses' => $x[1], 'mpesa_ref' => $m('/^('.self::CODE.')\s+Confirmed/')[1] ?? null,
                'at' => $this->when($raw)] + $base;
        }
        // Fuliza notices are about a loan, not a payment to a vendor.
        if (preg_match('/Fuliza/i', $raw) && ! preg_match('/\b(sent|paid)\s+to\b/i', $raw)) {
            return ['kind' => 'info', 'note' => 'Fuliza notice'] + $base;
        }

        // 1. Bank debit alert: "Your account 648****019 has been debited with KES 100,000.00 on 06/02/2026 at 11:44. Ref: FTC…"
        if ($x = $m('/Your account\s+(\S+)\s+has been debited with\s+'.self::AMOUNT.'/i')) {
            return ['kind' => 'bank_debit', 'channel' => 'bank', 'amount' => $this->money($x[2]), 'payer_account' => $x[1],
                'bank_ref' => $m('/Ref:?\s*([A-Z0-9]{8,})/')[1] ?? null, 'at' => $this->when($raw)] + $base;
        }

        // 2. Bank to M-Pesa (NCBA): "your MPESA transfer of KES. 100000.00 to Humphreys Were (254722609603) has been processed … MPESA ref number UB2KE5HAB6"
        if ($x = $m('/MPESA transfer of\s+'.self::AMOUNT.'\s+to\s+(.+?)\s*\((\+?\d{9,12})\)/i')) {
            return ['kind' => 'bank_to_mpesa', 'channel' => 'mpesa', 'amount' => $this->money($x[1]), 'payee' => $this->name($x[2]),
                'phone' => $x[3], 'mpesa_ref' => $m('/MPESA ref(?:erence)?\s*(?:number|no\.?)?\s*:?\s*('.self::CODE.')/i')[1] ?? null,
                'bank' => $this->bankName($raw), 'at' => $this->when($raw)] + $base;
        }

        // 3. Bank to paybill / till: "KES 150,000.00 paid to JUMBO STEEL MILLS … (Acc 77710) on 10/06/26 at 03:02 PM Ref: UFAIS76GN2"
        if ($x = $m('/^'.self::AMOUNT.'\s+paid to\s+(.+?)\s*\(Acc\.?\s*([\w-]+)\)/i')) {
            return ['kind' => 'bank_to_paybill', 'channel' => 'mpesa', 'amount' => $this->money($x[1]), 'payee' => $this->name($x[2]),
                'account' => $x[3], 'mpesa_ref' => $m('/Ref:?\s*('.self::CODE.')/')[1] ?? null, 'at' => $this->when($raw)] + $base;
        }

        // 4. Bank M-Pesa to a paybill: "you have sent Ksh. 22130.0 to BARON AFRICA VENTURES LTD for 40025362 … MPESA Ref. UBBSG83IGZ"
        if ($x = $m('/you have sent\s+'.self::AMOUNT.'\s+to\s+(.+?)\s+for\s+([\w-]+)\s+on/i')) {
            return ['kind' => 'bank_to_paybill', 'channel' => 'mpesa', 'amount' => $this->money($x[1]), 'payee' => $this->name($x[2]),
                'account' => $x[3], 'mpesa_ref' => $m('/MPESA Ref\.?\s*('.self::CODE.')/i')[1] ?? null, 'bank' => $this->bankName($raw),
                'at' => $this->when($raw)] + $base;
        }

        // 5. Bank M-Pesa to a till: "KES 85870.00 Mpesa Payment to ETIHARDWARE-850312 from NCBA Bank M-pesa … REF TJ8SG29W8P"
        if ($x = $m('/^'.self::AMOUNT.'\s+Mpesa Payment to\s+(.+?)-(\d{5,7})\s+from/i')) {
            return ['kind' => 'bank_to_till', 'channel' => 'mpesa', 'amount' => $this->money($x[1]), 'payee' => $this->name($x[2]),
                'till' => $x[3], 'mpesa_ref' => $m('/REF\.?\s*('.self::CODE.')/')[1] ?? null, 'bank' => $this->bankName($raw),
                'at' => $this->when($raw)] + $base;
        }

        // 6. PesaLink: "KES 573,451 sent to THURA ENTERPRISES LI A/C ****7877. Pesalink …"
        if ($x = $m('/^'.self::AMOUNT.'\s+sent to\s+(.+?)\s+A\/C\s+([\dX*]{4,})/i')) {
            return ['kind' => 'pesalink', 'channel' => 'bank', 'amount' => $this->money($x[1]), 'payee' => $this->name($x[2]),
                'bank_account' => $x[3], 'bank_ref' => $m('/r1=([\w]+)/')[1] ?? null, 'at' => $this->when($raw)] + $base;
        }

        // 7. M-Pesa deposit to a bank account: "You have deposited KES42440.0 MPESA ref UG6ISA5SCT to account XX7199 for TWINKID ELECTRICALS LIMITED through Absa"
        if ($x = $m('/deposited\s+'.self::AMOUNT.'\s+MPESA ref\s+('.self::CODE.')\s+(?:to|for) account\s+([\dX*]+)\s+for\s+(.+?)\s+through\s+(.+?)(?:\.|$)/i')) {
            return ['kind' => 'mpesa_to_bank', 'channel' => 'mpesa', 'amount' => $this->money($x[1]), 'mpesa_ref' => $x[2],
                'bank_account' => $x[3], 'payee' => $this->name($x[4]), 'bank' => trim($x[5]), 'at' => $this->when($raw)] + $base;
        }

        // Safaricom confirmations start with the code.
        $code = $m('/^('.self::CODE.')\s+Confirmed\.?/')[1] ?? null;
        $common = ['mpesa_ref' => $code, 'channel' => 'mpesa', 'at' => $this->when($raw),
            'cost' => ($c = $m('/Transaction cost,?\s*'.self::AMOUNT.'/i')) ? $this->money($c[1]) : null];

        // 8. To a bank via M-Pesa: "Ksh 70872.00 sent to KCB account BERNARD OTIENO OWINO 8050478 has been received … M-PESA Ref UG8SG34JM8"
        if ($x = $m('/'.self::AMOUNT.'\s+sent to\s+(\w+)\s+account\s+(.+?)\s+(\d{5,})\s+has been received/i')) {
            return ['kind' => 'mpesa_to_bank', 'amount' => $this->money($x[1]), 'bank' => $x[2], 'payee' => $this->name($x[3]),
                'bank_account' => $x[4], 'mpesa_ref' => $code ?? ($m('/M-PESA Ref\.?\s*('.self::CODE.')/i')[1] ?? null)] + $common + $base;
        }
        // 9. Paybill: "Ksh25,950.00 sent to Equity Paybill Account for account 227276 on …"
        if ($x = $m('/'.self::AMOUNT.'\s+sent to\s+(.+?)\s+for account\s+([\w-]+)\s+on/i')) {
            return ['kind' => 'mpesa_paybill', 'amount' => $this->money($x[1]), 'payee' => $this->name($x[2]), 'account' => $x[3]] + $common + $base;
        }
        // 10. Send money: "Ksh9,120.00 sent to THOMAS MAGGA 0716641284 on 6/2/26 at 4:01 PM"
        if ($x = $m('/'.self::AMOUNT.'\s+sent to\s+(.+?)\s+(\+?\d{9,12})\s+on/i')) {
            return ['kind' => 'mpesa_send', 'amount' => $this->money($x[1]), 'payee' => $this->name($x[2]), 'phone' => $x[3]] + $common + $base;
        }
        // 11. Buy goods: "Ksh6,000.00 paid to OILMAK RETAIL LTD - SHELL BUSIA ROAD. on 30/10/26 at 8:08 AM"
        if ($x = $m('/'.self::AMOUNT.'\s+paid to\s+(.+?)\.?\s+on\s+\d/i')) {
            return ['kind' => 'mpesa_till', 'amount' => $this->money($x[1]), 'payee' => $this->name(preg_replace('/\s+VIA\s+\w+$/i', '', $x[2]))] + $common + $base;
        }

        return $base;
    }

    private function money(string $value): float
    {
        return round((float) str_replace(',', '', $value), 2);
    }

    private function name(string $value): string
    {
        return trim(preg_replace('/\s+/', ' ', rtrim(trim($value), '.,')));
    }

    private function bankName(string $raw): ?string
    {
        return preg_match('/\b(NCBA|Equity|KCB|Co-?op(?:erative)?|Absa|I&M|IANDMBANK|Stanbic|DTB|Family)\b/i', $raw, $x) ? strtoupper($x[1]) : null;
    }

    /**
     * The date (and time when given), day first as Kenyan messages write it:
     * 6/2/26, 06/02/2026, "18/10/25 at 4:56 PM", "02/11/2026 at 17:58:10".
     */
    private function when(string $raw): ?string
    {
        if (! preg_match('/\b(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b(?:\s*(?:at\s*)?(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?)?/i', $raw, $x)) {
            return null;
        }
        [$day, $month, $year] = [(int) $x[1], (int) $x[2], (int) $x[3]];
        $year = $year < 100 ? 2000 + $year : $year;
        if (! checkdate($month, $day, $year)) {
            return null;
        }
        $hour = isset($x[4]) && $x[4] !== '' ? (int) $x[4] : null;
        $minute = isset($x[5]) && $x[5] !== '' ? (int) $x[5] : 0;
        if ($hour !== null && ! empty($x[6])) {
            $pm = strtoupper($x[6]) === 'PM';
            $hour = $hour % 12 + ($pm ? 12 : 0);
        }

        $date = Carbon::create($year, $month, $day, $hour ?? 0, $minute);

        return $hour === null ? $date->toDateString() : $date->format('Y-m-d H:i');
    }
}
