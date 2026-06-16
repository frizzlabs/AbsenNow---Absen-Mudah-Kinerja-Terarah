<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user || !Hash::check($validatedData['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        // Generate 6-digit OTP
        $otp = (string) mt_rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        // Write OTP to logs
        Log::info("OTP MOCK untuk user {$user->email}: {$otp}");

        return response()->json([
            'message' => 'OTP sent successfully',
            'email' => $user->email,
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user || $user->otp !== $validatedData['otp'] || now()->isAfter($user->otp_expires_at)) {
            return response()->json([
                'message' => 'Invalid or expired OTP code.'
            ], 400);
        }

        // Clear OTP
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        // Issue token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'OTP verified successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function savePin(Request $request)
    {
        $validatedData = $request->validate([
            'pin' => 'required|string|size:4',
        ]);

        $user = $request->user();
        $user->device_pin = Hash::make($validatedData['pin']);
        $user->save();

        return response()->json([
            'message' => 'Device PIN saved successfully.'
        ]);
    }

    public function verifyPin(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'pin' => 'required|string|size:4',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user || !$user->device_pin || !Hash::check($validatedData['pin'], $user->device_pin)) {
            return response()->json([
                'message' => 'Invalid PIN code.'
            ], 401);
        }

        // Issue token upon successful PIN validation (like a password-less login)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'PIN verified successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
