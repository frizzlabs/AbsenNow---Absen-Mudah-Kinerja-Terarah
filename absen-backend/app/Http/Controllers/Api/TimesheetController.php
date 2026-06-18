<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Activity;
use App\Models\Timesheet;
use App\Models\TimesheetEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TimesheetController extends Controller
{
    /**
     * List submitted timesheets (weeks), optionally filtered by month.
     * Query params: month (1-12), year.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Timesheet::where('user_id', $user->id);

        if ($request->filled('year')) {
            $query->whereYear('week_start_date', $request->year);
        }
        if ($request->filled('month')) {
            $query->whereMonth('week_start_date', $request->month);
        }

        $timesheets = $query->orderBy('week_start_date', 'desc')->get();

        return response()->json($timesheets);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $timesheet = Timesheet::with(['events', 'activities'])
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$timesheet) {
            return response()->json(['message' => 'Timesheet tidak ditemukan.'], 404);
        }

        return response()->json($timesheet);
    }

    /**
     * Submit a week's activities as a timesheet for approval.
     * Body: week_start (Y-m-d). The week runs Sunday..Saturday from that date.
     */
    public function store(Request $request)
    {
        $request->validate([
            'week_start' => 'required|date',
        ]);

        $user = $request->user();
        $weekStart = Carbon::parse($request->week_start)->startOfWeek(Carbon::SUNDAY);
        $weekEnd = $weekStart->copy()->endOfWeek(Carbon::SATURDAY);

        $activities = Activity::where('user_id', $user->id)
            ->whereBetween('activity_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->get();

        if ($activities->isEmpty()) {
            return response()->json([
                'message' => 'Tidak ada aktivitas pada minggu ini untuk dikirim.'
            ], 422);
        }

        $totalMinutes = (int) $activities->sum('duration_minutes');

        $timesheet = DB::transaction(function () use ($user, $weekStart, $weekEnd, $activities, $totalMinutes) {
            $timesheet = Timesheet::updateOrCreate(
                ['user_id' => $user->id, 'week_start_date' => $weekStart->toDateString()],
                [
                    'week_end_date' => $weekEnd->toDateString(),
                    'total_minutes' => $totalMinutes,
                    'activities_count' => $activities->count(),
                    'status' => 'pending',
                    'submitted_at' => now(),
                    'reviewer_note' => null,
                ]
            );

            // Link the week's activities to this timesheet
            Activity::whereIn('id', $activities->pluck('id'))
                ->update(['timesheet_id' => $timesheet->id]);

            TimesheetEvent::create([
                'timesheet_id' => $timesheet->id,
                'status' => 'Submitted',
                'actor_name' => $user->name,
                'note' => 'Timesheet submitted for approval.',
            ]);

            return $timesheet;
        });

        return response()->json([
            'message' => 'Timesheet berhasil dikirim.',
            'timesheet' => $timesheet->load(['events', 'activities']),
        ], 201);
    }

    /**
     * Resubmit a timesheet that was sent back for revision.
     */
    public function resubmit(Request $request, $id)
    {
        $user = $request->user();
        $timesheet = Timesheet::where('user_id', $user->id)->where('id', $id)->first();

        if (!$timesheet) {
            return response()->json(['message' => 'Timesheet tidak ditemukan.'], 404);
        }

        if (!in_array($timesheet->status, ['revision', 'rejected'])) {
            return response()->json([
                'message' => 'Hanya timesheet yang diminta revisi yang dapat dikirim ulang.'
            ], 422);
        }

        // Recalculate totals from current activities in case they were edited
        $activities = Activity::where('user_id', $user->id)
            ->whereBetween('activity_date', [$timesheet->week_start_date, $timesheet->week_end_date])
            ->get();

        $timesheet->update([
            'status' => 'pending',
            'total_minutes' => (int) $activities->sum('duration_minutes'),
            'activities_count' => $activities->count(),
            'submitted_at' => now(),
            'reviewer_note' => null,
        ]);

        TimesheetEvent::create([
            'timesheet_id' => $timesheet->id,
            'status' => 'Resubmitted',
            'actor_name' => $user->name,
            'note' => 'Timesheet resubmitted after revision.',
        ]);

        return response()->json([
            'message' => 'Timesheet berhasil dikirim ulang.',
            'timesheet' => $timesheet->load(['events', 'activities']),
        ]);
    }
}
