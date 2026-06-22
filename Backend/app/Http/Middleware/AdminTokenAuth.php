<?php

namespace App\Http\Middleware;

use App\Models\AdminToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = (string) $request->bearerToken();

        if ($header === '') {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $token = AdminToken::query()
            ->where('token_hash', hash('sha256', $header))
            ->first();

        if (! $token) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $request->attributes->set('admin_token', $token);
        $request->setUserResolver(fn () => $token->user);

        return $next($request);
    }
}