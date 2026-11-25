<?php

namespace Okjt\Kit\Payments\Mpesa;

/**
 * Where a prompt's money goes: a paybill, or a till (Buy Goods, where
 * `number` is the store number and `till` the till that receives it).
 */
final class Shortcode
{
    public function __construct(
        public readonly string $number,
        public readonly string $passkey,
        public readonly string $type = 'paybill',
        public readonly ?string $till = null,
    ) {}

    public function isTill(): bool
    {
        return $this->type === 'till';
    }

    /** Who receives the money (Daraja's PartyB). */
    public function receiver(): string
    {
        return $this->isTill() && $this->till ? $this->till : $this->number;
    }
}
