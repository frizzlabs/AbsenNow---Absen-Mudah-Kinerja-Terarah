<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Attendance;
use App\Models\Office;
use App\Models\User;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function statusToday(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        // Ambil jadwal kerja dari office
        $office = Office::first();
        $workSchedule = [
            'work_start' => $office ? Carbon::parse($office->work_start)->format('H:i') : '09:00',
            'work_end'   => $office ? Carbon::parse($office->work_end)->format('H:i') : '17:00',
        ];

        if (!$attendance) {
            return response()->json([
                'state' => 'default',
                'work_schedule' => $workSchedule,
            ]);
        }

        if ($attendance->check_in && !$attendance->check_out) {
            return response()->json([
                'state' => 'checked_in',
                'attendance' => $attendance,
                'work_schedule' => $workSchedule,
            ]);
        }

        return response()->json([
            'state' => 'completed',
            'attendance' => $attendance,
            'work_schedule' => $workSchedule,
        ]);
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'office_id' => 'required|exists:offices,id',
            'image' => 'nullable|string',
        ]);

        $user = $request->user();
        $today = Carbon::today()->toDateString();

        // Check if already checked in today
        $existing = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah melakukan check-in hari ini.'
            ], 400);
        }

        $office = Office::findOrFail($request->office_id);

        // Check geofence
        $hasPolygon = !empty($office->polygon_coordinates) && is_array($office->polygon_coordinates) && count($office->polygon_coordinates) >= 3;

        if ($hasPolygon) {
            if (!$this->isPointInPolygon($request->latitude, $request->longitude, $office->polygon_coordinates)) {
                return response()->json([
                    'message' => 'Gagal check-in. Anda berada di luar area batas kantor (Polygon Geofencing).'
                ], 422);
            }
        } else {
            // Calculate distance
            $distance = $this->calculateDistance(
                $request->latitude,
                $request->longitude,
                $office->latitude,
                $office->longitude
            );

            if ($distance > $office->radius_meters) {
                return response()->json([
                    'message' => 'Gagal check-in. Anda berada di luar radius kantor (' . round($distance) . ' meter dari kantor).'
                ], 422);
            }
        }

        // Determine on-time vs late status using the office's work_start
        $checkInTime     = Carbon::now()->toTimeString(); // e.g. "07:32:15"
        $workStart       = $office->work_start ?? '09:00:00';
        $workStartPadded = strlen($workStart) === 5 ? $workStart . ':00' : $workStart;
        $attendanceStatus = ($checkInTime > $workStartPadded) ? 'late' : 'present';

        // Record attendance
        $imagePath = $this->saveBase64Image($request->image, 'in');

        $attendance = Attendance::create([
            'user_id'      => $user->id,
            'office_id'    => $office->id,
            'date'         => $today,
            'check_in'     => $checkInTime,
            'latitude_in'  => $request->latitude,
            'longitude_in' => $request->longitude,
            'image_in'     => $imagePath,
            'status'       => $attendanceStatus,
        ]);

        return response()->json([
            'message'       => 'Check-in berhasil.',
            'attendance'    => $attendance,
            'is_late'       => $attendanceStatus === 'late',
            'work_schedule' => [
                'work_start' => Carbon::parse($office->work_start)->format('H:i'),
                'work_end'   => Carbon::parse($office->work_end)->format('H:i'),
            ],
        ]);
    }

    public function checkOut(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'image' => 'nullable|string',
        ]);

        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return response()->json([
                'message' => 'Gagal check-out. Anda belum melakukan check-in hari ini.'
            ], 400);
        }

        if ($attendance->check_out) {
            return response()->json([
                'message' => 'Anda sudah melakukan check-out hari ini.'
            ], 400);
        }

        $office = Office::findOrFail($attendance->office_id);

        // Check geofence
        $hasPolygon = !empty($office->polygon_coordinates) && is_array($office->polygon_coordinates) && count($office->polygon_coordinates) >= 3;

        if ($hasPolygon) {
            if (!$this->isPointInPolygon($request->latitude, $request->longitude, $office->polygon_coordinates)) {
                return response()->json([
                    'message' => 'Gagal check-out. Anda berada di luar area batas kantor (Polygon Geofencing).'
                ], 422);
            }
        } else {
            // Calculate distance
            $distance = $this->calculateDistance(
                $request->latitude,
                $request->longitude,
                $office->latitude,
                $office->longitude
            );

            if ($distance > $office->radius_meters) {
                return response()->json([
                    'message' => 'Gagal check-out. Anda berada di luar radius kantor (' . round($distance) . ' meter dari kantor).'
                ], 422);
            }
        }

        // Update record
        $imagePath = $this->saveBase64Image($request->image, 'out');

        $attendance->check_out = Carbon::now()->toTimeString();
        $attendance->latitude_out = $request->latitude;
        $attendance->longitude_out = $request->longitude;
        $attendance->image_out = $imagePath;
        $attendance->save();

        return response()->json([
            'message' => 'Check-out berhasil.',
            'attendance' => $attendance
        ]);
    }

    public function offices()
    {
        return response()->json(Office::all());
    }

    public function history(Request $request)
    {
        $user = $request->user();
        
        $attendances = Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($attendances);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $attendance = Attendance::where('id', $id)->first();

        if (!$attendance) {
            return response()->json(['message' => 'Data tidak ditemukan.'], 404);
        }

        // Staff hanya bisa lihat miliknya; supervisor/admin bisa lihat semua
        if ($attendance->user_id !== $user->id && !$user->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($attendance);
    }

    public function updateOfficeCoordinates(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_meters' => 'nullable|integer|min:10|max:5000',
            'name' => 'nullable|string|max:255',
            'work_start' => 'nullable|date_format:H:i',
            'work_end' => 'nullable|date_format:H:i',
        ]);

        // Validasi: work_start harus sebelum work_end
        if ($request->filled('work_start') && $request->filled('work_end') && $request->work_start >= $request->work_end) {
            return response()->json([
                'message' => 'Jam masuk harus lebih awal dari jam keluar.'
            ], 422);
        }

        $office = Office::first();
        if (!$office) {
            $office = new Office();
            $office->name = 'Kantor';
        }

        if ($request->filled('name')) {
            $office->name = $request->name;
        }
        $office->latitude = $request->latitude;
        $office->longitude = $request->longitude;
        if ($request->filled('radius_meters')) {
            $office->radius_meters = $request->radius_meters;
        }
        if ($request->filled('work_start')) {
            $office->work_start = $request->work_start;
        }
        if ($request->filled('work_end')) {
            $office->work_end = $request->work_end;
        }
        $office->save();

        return response()->json([
            'message' => 'Lokasi kantor berhasil disimpan.',
            'office' => $office
        ]);
    }

    // Supervisor/Manager: ringkasan absensi semua karyawan pada tanggal tertentu
    public function teamToday(Request $request)
    {
        if (!$request->user()->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $date   = $request->query('date', Carbon::today()->toDateString());
        $office = Office::first();
        $rawThreshold   = $office->work_start ?? '08:00:00';
        $lateThreshold  = strlen($rawThreshold) === 5 ? $rawThreshold . ':00' : $rawThreshold;

        $orgId = app(\App\Support\TenantContext::class)->id();

        $users = User::with(['role', 'attendances' => function ($q) use ($date) {
            $q->where('date', $date);
        }])->when($orgId, fn ($q) => $q->where('organization_id', $orgId))
          ->whereHas('role', fn($q) => $q->whereNotIn('name', ['superadmin', 'org_admin', 'platform_superadmin']))
          ->orderBy('name')
          ->get();

        $employees = $users->map(function ($u) use ($lateThreshold) {
            $att = $u->attendances->first();
            $attStatus = 'absent';
            if ($att) {
                $attStatus = ($att->check_in && $att->check_in > $lateThreshold) ? 'late' : 'present';
                if ($att->check_out) $attStatus = ($att->check_in > $lateThreshold) ? 'late' : 'present';
            }
            return [
                'id'          => $u->id,
                'name'        => $u->name,
                'employee_id' => $u->employee_id,
                'department'  => $u->department,
                'job_title'   => $u->job_title,
                'role'        => $u->role?->name,
                'attendance'  => $att ? [
                    'id'         => $att->id,
                    'check_in'   => $att->check_in,
                    'check_out'  => $att->check_out,
                    'image_in'   => $att->image_in,
                    'image_out'  => $att->image_out,
                    'latitude_in'  => $att->latitude_in,
                    'longitude_in' => $att->longitude_in,
                    'status'     => $attStatus,
                ] : null,
                'status'      => $attStatus,
            ];
        });

        $present = $employees->whereIn('status', ['present'])->count();
        $late    = $employees->where('status', 'late')->count();
        $absent  = $employees->where('status', 'absent')->count();
        $checkedOut = $employees->filter(fn($e) => $e['attendance'] && $e['attendance']['check_out'])->count();

        return response()->json([
            'date'     => $date,
            'summary'  => [
                'total'       => $employees->count(),
                'present'     => $present,
                'late'        => $late,
                'absent'      => $absent,
                'checked_out' => $checkedOut,
            ],
            'employees' => $employees->values(),
        ]);
    }

    // Supervisor/Manager: list semua attendance dengan filter tanggal & search nama
    public function teamList(Request $request)
    {
        if (!$request->user()->hasPermission('attendance.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $date   = $request->query('date', Carbon::today()->toDateString());
        $search = $request->query('search', '');
        $office = Office::first();
        $rawThreshold  = $office->work_start ?? '08:00:00';
        $lateThreshold = strlen($rawThreshold) === 5 ? $rawThreshold . ':00' : $rawThreshold;

        $query = Attendance::with('user:id,name,employee_id,department,job_title')
            ->where('date', $date)
            ->whereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('check_in', 'asc');

        $records = $query->get()->map(function ($a) use ($lateThreshold) {
            $late = $a->check_in && $a->check_in > $lateThreshold;
            return [
                'id'         => $a->id,
                'date'       => $a->date,
                'check_in'   => $a->check_in,
                'check_out'  => $a->check_out,
                'status'     => $late ? 'late' : $a->status,
                'user'       => $a->user ? [
                    'id'          => $a->user->id,
                    'name'        => $a->user->name,
                    'employee_id' => $a->user->employee_id,
                    'department'  => $a->user->department,
                    'job_title'   => $a->user->job_title,
                ] : null,
            ];
        });

        return response()->json(['date' => $date, 'records' => $records]);
    }

    private function isPointInPolygon($latitude, $longitude, $polygon)
    {
        if (empty($polygon) || !is_array($polygon)) {
            return false;
        }

        $inside = false;
        $numVertices = count($polygon);
        $x = (float) $longitude;
        $y = (float) $latitude;

        for ($i = 0, $j = $numVertices - 1; $i < $numVertices; $j = $i++) {
            $vertexI = $polygon[$i];
            $vertexJ = $polygon[$j];

            $xi = 0.0;
            $yi = 0.0;
            $xj = 0.0;
            $yj = 0.0;

            if (is_array($vertexI)) {
                $xi = (float) (isset($vertexI['lng']) ? $vertexI['lng'] : (isset($vertexI['longitude']) ? $vertexI['longitude'] : 0));
                $yi = (float) (isset($vertexI['lat']) ? $vertexI['lat'] : (isset($vertexI['latitude']) ? $vertexI['latitude'] : 0));
            } elseif (is_object($vertexI)) {
                $xi = (float) (isset($vertexI->lng) ? $vertexI->lng : (isset($vertexI->longitude) ? $vertexI->longitude : 0));
                $yi = (float) (isset($vertexI->lat) ? $vertexI->lat : (isset($vertexI->latitude) ? $vertexI->latitude : 0));
            }

            if (is_array($vertexJ)) {
                $xj = (float) (isset($vertexJ['lng']) ? $vertexJ['lng'] : (isset($vertexJ['longitude']) ? $vertexJ['longitude'] : 0));
                $yj = (float) (isset($vertexJ['lat']) ? $vertexJ['lat'] : (isset($vertexJ['latitude']) ? $vertexJ['latitude'] : 0));
            } elseif (is_object($vertexJ)) {
                $xj = (float) (isset($vertexJ->lng) ? $vertexJ->lng : (isset($vertexJ->longitude) ? $vertexJ->longitude : 0));
                $yj = (float) (isset($vertexJ->lat) ? $vertexJ->lat : (isset($vertexJ->latitude) ? $vertexJ->latitude : 0));
            }

            $intersect = (($yi > $y) != ($yj > $y))
                && ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi + 0.000000001) + $xi);
            
            if ($intersect) {
                $inside = !$inside;
            }
        }

        return $inside;
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // Earth radius in meters

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c; // returns distance in meters
    }

    private function saveBase64Image($base64String, $prefix)
    {
        if (!$base64String) {
            return null;
        }

        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            $data = substr($base64String, strpos($base64String, ',') + 1);
            $type = strtolower($type[1]); // jpg, jpeg, png, etc.

            if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
                return null;
            }

            $data = base64_decode($data);
            if ($data === false) {
                return null;
            }

            $fileName = $prefix . '_' . uniqid() . '.' . $type;
            $directory = 'attendances';

            \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory($directory);
            \Illuminate\Support\Facades\Storage::disk('public')->put($directory . '/' . $fileName, $data);

            return 'storage/attendances/' . $fileName;
        }

        return null;
    }
}
