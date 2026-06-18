<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Permission;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $permissions = Permission::with('user')
            ->where('user_id', $user->id)
            ->orderBy('permission_date', 'desc')
            ->get();

        return response()->json($permissions);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $permission = Permission::with('user')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$permission) {
            return response()->json(['message' => 'Permohonan izin tidak ditemukan.'], 404);
        }

        return response()->json($permission);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'permission_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|string', // base64 string
            'attachment_name' => 'nullable|string',
        ]);

        $user = $request->user();
        
        $start = Carbon::parse($request->start_time);
        $end = Carbon::parse($request->end_time);

        if ($end->lessThanOrEqualTo($start)) {
            return response()->json([
                'message' => 'Jam selesai harus setelah jam mulai.'
            ], 422);
        }

        // Calculate duration in hours
        $durationHours = round($start->diffInMinutes($end) / 60, 2);

        // Process attachment
        $attachmentPath = null;
        if ($request->attachment) {
            $attachmentPath = $this->saveBase64File($request->attachment, $request->attachment_name ?? 'permission');
        }

        $permission = Permission::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'category' => $request->category,
            'permission_date' => $request->permission_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_hours' => $durationHours,
            'notes' => $request->notes,
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Permohonan izin berhasil dikirim.',
            'permission' => $permission->load('user')
        ]);
    }

    private function saveBase64File($base64String, $originalName)
    {
        if (!$base64String) {
            return null;
        }

        // Extract format data:image/png;base64,... or data:application/pdf;base64,...
        if (preg_match('/^data:([^;]+);base64,/', $base64String, $match)) {
            $mimeType = $match[1];
            $data = substr($base64String, strpos($base64String, ',') + 1);
            $data = base64_decode($data);
            
            if ($data === false) {
                return null;
            }

            // Map MIME to extension
            $extMap = [
                'image/jpeg' => 'jpg',
                'image/jpg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'application/pdf' => 'pdf',
                'application/msword' => 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            ];
            
            $ext = $extMap[$mimeType] ?? 'bin';
            $fileName = 'permission_' . uniqid() . '.' . $ext;
            $directory = 'permissions';

            Storage::disk('public')->makeDirectory($directory);
            Storage::disk('public')->put($directory . '/' . $fileName, $data);

            return 'storage/permissions/' . $fileName;
        }

        return null;
    }
}
