<?php

namespace Okjt\Kit\Privacy;

use Okjt\Kit\Content\ContactMessage;

/** The kit's own personal data: contact form messages sent from the person's email. */
class ContactMessageEraser implements Eraser
{
    public function erase(ErasureRequest $request): ?string
    {
        if (! $request->email) {
            return null;
        }
        $deleted = ContactMessage::query()->where('email', $request->email)->delete();

        return $deleted ? $deleted.' contact '.($deleted === 1 ? 'message' : 'messages').' deleted' : null;
    }
}
