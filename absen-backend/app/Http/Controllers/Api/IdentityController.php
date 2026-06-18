<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserIdentity;
use Illuminate\Http\Request;

class IdentityController extends Controller
{
    public function show(Request $request)
    {
        $identity = UserIdentity::where('user_id', $request->user()->id)->first();

        if (!$identity) {
            return response()->json(null);
        }

        return response()->json([
            'id'               => $identity->id,
            'id_type'          => $identity->id_type,
            'id_number'        => $identity->id_number,
            'id_name'          => $identity->id_name,
            'id_expiry'        => $identity->id_expiry?->format('Y-m-d'),
            'photo_front_url'  => $identity->photo_front_url,
            'photo_back_url'   => $identity->photo_back_url,
            'status'           => $identity->status,
            'admin_note'       => $identity->admin_note,
            'created_at'       => $identity->created_at,
            'updated_at'       => $identity->updated_at,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_type'     => 'required|in:ktp,passport',
            'id_number'   => 'required|string|max:50',
            'id_name'     => 'required|string|max:255',
            'id_expiry'   => 'nullable|date',
            'photo_front' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:8192',
            'photo_back'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:8192',
        ]);

        $user = $request->user();
        $identity = UserIdentity::where('user_id', $user->id)->first();

        $data = [
            'user_id'   => $user->id,
            'id_type'   => $request->id_type,
            'id_number' => $request->id_number,
            'id_name'   => $request->id_name,
            'id_expiry' => $request->id_expiry ?: null,
            'status'    => 'pending',
        ];

        // Upload foto depan
        if ($request->hasFile('photo_front')) {
            if ($identity?->photo_front_path) {
                \Storage::disk('public')->delete($identity->photo_front_path);
            }
            $data['photo_front_path'] = $request->file('photo_front')->store('identities', 'public');
        }

        // Upload foto belakang
        if ($request->hasFile('photo_back')) {
            if ($identity?->photo_back_path) {
                \Storage::disk('public')->delete($identity->photo_back_path);
            }
            $data['photo_back_path'] = $request->file('photo_back')->store('identities', 'public');
        }

        $identity = UserIdentity::updateOrCreate(['user_id' => $user->id], $data);

        return response()->json([
            'message'  => 'Identitas berhasil dikirim dan sedang ditinjau.',
            'identity' => [
                'id'              => $identity->id,
                'id_type'         => $identity->id_type,
                'id_number'       => $identity->id_number,
                'id_name'         => $identity->id_name,
                'id_expiry'       => $identity->id_expiry?->format('Y-m-d'),
                'photo_front_url' => $identity->photo_front_url,
                'photo_back_url'  => $identity->photo_back_url,
                'status'          => $identity->status,
                'updated_at'      => $identity->updated_at,
            ],
        ]);
    }
}
