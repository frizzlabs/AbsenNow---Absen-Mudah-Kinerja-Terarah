<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceCorrectionController extends Controller
{
    // Pegawai: list koreksi milik sendiri (paginated + filter status)
    public function index(Request $request)
    {
        $user = $request->user();
        $query = AttendanceCorrection::where('user_id', $user->id)
            ->with('reviewer:id,name')
            ->orderByDesc('correction_date')
            ->orderByDesc('id');

        if (in_array($request->status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $request->status);
        }

        $perPage = (int) $request->input('per_page', 15);
        $paginated = $query->paginate($perPage);
        $paginated->getCollection()->transform(fn($c) => $this->format($c));

        return response()->json($paginated);
    }

    // Pegawai: detail satu koreksi
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $correction = AttendanceCorrection::where('user_id', $user->id)
            ->with('reviewer:id,name')
            ->findOrFail($id);

        return response()->json($this->format($correction));
    }

    // Pegawai: ajukan koreksi baru
    public function store(Request $request)
    {
        $request->validate([
            'correction_date'  => 'required|date',
            'correction_type'  => 'required|in:forgot_checkin,forgot_checkout,gps_error,app_error,dinas_luar,other',
            'proposed_checkin' => 'nullable|date_format:H:i',
            'proposed_checkout'=> 'nullable|date_format:H:i',
            'justification'    => 'required|string|min:10|max:1000',
            'evidence'         => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $user = $request->user();

        // Cek sudah ada pengajuan pada tanggal yang sama & belum resolved
        $duplicate = AttendanceCorrection::where('user_id', $user->id)
            ->where('correction_date', $request->correction_date)
            ->whereIn('status', ['pending'])
            ->first();
        if ($duplicate) {
            return response()->json(['message' => 'Sudah ada pengajuan koreksi yang menunggu persetujuan untuk tanggal tersebut.'], 422);
        }

        // Ambil data absensi asli (jika ada)
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $request->correction_date)
            ->first();

        $originalCheckin  = $attendance?->check_in  ? Carbon::parse($attendance->check_in)->format('H:i')  : null;
        $originalCheckout = $attendance?->check_out ? Carbon::parse($attendance->check_out)->format('H:i') : null;

        // Validasi kronologis: jam masuk harus sebelum jam keluar
        $finalCheckin  = $request->proposed_checkin  ?? $originalCheckin;
        $finalCheckout = $request->proposed_checkout ?? $originalCheckout;

        if ($finalCheckin && $finalCheckout && $finalCheckin >= $finalCheckout) {
            return response()->json([
                'message' => 'Jam masuk yang diusulkan (' . $finalCheckin . ') harus lebih awal dari jam keluar (' . $finalCheckout . ').'
            ], 422);
        }

        // Upload bukti
        $evidencePath = null;
        if ($request->hasFile('evidence')) {
            $evidencePath = $request->file('evidence')->store('corrections/evidence', 'public');
        }

        $correction = AttendanceCorrection::create([
            'user_id'          => $user->id,
            'correction_date'  => $request->correction_date,
            'correction_type'  => $request->correction_type,
            'proposed_checkin' => $request->proposed_checkin,
            'proposed_checkout'=> $request->proposed_checkout,
            'original_checkin' => $originalCheckin,
            'original_checkout'=> $originalCheckout,
            'justification'    => $request->justification,
            'evidence_path'    => $evidencePath,
            'status'           => 'pending',
        ]);

        return response()->json([
            'message'    => 'Pengajuan koreksi absensi berhasil dikirim.',
            'correction' => $this->format($correction),
        ], 201);
    }

    // Atasan/Admin: review (approve / reject)
    public function review(Request $request, $id)
    {
        $reviewer = $request->user();
        if (!$reviewer->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Tidak memiliki izin untuk menyetujui koreksi.'], 403);
        }

        $request->validate([
            'status'      => 'required|in:approved,rejected',
            'review_note' => 'nullable|string|max:500',
        ]);

        $correction = AttendanceCorrection::with('user')->findOrFail($id);

        if ($correction->status !== 'pending') {
            return response()->json(['message' => 'Koreksi ini sudah diproses sebelumnya.'], 422);
        }

        $correction->update([
            'status'      => $request->status,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_note' => $request->review_note,
        ]);

        // Jika disetujui: perbarui / buat record absensi
        if ($request->status === 'approved') {
            $attendance = Attendance::firstOrNew([
                'user_id' => $correction->user_id,
                'date'    => $correction->correction_date->toDateString(),
            ]);
            if ($correction->proposed_checkin) {
                $attendance->check_in = $correction->proposed_checkin;
            }
            if ($correction->proposed_checkout) {
                $attendance->check_out = $correction->proposed_checkout;
            }
            if (!$attendance->office_id) {
                $attendance->office_id = 1; // default office
            }

            // Validasi kronologis sebelum menyimpan: jam masuk harus sebelum jam keluar
            $ciStr = $attendance->check_in ? Carbon::parse($attendance->check_in)->format('H:i') : null;
            $coStr = $attendance->check_out ? Carbon::parse($attendance->check_out)->format('H:i') : null;
            if ($ciStr && $coStr && $ciStr >= $coStr) {
                // Batalkan approval, kembalikan status ke pending
                $correction->update([
                    'status'      => 'pending',
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                    'review_note' => null,
                ]);
                return response()->json([
                    'message' => 'Tidak dapat menyetujui: jam masuk (' . $ciStr . ') harus lebih awal dari jam keluar (' . $coStr . '). Minta pegawai untuk mengajukan koreksi ulang.'
                ], 422);
            }

            $attendance->save();
        }

        return response()->json([
            'message'    => $request->status === 'approved' ? 'Koreksi disetujui dan data absensi diperbarui.' : 'Koreksi ditolak.',
            'correction' => $this->format($correction->fresh('reviewer')),
        ]);
    }

    // Admin BKPSDM: semua koreksi (dengan filter)
    public function adminIndex(Request $request)
    {
        $user = $request->user();
        if (!$user->hasPermission('attendance.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = AttendanceCorrection::with(['user:id,name,employee_id,department', 'reviewer:id,name'])
            ->orderByDesc('created_at');

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $corrections = $query->get()->map(fn($c) => $this->format($c));
        return response()->json($corrections);
    }

    // Atasan: riwayat koreksi yang sudah direview oleh user ini
    public function myReviews(Request $request)
    {
        $reviewer = $request->user();
        if (!$reviewer->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $corrections = AttendanceCorrection::with(['user:id,name,employee_id,department'])
            ->where('reviewed_by', $reviewer->id)
            ->whereIn('status', ['approved', 'rejected'])
            ->orderByDesc('reviewed_at')
            ->get()
            ->map(fn($c) => $this->format($c));

        return response()->json($corrections);
    }

    // Atasan: daftar koreksi untuk di-review (pending)
    public function pendingReview(Request $request)
    {
        $reviewer = $request->user();
        if (!$reviewer->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $corrections = AttendanceCorrection::with(['user:id,name,employee_id,department'])
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($c) => $this->format($c));

        return response()->json($corrections);
    }

    private function format(AttendanceCorrection $c): array
    {
        return [
            'id'               => $c->id,
            'correction_date'  => $c->correction_date?->format('Y-m-d'),
            'correction_type'  => $c->correction_type,
            'type_label'       => $c->type_label,
            'proposed_checkin' => $c->proposed_checkin,
            'proposed_checkout'=> $c->proposed_checkout,
            'original_checkin' => $c->original_checkin,
            'original_checkout'=> $c->original_checkout,
            'justification'    => $c->justification,
            'evidence_url'     => $c->evidence_path ? asset('storage/' . $c->evidence_path) : null,
            'status'           => $c->status,
            'reviewed_at'      => $c->reviewed_at?->toIso8601String(),
            'review_note'      => $c->review_note,
            'reviewer'         => $c->reviewer ? ['id' => $c->reviewer->id, 'name' => $c->reviewer->name] : null,
            'user'             => $c->relationLoaded('user') ? [
                'id'          => $c->user->id,
                'name'        => $c->user->name,
                'employee_id' => $c->user->employee_id ?? null,
                'department'  => $c->user->department ?? null,
            ] : null,
            'created_at'       => $c->created_at?->toIso8601String(),
        ];
    }
}
