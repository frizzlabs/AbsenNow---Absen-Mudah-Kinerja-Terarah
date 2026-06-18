<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Leave;
use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class LeaveController extends Controller
{
    public function balances(Request $request)
    {
        $user = $request->user();
        $balances = LeaveBalance::where('user_id', $user->id)->get();
        return response()->json($balances);
    }

    public function requests(Request $request)
    {
        $user = $request->user();
        $requests = Leave::with('delegateUser')
            ->where('user_id', $user->id)
            ->orderBy('start_date', 'desc')
            ->get();
            
        return response()->json($requests);
    }

    public function delegates(Request $request)
    {
        $user = $request->user();
        // Return other users as delegate options
        $users = User::where('id', '!=', $user->id)->get(['id', 'name']);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'leave_type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'delegate_user_id' => 'nullable|exists:users,id',
            'reason' => 'nullable|string',
            'attachment' => 'nullable|string', // Base64 representation of attachment
            'attachment_name' => 'nullable|string',
        ]);

        $user = $request->user();
        $start = Carbon::parse($request->start_date);
        $end = Carbon::parse($request->end_date);
        
        // Calculate total days including start/end
        $totalDays = $start->diffInDays($end) + 1;

        // Check sisa kuota for annual and sick leave
        if (in_array($request->leave_type, ['annual', 'sick'])) {
            $balance = LeaveBalance::where('user_id', $user->id)
                ->where('leave_type', $request->leave_type)
                ->first();

            if ($balance) {
                $remaining = $balance->allocated - $balance->used;
                if ($remaining < $totalDays) {
                    return response()->json([
                        'message' => 'Gagal mengajukan cuti. Sisa kuota cuti (' . $remaining . ' hari) tidak mencukupi untuk pengajuan ' . $totalDays . ' hari.'
                    ], 422);
                }
            } else {
                return response()->json([
                    'message' => 'Gagal mengajukan cuti. Anda tidak memiliki alokasi kuota untuk tipe cuti ini.'
                ], 422);
            }
        }

        // Process attachment
        $attachmentPath = null;
        if ($request->attachment) {
            $attachmentPath = $this->saveBase64File($request->attachment, $request->attachment_name ?? 'attachment');
        }

        $leave = Leave::create([
            'user_id' => $user->id,
            'leave_type' => $request->leave_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'delegate_user_id' => $request->delegate_user_id,
            'reason' => $request->reason,
            'attachment' => $attachmentPath,
            'status' => 'pending',
            'total_days' => $totalDays,
        ]);

        return response()->json([
            'message' => 'Pengajuan cuti berhasil dikirim.',
            'leave' => $leave->load('delegateUser')
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
            $fileName = 'leave_' . uniqid() . '.' . $ext;
            $directory = 'leaves';

            Storage::disk('public')->makeDirectory($directory);
            Storage::disk('public')->put($directory . '/' . $fileName, $data);

            return 'storage/leaves/' . $fileName;
        }

        return null;
    }
}
