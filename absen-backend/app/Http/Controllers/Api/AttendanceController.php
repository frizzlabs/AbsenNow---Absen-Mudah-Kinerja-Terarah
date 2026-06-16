<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Attendance;
use App\Models\Office;
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

        if (!$attendance) {
            return response()->json([
                'state' => 'default'
            ]);
        }

        if ($attendance->check_in && !$attendance->check_out) {
            return response()->json([
                'state' => 'checked_in',
                'attendance' => $attendance
            ]);
        }

        return response()->json([
            'state' => 'completed',
            'attendance' => $attendance
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

        // Record attendance
        $imagePath = $this->saveBase64Image($request->image, 'in');

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'office_id' => $office->id,
            'date' => $today,
            'check_in' => Carbon::now()->toTimeString(),
            'latitude_in' => $request->latitude,
            'longitude_in' => $request->longitude,
            'image_in' => $imagePath,
            'status' => 'present',
        ]);

        return response()->json([
            'message' => 'Check-in berhasil.',
            'attendance' => $attendance
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

    public function updateOfficeCoordinates(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $office = Office::first();
        if ($office) {
            $office->name = 'Kantor (Lokasi GPS Aktif)';
            $office->latitude = $request->latitude;
            $office->longitude = $request->longitude;
            $office->save();

            return response()->json([
                'message' => 'Lokasi kantor berhasil diperbarui ke lokasi Anda saat ini.',
                'office' => $office
            ]);
        }

        return response()->json([
            'message' => 'Office not found.'
        ], 404);
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
