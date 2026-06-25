<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

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
            'user' => $user->load('organization'),
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

        // Jika sudah punya device PIN, skip OTP — langsung ke PIN verify
        if (!empty($user->device_pin)) {
            return response()->json([
                'message' => 'Login successful',
                'email'   => $user->email,
                'has_pin' => true,
            ]);
        }

        // Bypassing OTP for demo/seeded accounts
        $isDemoUser = str_ends_with($user->email, '@demo.absennow.id') || $user->email === 'vendor@absennow.id';

        if ($isDemoUser) {
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'message' => 'Login successful (Demo Mode)',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user->load('organization'),
            ]);
        }

        // Generate 6-digit OTP
        $otp = (string) mt_rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->otp_attempts = 0;
        $user->save();

        // Send OTP via Resend
        $sent = $this->sendOtpEmail($user->email, $user->name, $otp);

        if (!$sent) {
            Log::error("Gagal kirim OTP via Resend ke {$user->email}");
            if (config('app.env') === 'local') {
                $user->otp = '123456';
                $user->save();
                return response()->json([
                    'message' => 'OTP sent successfully (Bypass Mode)',
                    'email'   => $user->email,
                    'has_pin' => false,
                ]);
            }
            return response()->json([
                'message' => 'Gagal mengirim OTP. Coba lagi.'
            ], 500);
        }

        return response()->json([
            'message' => 'OTP sent successfully',
            'email'   => $user->email,
            'has_pin' => false,
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user || !$user->otp || now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP tidak valid atau sudah kadaluarsa.'], 400);
        }

        if ($user->otp_attempts >= 5) {
            $user->otp = null;
            $user->otp_expires_at = null;
            $user->otp_attempts = 0;
            $user->save();
            return response()->json(['message' => 'Terlalu banyak percobaan. Silakan login ulang untuk mendapatkan OTP baru.'], 429);
        }

        // For local development, allow '123456' as bypass code
        if ($user->otp !== $validatedData['otp'] && !(config('app.env') === 'local' && $validatedData['otp'] === '123456')) {
            $user->increment('otp_attempts');
            $remaining = 5 - $user->otp_attempts;
            return response()->json(['message' => "Kode OTP salah. Sisa percobaan: {$remaining}."], 400);
        }

        // Clear OTP
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->otp_attempts = 0;
        $user->save();

        // Issue token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'OTP verified successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('organization'),
        ]);
    }

    public function resendOtp(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user) {
            return response()->json([
                'message' => 'Akun tidak ditemukan'
            ], 404);
        }

        // Bypassing OTP for demo/seeded accounts
        $isDemoUser = str_ends_with($user->email, '@demo.absennow.id') || $user->email === 'vendor@absennow.id';

        if ($isDemoUser) {
            $user->otp = '123456';
            $user->save();
            return response()->json([
                'message' => 'OTP resent successfully (Demo Mode)',
                'email'   => $user->email,
            ]);
        }

        // Generate 6-digit OTP
        $otp = (string) mt_rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->otp_attempts = 0;
        $user->save();

        // Send OTP via Resend
        $sent = $this->sendOtpEmail($user->email, $user->name, $otp);

        if (!$sent) {
            Log::error("Gagal kirim OTP via Resend ke {$user->email}");
            if (config('app.env') === 'local') {
                $user->otp = '123456';
                $user->save();
                return response()->json([
                    'message' => 'OTP resent successfully (Bypass Mode)',
                    'email'   => $user->email,
                ]);
            }
            return response()->json([
                'message' => 'Gagal mengirim OTP. Coba lagi.'
            ], 500);
        }

        return response()->json([
            'message' => 'OTP resent successfully',
            'email'   => $user->email,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Jika email terdaftar, kode reset akan dikirim.']);
        }

        $otp = (string) mt_rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->otp_attempts = 0;
        $user->save();

        $isDemoUser = str_ends_with($user->email, '@demo.absennow.id') || $user->email === 'vendor@absennow.id';

        if ($isDemoUser) {
            $user->otp = '123456';
            $user->save();
            return response()->json(['message' => 'Kode reset dikirim (Demo Mode).', 'email' => $user->email]);
        }

        $this->sendPasswordResetEmail($user->email, $user->name, $otp);

        return response()->json(['message' => 'Kode reset dikirim.', 'email' => $user->email]);
    }

    public function verifyPasswordResetOtp(Request $request)
    {
        $request->validate(['email' => 'required|email', 'otp' => 'required|string|size:6']);
        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->otp || now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP tidak valid atau kadaluarsa.'], 400);
        }

        if ($user->otp_attempts >= 5) {
            $user->otp = null;
            $user->otp_expires_at = null;
            $user->otp_attempts = 0;
            $user->save();
            return response()->json(['message' => 'Terlalu banyak percobaan. Minta kode baru.'], 429);
        }

        if ($user->otp !== $request->otp) {
            $user->increment('otp_attempts');
            $remaining = 5 - $user->otp_attempts;
            return response()->json(['message' => "Kode salah. Sisa percobaan: {$remaining}."], 400);
        }

        $token = \Illuminate\Support\Str::random(64);
        $user->password_reset_token = $token;
        $user->password_reset_expires_at = now()->addMinutes(15);
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->otp_attempts = 0;
        $user->save();

        return response()->json(['message' => 'OTP terverifikasi.', 'reset_token' => $token]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'reset_token'           => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $user = User::where('password_reset_token', $request->reset_token)
            ->where('password_reset_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Token tidak valid atau kadaluarsa.'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->password_reset_token = null;
        $user->password_reset_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Password berhasil direset. Silakan login.']);
    }

    private function sendPasswordResetEmail(string $email, string $name, string $otp): void
    {
        $html = "
        <div style='font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;'>
            <div style='text-align: center; margin-bottom: 24px;'>
                <h2 style='color: #1B59F8; margin: 0;'>AbsenNow</h2>
                <p style='color: #6c757d; margin: 4px 0 0;'>Reset Password</p>
            </div>
            <div style='background: #ffffff; border-radius: 8px; padding: 24px; text-align: center;'>
                <p style='color: #343a40; margin: 0 0 8px;'>Hai, <strong>{$name}</strong>!</p>
                <p style='color: #495057; margin: 0 0 24px;'>Gunakan kode berikut untuk reset password AbsenNow kamu:</p>
                <div style='background: #fff3f0; border: 2px dashed #ef4444; border-radius: 8px; padding: 20px 10px; margin: 0 0 24px; text-align: center;'>
                    <span style='font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ef4444; white-space: nowrap; display: inline-block; padding-left: 8px;'>{$otp}</span>
                </div>
                <p style='color: #868e96; font-size: 13px; margin: 0;'>Kode berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
            </div>
            <p style='text-align: center; color: #adb5bd; font-size: 12px; margin: 16px 0 0;'>Jika kamu tidak meminta reset password, abaikan email ini.</p>
        </div>";

        Http::withToken(config('services.resend.key'))
            ->post('https://api.resend.com/emails', [
                'from'    => config('mail.from.name') . ' <' . config('mail.from.address') . '>',
                'to'      => [$email],
                'subject' => 'Reset Password AbsenNow',
                'html'    => $html,
            ]);
    }

    private function sendOtpEmail(string $email, string $name, string $otp): bool
    {
        $html = "
        <div style='font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;'>
            <div style='text-align: center; margin-bottom: 24px;'>
                <h2 style='color: #1B59F8; margin: 0;'>AbsenNow</h2>
                <p style='color: #6c757d; margin: 4px 0 0;'>Absen Mudah, Kinerja Terarah</p>
            </div>
            <div style='background: #ffffff; border-radius: 8px; padding: 24px; text-align: center;'>
                <p style='color: #343a40; margin: 0 0 8px;'>Hai, <strong>{$name}</strong>!</p>
                <p style='color: #495057; margin: 0 0 24px;'>Gunakan kode OTP berikut untuk masuk ke AbsenNow:</p>
                <div style='background: #f0f4ff; border: 2px dashed #1B59F8; border-radius: 8px; padding: 20px 10px; margin: 0 0 24px; text-align: center;'>
                    <span style='font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1B59F8; white-space: nowrap; display: inline-block; padding-left: 8px;'>{$otp}</span>
                </div>
                <p style='color: #868e96; font-size: 13px; margin: 0;'>Kode berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
            </div>
            <p style='text-align: center; color: #adb5bd; font-size: 12px; margin: 16px 0 0;'>Jika kamu tidak mencoba masuk, abaikan email ini.</p>
        </div>";

        $response = Http::withToken(config('services.resend.key'))
            ->post('https://api.resend.com/emails', [
                'from'    => config('mail.from.name') . ' <' . config('mail.from.address') . '>',
                'to'      => [$email],
                'subject' => 'Kode OTP AbsenNow: ' . $otp,
                'html'    => $html,
            ]);

        return $response->successful();
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
            'user' => $user->load('organization'),
        ]);
    }

    public function forgotPin(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Akun tidak ditemukan.'], 404);
        }

        $otp = (string) mt_rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->otp_attempts = 0;
        $user->save();

        $isDemoUser = str_ends_with($user->email, '@demo.absennow.id') || $user->email === 'vendor@absennow.id';

        if ($isDemoUser) {
            $user->otp = '123456';
            $user->save();
            return response()->json(['message' => 'OTP sent successfully (Demo Mode)', 'email' => $user->email]);
        }

        $sent = $this->sendForgotPinOtpEmail($user->email, $user->name, $otp);

        if (!$sent) {
            Log::error("Gagal kirim OTP Lupa PIN via Resend ke {$user->email}");
            if (config('app.env') === 'local') {
                $user->otp = '123456';
                $user->save();
                return response()->json([
                    'message' => 'OTP sent successfully (Bypass Mode)',
                    'email'   => $user->email,
                ]);
            }
            return response()->json([
                'message' => 'Gagal mengirim OTP. Coba lagi.'
            ], 500);
        }

        return response()->json(['message' => 'OTP sent successfully', 'email' => $user->email]);
    }

    private function sendForgotPinOtpEmail(string $email, string $name, string $otp): bool
    {
        $html = "
        <div style='font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;'>
            <div style='text-align: center; margin-bottom: 24px;'>
                <h2 style='color: #1B59F8; margin: 0;'>AbsenNow</h2>
                <p style='color: #6c757d; margin: 4px 0 0;'>Reset PIN Perangkat</p>
            </div>
            <div style='background: #ffffff; border-radius: 8px; padding: 24px; text-align: center;'>
                <p style='color: #343a40; margin: 0 0 8px;'>Hai, <strong>{$name}</strong>!</p>
                <p style='color: #495057; margin: 0 0 24px;'>Gunakan kode OTP berikut untuk menyetel ulang PIN AbsenNow Anda:</p>
                <div style='background: #f0f4ff; border: 2px dashed #1B59F8; border-radius: 8px; padding: 20px 10px; margin: 0 0 24px; text-align: center;'>
                    <span style='font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1B59F8; white-space: nowrap; display: inline-block; padding-left: 8px;'>{$otp}</span>
                </div>
                <p style='color: #868e96; font-size: 13px; margin: 0;'>Kode berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
            </div>
            <p style='text-align: center; color: #adb5bd; font-size: 12px; margin: 16px 0 0;'>Jika Anda tidak meminta reset PIN, abaikan email ini.</p>
        </div>";

        $response = Http::withToken(config('services.resend.key'))
            ->post('https://api.resend.com/emails', [
                'from'    => config('mail.from.name') . ' <' . config('mail.from.address') . '>',
                'to'      => [$email],
                'subject' => 'Reset PIN AbsenNow',
                'html'    => $html,
            ]);

        return $response->successful();
    }

    public function verifyForgotPinOtp(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user || !$user->otp || now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP tidak valid atau sudah kadaluarsa.'], 400);
        }

        if ($user->otp_attempts >= 5) {
            $user->otp = null;
            $user->otp_expires_at = null;
            $user->otp_attempts = 0;
            $user->save();
            return response()->json(['message' => 'Terlalu banyak percobaan. Silakan minta OTP baru.'], 429);
        }

        if ($user->otp !== $validatedData['otp'] && !(config('app.env') === 'local' && $validatedData['otp'] === '123456')) {
            $user->increment('otp_attempts');
            $remaining = 5 - $user->otp_attempts;
            return response()->json(['message' => "Kode OTP salah. Sisa percobaan: {$remaining}."], 400);
        }

        // Clear OTP and reset device PIN
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->otp_attempts = 0;
        $user->device_pin = null; // Clear PIN so frontend prompts for setup
        $user->save();

        // Issue token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'OTP verified successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('organization'),
        ]);
    }
}
