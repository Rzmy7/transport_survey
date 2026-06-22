<?php

namespace App\Http\Controllers;

use App\Models\AdminToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 422);
        }

        $plainToken = Str::random(64);

        AdminToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $plainToken),
        ]);

        return response()->json([
            'token' => $plainToken,
            'admin' => [
                'email' => $user->email,
                'name' => $user->name,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->attributes->get('admin_token');

        if ($token instanceof AdminToken) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}