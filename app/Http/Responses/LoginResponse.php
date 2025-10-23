<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $user = $request->user();

        // Redirect based on user role
        if ($user->role === 'admin') {
            return $request->wantsJson()
                ? new JsonResponse('', 204)
                : redirect()->intended('/admin/dashboard');
        }

        // Default redirect for agents or other roles
        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended('/dashboard');
    }
}
