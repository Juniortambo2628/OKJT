<?php

namespace Okjt\Kit\Tests\Feature;

use Okjt\Kit\Payments\MessageParser;
use Okjt\Kit\Tests\TestCase;

/** Pasted M-Pesa and bank messages (R5), lifted from Naoa's PaymentMessageTest. */
class MessageParserTest extends TestCase
{
    private function one(string $message): array
    {
        return app(MessageParser::class)->parseOne($message);
    }

    public function test_every_message_family_is_read(): void
    {
        $send = $this->one('UB6IS5SZ1Y Confirmed. Ksh9,120.00 sent to JOHN KAMAU 0712345678 on 6/2/26 at 4:01 PM. New M-PESA balance is Ksh1,668.14. Transaction cost, Ksh108.00.');
        $this->assertSame(['mpesa_send', 9120.0, 'JOHN KAMAU', '0712345678', 'UB6IS5SZ1Y', '2026-02-06 16:01', 108.0],
            [$send['kind'], $send['amount'], $send['payee'], $send['phone'], $send['mpesa_ref'], $send['at'], $send['cost']]);

        $till = $this->one('UJUK802EWF Confirmed. Ksh6,000.00 paid to OILMAK RETAIL LTD - SHELL BUSIA ROAD. on 30/10/26 at 8:08 AM.');
        $this->assertSame(['mpesa_till', 6000.0, 'OILMAK RETAIL LTD - SHELL BUSIA ROAD', '2026-10-30 08:08'], [$till['kind'], $till['amount'], $till['payee'], $till['at']]);

        $paybill = $this->one('UK1K80CPUM Confirmed. Ksh25,950.00 sent to Equity Paybill Account for account 227276 on 1/11/26 at 1:38 PM');
        $this->assertSame(['mpesa_paybill', 25950.0, '227276'], [$paybill['kind'], $paybill['amount'], $paybill['account']]);

        $toBank = $this->one('Ksh 70872.00 sent to KCB account JANE WANJIRU 8050478 has been received on 08/07/2026 at 09:35 PM. M-PESA Ref UG8SG34JM8. To reverse this transaction, SMS this message to 16120');
        $this->assertSame(['mpesa_to_bank', 'KCB', '8050478', 'UG8SG34JM8'], [$toBank['kind'], $toBank['bank'], $toBank['bank_account'], $toBank['mpesa_ref']]);

        $bankMpesa = $this->one('Dear Account Holder, your MPESA transfer of KES. 100000.00 to Peter Otieno (254711222333) has been processed successfully. MPESA ref number UB2KE5HAB6. NCBA, Go for it.');
        $this->assertSame(['bank_to_mpesa', 100000.0, 'Peter Otieno', 'NCBA', 'UB2KE5HAB6'], [$bankMpesa['kind'], $bankMpesa['amount'], $bankMpesa['payee'], $bankMpesa['bank'], $bankMpesa['mpesa_ref']]);

        $debit = $this->one('Your account 648****019 has been debited with KES 100,000.00 on 06/02/2026 at 11:44. Ref: FTC260206LZEV. For queries, call 0711056444');
        $this->assertSame(['bank_debit', 100000.0, 'FTC260206LZEV', '2026-02-06 11:44'], [$debit['kind'], $debit['amount'], $debit['bank_ref'], $debit['at']]);

        $pesalink = $this->one('KES 573,451 sent to THURA ENTERPRISES LI A/C ****7877. Pesalink is available 24/7. NO CUT OFF TIME.');
        $this->assertSame(['pesalink', 573451.0, '****7877'], [$pesalink['kind'], $pesalink['amount'], $pesalink['bank_account']]);

        $deposit = $this->one('Dear Account Holder, You have deposited KES42440.0 MPESA ref UG6ISA5SCT to account XX7199 for TWINKID ELECTRICALS LIMITED through Absa Bank Kenya PLC');
        $this->assertSame(['mpesa_to_bank', 42440.0, 'XX7199', 'TWINKID ELECTRICALS LIMITED'], [$deposit['kind'], $deposit['amount'], $deposit['bank_account'], $deposit['payee']]);

        $ncbaPaybill = $this->one('Dear NCBA Bank M-pesa, you have sent Ksh. 22130.0 to BARON AFRICA VENTURES LTD for 40025362 on 02/11/2026 at 17:58:10. MPESA Ref. UBBSG83IGZ.');
        $this->assertSame(['bank_to_paybill', '40025362', '2026-11-02 17:58'], [$ncbaPaybill['kind'], $ncbaPaybill['account'], $ncbaPaybill['at']]);

        $bankPaybill = $this->one('KES 150,000.00 paid to JUMBO STEEL MILLS LTD (Acc 77710) on 10/06/26 at 03:02 PM Ref: UFAIS76GN2');
        $this->assertSame(['bank_to_paybill', 150000.0, 'JUMBO STEEL MILLS LTD', '77710', 'UFAIS76GN2'], [$bankPaybill['kind'], $bankPaybill['amount'], $bankPaybill['payee'], $bankPaybill['account'], $bankPaybill['mpesa_ref']]);

        $ncbaTill = $this->one('KES 85870.00 Mpesa Payment to ETIHARDWARE-850312 from NCBA Bank M-pesa - - 254700000000 was successful on 08/10/25 01:10 PM. REF TJ8SG29W8P.');
        $this->assertSame(['bank_to_till', 'ETIHARDWARE', '850312', '2025-10-08 13:10'], [$ncbaTill['kind'], $ncbaTill['payee'], $ncbaTill['till'], $ncbaTill['at']]);

        $this->assertSame('unknown', $this->one('Hi, the timber is ready for transporting to the site.')['kind']);
        $this->assertSame('info', $this->one('Ksh500.00 has been used from your Fuliza M-PESA limit. Access fee charged Ksh5.00.')['kind']);
    }

    public function test_pasted_text_is_split_into_messages_and_skipped_text_is_kept(): void
    {
        $rows = app(MessageParser::class)->parse("Good morning, please send the funds for the cement.\n\n"
            .'UB6IS5SZ1Y Confirmed. Ksh9,120.00 sent to JOHN KAMAU 0712345678 on 6/2/26 at 4:01 PM. UJUK802EWF Confirmed. Ksh6,000.00 paid to OILMAK RETAIL LTD. on 30/10/26 at 8:08 AM.');

        $this->assertSame(['unknown', 'mpesa_send', 'mpesa_till'], array_column($rows, 'kind'));
        $this->assertSame('Good morning, please send the funds for the cement.', $rows[0]['raw']);
    }

    public function test_a_reversal_names_the_code_it_reverses(): void
    {
        $row = $this->one('UC12345678 Confirmed. Transaction UB6IS5SZ1Y has been reversed. Your M-PESA balance is Ksh10,788.14.');
        $this->assertSame(['reversal', 'UB6IS5SZ1Y', 'UC12345678'], [$row['kind'], $row['reverses'], $row['mpesa_ref']]);
    }

    public function test_a_transfer_slip_line_is_read_with_masked_numbers(): void
    {
        $mpesa = $this->one('Transfer slip (M-Pesa) ref TCK9G0RX0D: KES 4,000.00 to PETER OTIENO MWANGI, phone 254722***452, on 20/03/2025 at 17:46.');
        $this->assertSame(['transfer_slip', 'mpesa', 4000.0, 'TCK9G0RX0D', '254722***452', '2025-03-20 17:46'],
            [$mpesa['kind'], $mpesa['channel'], $mpesa['amount'], $mpesa['mpesa_ref'], $mpesa['phone'], $mpesa['at']]);

        $swift = $this->one('Transfer slip (SWIFT) ref FTC260618ZBAV: KES 210,965.00 to TILE CARPET CENTRE LTD, account 0705011133, bank ABSA, on 18/06/2026 at 09:20. For: SANITARY WARE AND FITTINGS.');
        $this->assertSame(['bank', 'TILE CARPET CENTRE LTD', '0705011133', 'ABSA', 'FTC260618ZBAV', 'SANITARY WARE AND FITTINGS'],
            [$swift['channel'], $swift['payee'], $swift['bank_account'], $swift['bank'], $swift['bank_ref'], $swift['purpose']]);
    }

    public function test_dates_are_day_first_and_impossible_ones_are_dropped(): void
    {
        $this->assertSame('2026-02-06', $this->one('Your account 648****019 has been debited with KES 1,000.00 on 06/02/2026. Ref: FTC260206LZEV.')['at']);
        $this->assertNull($this->one('Your account 648****019 has been debited with KES 1,000.00 on 31/02/2026. Ref: FTC260206LZEV.')['at']);
    }
}
