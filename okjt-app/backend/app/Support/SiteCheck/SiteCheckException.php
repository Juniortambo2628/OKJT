<?php

namespace App\Support\SiteCheck;

use RuntimeException;

/** A site the check can't or may not fetch; its message is shown to the visitor. */
class SiteCheckException extends RuntimeException {}
