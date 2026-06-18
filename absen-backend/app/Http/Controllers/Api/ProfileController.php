<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update bagian profil yang boleh diedit user.
     * Field basic (name, date_of_birth, gender, employee_id, dll) bersifat read-only.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $user = $request->user();

        // Hapus avatar lama jika ada
        if ($user->avatar_url) {
            $oldPath = str_replace(asset('storage/'), '', $user->avatar_url);
            if (\Storage::disk('public')->exists($oldPath)) {
                \Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_url' => asset('storage/' . $path)]);

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui.',
            'avatar_url' => $user->avatar_url,
            'user' => $user->fresh(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'phone' => 'nullable|string|max:50',
            'personal_email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:50',
        ]);

        $user = $request->user();
        $user->update($request->only([
            'phone',
            'personal_email',
            'address',
            'emergency_contact_name',
            'emergency_contact_relationship',
            'emergency_contact_phone',
        ]));

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user->fresh(),
        ]);
    }
}
