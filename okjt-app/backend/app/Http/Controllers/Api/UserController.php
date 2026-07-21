<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\HandlesStandardCrud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use HandlesStandardCrud;

    protected $cacheKey = 'all_users';

    protected function storeRules(Request $request): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'is_admin' => 'boolean',
        ];
    }

    protected function updateRules(Request $request, $record): array
    {
        return [
            'name' => 'string|max:255',
            'email' => [
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($record->id),
            ],
            'password' => 'nullable|string|min:8',
            'is_admin' => 'boolean',
        ];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $validated['password'] = Hash::make($validated['password']);
        return $validated;
    }

    protected function beforeUpdate($record, array $validated, Request $request): array
    {
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }
        return $validated;
    }
}
