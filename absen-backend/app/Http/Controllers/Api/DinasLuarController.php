<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DinasLuar;
use App\Models\DinasLuarAttendance;
use Illuminate\Http\Request;

class DinasLuarController extends Controller
{
    // Pegawai: daftar dinas milik sendiri
    public function index(Request $request)
    {
        $items = DinasLuar::where('user_id', $request->user()->id)
            ->with('reviewer:id,name')
            ->orderByDesc('start_datetime')
            ->get()
            ->map(fn($d) => $this->format($d));

        return response()->json($items);
    }

    // Pegawai: ajukan dinas baru
    public function store(Request $request)
    {
        $request->validate([
            'location_name' => 'required|string|max:255',
            'latitude'      => 'required|numeric|between:-90,90',
            'longitude'     => 'required|numeric|between:-180,180',
            'radius'        => 'nullable|integer|min:50|max:50000',
            'start_datetime'=> 'required|date|after_or_equal:today',
            'end_datetime'  => 'required|date|after:start_datetime',
            'work_details'  => 'required|string|min:10|max:2000',
        ]);

        $dinas = DinasLuar::create([
            'user_id'       => $request->user()->id,
            'location_name' => $request->location_name,
            'latitude'      => $request->latitude,
            'longitude'     => $request->longitude,
            'radius'        => $request->radius ?? 500,
            'start_datetime'=> $request->start_datetime,
            'end_datetime'  => $request->end_datetime,
            'work_details'  => $request->work_details,
            'status'        => 'pending',
        ]);

        return response()->json([
            'message' => 'Pengajuan dinas luar berhasil dikirim.',
            'dinas'   => $this->format($dinas),
        ], 201);
    }

    // Pegawai: dinas yang sudah approved & masih aktif (untuk absen)
    public function approvedActive(Request $request)
    {
        $now = now();
        $items = DinasLuar::where('user_id', $request->user()->id)
            ->where('status', 'approved')
            ->where('start_datetime', '<=', $now)
            ->where('end_datetime', '>=', $now)
            ->orderBy('start_datetime')
            ->get()
            ->map(fn($d) => $this->format($d));

        return response()->json($items);
    }

    // Pegawai: absen dinas — check-in ke dinas yang disetujui
    public function absen(Request $request, $id)
    {
        $request->validate([
            'latitude'    => 'required|numeric|between:-90,90',
            'longitude'   => 'required|numeric|between:-180,180',
            'work_report' => 'required|string|min:10|max:2000',
            'evidence'    => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $user  = $request->user();
        $dinas = DinasLuar::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->firstOrFail();

        // Geofence: Haversine distance
        $geofenceValid = $this->haversine(
            $request->latitude, $request->longitude,
            $dinas->latitude,   $dinas->longitude
        ) <= $dinas->radius;

        $evidencePath = null;
        if ($request->hasFile('evidence')) {
            $evidencePath = $request->file('evidence')->store('dinas-luar/evidence', 'public');
        }

        $attendance = DinasLuarAttendance::create([
            'dinas_luar_id' => $dinas->id,
            'user_id'       => $user->id,
            'latitude'      => $request->latitude,
            'longitude'     => $request->longitude,
            'geofence_valid'=> $geofenceValid,
            'work_report'   => $request->work_report,
            'evidence_path' => $evidencePath,
        ]);

        return response()->json([
            'message'        => 'Absen dinas berhasil dicatat.',
            'geofence_valid' => $geofenceValid,
            'attendance'     => $attendance,
        ], 201);
    }

    // Atasan: rekap absen dinas dari semua staff
    public function absenRecords(Request $request)
    {
        if (!$request->user()->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $records = DinasLuarAttendance::with([
            'user:id,name,employee_id,department',
            'dinasLuar:id,location_name,latitude,longitude,radius,start_datetime,end_datetime',
        ])
        ->orderByDesc('created_at')
        ->get()
        ->map(fn($a) => [
            'id'             => $a->id,
            'user'           => $a->user ? [
                'id'          => $a->user->id,
                'name'        => $a->user->name,
                'employee_id' => $a->user->employee_id,
                'department'  => $a->user->department,
            ] : null,
            'dinas'          => $a->dinasLuar ? [
                'id'            => $a->dinasLuar->id,
                'location_name' => $a->dinasLuar->location_name,
                'start_datetime'=> $a->dinasLuar->start_datetime?->toIso8601String(),
                'end_datetime'  => $a->dinasLuar->end_datetime?->toIso8601String(),
            ] : null,
            'latitude'       => $a->latitude,
            'longitude'      => $a->longitude,
            'geofence_valid' => $a->geofence_valid,
            'work_report'    => $a->work_report,
            'evidence_url'   => $a->evidence_path ? asset('storage/' . $a->evidence_path) : null,
            'checked_in_at'  => $a->created_at?->toIso8601String(),
        ]);

        return response()->json($records);
    }

    // Atasan: pending dinas untuk review
    public function pendingReview(Request $request)
    {
        if (!$request->user()->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $items = DinasLuar::with('user:id,name,employee_id,department')
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($d) => $this->format($d));

        return response()->json($items);
    }

    // Atasan: review approve/reject
    public function review(Request $request, $id)
    {
        if (!$request->user()->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'status'      => 'required|in:approved,rejected',
            'review_note' => 'nullable|string|max:500',
        ]);

        $dinas = DinasLuar::where('status', 'pending')->findOrFail($id);
        $dinas->update([
            'status'      => $request->status,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_note' => $request->review_note,
        ]);

        return response()->json([
            'message' => $request->status === 'approved' ? 'Dinas disetujui.' : 'Dinas ditolak.',
            'dinas'   => $this->format($dinas->fresh('reviewer')),
        ]);
    }

    // Atasan: history yang sudah direview
    public function myReviews(Request $request)
    {
        if (!$request->user()->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $items = DinasLuar::with('user:id,name')
            ->where('reviewed_by', $request->user()->id)
            ->whereIn('status', ['approved', 'rejected'])
            ->orderByDesc('reviewed_at')
            ->get()
            ->map(fn($d) => $this->format($d));

        return response()->json($items);
    }

    // Haversine formula — returns distance in meters
    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R = 6371000;
        $φ1 = deg2rad($lat1); $φ2 = deg2rad($lat2);
        $Δφ = deg2rad($lat2 - $lat1);
        $Δλ = deg2rad($lon2 - $lon1);
        $a  = sin($Δφ/2)**2 + cos($φ1)*cos($φ2)*sin($Δλ/2)**2;
        return $R * 2 * atan2(sqrt($a), sqrt(1-$a));
    }

    private function format(DinasLuar $d): array
    {
        return [
            'id'             => $d->id,
            'location_name'  => $d->location_name,
            'latitude'       => $d->latitude,
            'longitude'      => $d->longitude,
            'radius'         => $d->radius,
            'start_datetime' => $d->start_datetime?->toIso8601String(),
            'end_datetime'   => $d->end_datetime?->toIso8601String(),
            'work_details'   => $d->work_details,
            'status'         => $d->status,
            'review_note'    => $d->review_note,
            'reviewed_at'    => $d->reviewed_at?->toIso8601String(),
            'reviewer'       => $d->reviewer ? ['id' => $d->reviewer->id, 'name' => $d->reviewer->name] : null,
            'user'           => $d->relationLoaded('user') ? ['id' => $d->user->id, 'name' => $d->user->name] : null,
            'created_at'     => $d->created_at?->toIso8601String(),
        ];
    }
}
