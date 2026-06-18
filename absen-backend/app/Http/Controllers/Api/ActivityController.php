<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Activity;
use Illuminate\Support\Carbon;

class ActivityController extends Controller
{
    /**
     * List activities for the user, optionally filtered by period.
     * Query params:
     *   view = daily | weekly | monthly (relative to `date`, default today)
     *   date = anchor date (Y-m-d), defaults to today
     *   start, end = explicit date range (overrides view)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Activity::where('user_id', $user->id);

        [$start, $end] = $this->resolveRange($request);
        if ($start && $end) {
            $query->whereBetween('activity_date', [$start->toDateString(), $end->toDateString()]);
        }

        $activities = $query
            ->orderBy('activity_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json($activities);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $activity = Activity::where('user_id', $user->id)->where('id', $id)->first();

        if (!$activity) {
            return response()->json(['message' => 'Aktivitas tidak ditemukan.'], 404);
        }

        return response()->json($activity);
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        $view = $request->get('view', 'weekly');
        [$start, $end] = $this->resolveRange($request);

        $activities = Activity::where('user_id', $user->id)
            ->whereBetween('activity_date', [$start->toDateString(), $end->toDateString()])
            ->get();

        $totalMinutes = (int) $activities->sum('duration_minutes');
        $workDays = $activities->pluck('activity_date')->map(fn ($d) => (string) $d)->unique()->count();
        $avgDailyMinutes = $workDays > 0 ? (int) round($totalMinutes / $workDays) : 0;

        // Regular vs overtime split: anything beyond 8h/day counts as overtime.
        $regularMinutes = 0;
        $overtimeMinutes = 0;
        $perDay = $activities->groupBy(fn ($a) => (string) $a->activity_date);
        foreach ($perDay as $dayActivities) {
            $dayMinutes = (int) $dayActivities->sum('duration_minutes');
            $regularMinutes += min($dayMinutes, 480);
            $overtimeMinutes += max($dayMinutes - 480, 0);
        }

        $weeklyGoalMinutes = 40 * 60;

        return response()->json([
            'view' => $view,
            'period_start' => $start->toDateString(),
            'period_end' => $end->toDateString(),
            'total_minutes' => $totalMinutes,
            'work_days' => $workDays,
            'avg_daily_minutes' => $avgDailyMinutes,
            'regular_minutes' => $regularMinutes,
            'overtime_minutes' => $overtimeMinutes,
            'activities_count' => $activities->count(),
            'weekly_goal_minutes' => $weeklyGoalMinutes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'project' => 'nullable|string|max:255',
            'project_color' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:50',
            'activity_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'description' => 'nullable|string',
        ]);

        $user = $request->user();
        $duration = $this->durationMinutes($request->start_time, $request->end_time);

        if ($duration <= 0) {
            return response()->json(['message' => 'Jam selesai harus setelah jam mulai.'], 422);
        }

        $activity = Activity::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'project' => $request->project,
            'project_color' => $request->project_color ?? 'primary',
            'category' => $request->category ?? 'development',
            'activity_date' => $request->activity_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_minutes' => $duration,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Aktivitas berhasil disimpan.',
            'activity' => $activity,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $activity = Activity::where('user_id', $user->id)->where('id', $id)->first();

        if (!$activity) {
            return response()->json(['message' => 'Aktivitas tidak ditemukan.'], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'project' => 'nullable|string|max:255',
            'project_color' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:50',
            'activity_date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required',
            'end_time' => 'sometimes|required',
            'description' => 'nullable|string',
        ]);

        $data = $request->only([
            'title', 'project', 'project_color', 'category',
            'activity_date', 'start_time', 'end_time', 'description',
        ]);

        $start = $request->start_time ?? $activity->start_time;
        $end = $request->end_time ?? $activity->end_time;
        $data['duration_minutes'] = $this->durationMinutes($start, $end);

        $activity->update($data);

        return response()->json([
            'message' => 'Aktivitas berhasil diperbarui.',
            'activity' => $activity,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $activity = Activity::where('user_id', $user->id)->where('id', $id)->first();

        if (!$activity) {
            return response()->json(['message' => 'Aktivitas tidak ditemukan.'], 404);
        }

        $activity->delete();

        return response()->json(['message' => 'Aktivitas berhasil dihapus.']);
    }

    private function resolveRange(Request $request): array
    {
        if ($request->filled('start') && $request->filled('end')) {
            return [Carbon::parse($request->start)->startOfDay(), Carbon::parse($request->end)->endOfDay()];
        }

        $anchor = $request->filled('date') ? Carbon::parse($request->date) : Carbon::now();
        $view = $request->get('view', 'daily');

        return match ($view) {
            'weekly' => [$anchor->copy()->startOfWeek(Carbon::SUNDAY), $anchor->copy()->endOfWeek(Carbon::SATURDAY)],
            'monthly' => [$anchor->copy()->startOfMonth(), $anchor->copy()->endOfMonth()],
            default => [$anchor->copy()->startOfDay(), $anchor->copy()->endOfDay()],
        };
    }

    private function durationMinutes($start, $end): int
    {
        $s = Carbon::parse($start);
        $e = Carbon::parse($end);
        return $e->greaterThan($s) ? $s->diffInMinutes($e) : 0;
    }
}
