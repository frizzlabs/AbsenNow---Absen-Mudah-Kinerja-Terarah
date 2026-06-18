<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Overtime;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class OvertimeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Overtime::with('user')
            ->where('user_id', $user->id)
            ->orderBy('overtime_date', 'desc');

        // Optional status filter: pending | approved | rejected
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $overtime = Overtime::with('user')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$overtime) {
            return response()->json(['message' => 'Pengajuan lembur tidak ditemukan.'], 404);
        }

        return response()->json($overtime);
    }

    public function summary(Request $request)
    {
        $user = $request->user();

        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        $thisMonth = Overtime::where('user_id', $user->id)
            ->where('status', 'approved')
            ->whereBetween('overtime_date', [$startOfMonth, $endOfMonth])
            ->sum('duration_hours');

        $lastMonth = Overtime::where('user_id', $user->id)
            ->where('status', 'approved')
            ->whereBetween('overtime_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('duration_hours');

        $trendPercent = $lastMonth > 0
            ? round((($thisMonth - $lastMonth) / $lastMonth) * 100)
            : null;

        return response()->json([
            'period' => Carbon::now()->format('M Y'),
            'total_approved_hours' => (float) $thisMonth,
            'last_month_hours' => (float) $lastMonth,
            'trend_percent' => $trendPercent,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'overtime_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'reason' => 'nullable|string',
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
            $attachmentPath = $this->saveBase64File($request->attachment, $request->attachment_name ?? 'overtime');
        }

        $overtime = Overtime::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'overtime_date' => $request->overtime_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_hours' => $durationHours,
            'reason' => $request->reason,
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Pengajuan lembur berhasil dikirim.',
            'overtime' => $overtime->load('user')
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
            $fileName = 'overtime_' . uniqid() . '.' . $ext;
            $directory = 'overtimes';

            Storage::disk('public')->makeDirectory($directory);
            Storage::disk('public')->put($directory . '/' . $fileName, $data);

            return 'storage/overtimes/' . $fileName;
        }

        return null;
    }
}
